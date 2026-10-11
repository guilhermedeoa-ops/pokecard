import { BadRequestException, ConflictException, Injectable, UnauthorizedException } from "@nestjs/common";
import { AccountTokenPurpose, Prisma, User } from "@prisma/client";
import { createHash, randomBytes } from "node:crypto";
import * as argon2 from "argon2";
import { PrismaService } from "../database/prisma.service";
import { MailService } from "./mail.service";
import { RegisterDto } from "./dto";

const hash = (token: string) => createHash("sha256").update(token).digest("hex");
const randomToken = () => randomBytes(32).toString("hex");
const trainerSelect = { id: true, displayName: true, avatarUrl: true, level: true, experience: true } as const;
export const genericEmailResponse = { message: "Se a conta puder receber essa solicitação, enviaremos um e-mail com as instruções." };

@Injectable()
export class AuthService {
  private dummyHash?: Promise<string>;
  constructor(private readonly db: PrismaService, private readonly mail: MailService) {}
  private passwordHash(password: string) {
    return argon2.hash(password, { type: argon2.argon2id, memoryCost: 19456, timeCost: 2, parallelism: 1 });
  }
  private async issue(tx: Prisma.TransactionClient, user: Pick<User, "id" | "email">, purpose: AccountTokenPurpose) {
    const token = randomToken();
    await tx.accountToken.create({ data: {
      userId: user.id, purpose, tokenHash: hash(token),
      expiresAt: new Date(Date.now() + (purpose === "VERIFY_EMAIL" ? 86400000 : 1800000)),
    } });
    await this.mail.queue(tx, user.email, token, purpose);
  }
  async register(dto: RegisterDto) {
    const passwordHash = await this.passwordHash(dto.password);
    try {
      await this.db.$transaction(async tx => {
        const user = await tx.user.create({ data: {
          username: dto.username, usernameKey: dto.username.toLowerCase(),
          email: dto.email, emailKey: dto.email.toLowerCase(), passwordHash,
          trainer: { create: { displayName: dto.displayName } },
        } });
        await this.issue(tx, user, "VERIFY_EMAIL");
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
        throw new ConflictException("Não foi possível cadastrar com esses dados. Se já tem conta, tente recuperar o acesso.");
      }
      throw error;
    }
    return { message: "Conta criada. Verifique seu e-mail antes de entrar." };
  }
  async login(identifier: string, password: string) {
    const key = identifier.toLowerCase();
    const user = await this.db.user.findFirst({ where: { OR: [{ usernameKey: key }, { emailKey: key }] } });
    this.dummyHash ??= this.passwordHash(randomToken());
    const matches = await argon2.verify(user?.passwordHash ?? await this.dummyHash, password);
    if (!user || !matches || !user.emailVerifiedAt) throw new UnauthorizedException("Credenciais inválidas ou e-mail não verificado.");
    const token = randomToken();
    const expiresAt = new Date(Date.now() + 7 * 86400000);
    await this.db.$transaction(async tx => {
      // Locks the user row and rejects credentials changed during verification.
      const locked = await tx.user.updateMany({ where: { id: user.id, passwordHash: user.passwordHash }, data: { updatedAt: new Date() } });
      if (locked.count !== 1) throw new UnauthorizedException("Entre novamente com sua senha atual.");
      await tx.session.create({ data: { userId: user.id, tokenHash: hash(token), expiresAt } });
    });
    return { token, expiresAt };
  }
  async requireUser(token: unknown) {
    if (typeof token !== "string" || !/^[a-f0-9]{64}$/.test(token)) throw new UnauthorizedException("Entre para continuar.");
    const session = await this.db.session.findUnique({ where: { tokenHash: hash(token) }, include: { user: true } });
    if (!session || session.revokedAt || session.expiresAt <= new Date() || !session.user.emailVerifiedAt) throw new UnauthorizedException("Sessão inválida ou expirada.");
    return session.user;
  }
  async logout(token: unknown) {
    if (typeof token === "string") await this.db.session.updateMany({ where: { tokenHash: hash(token), revokedAt: null }, data: { revokedAt: new Date() } });
    return { message: "Você saiu da conta." };
  }
  async requestEmail(email: string, purpose: AccountTokenPurpose) {
    const user = await this.db.user.findUnique({ where: { emailKey: email.toLowerCase() } });
    if (user && (purpose === "RESET_PASSWORD" || !user.emailVerifiedAt)) {
      await this.db.$transaction(async tx => {
        await tx.user.update({ where: { id: user.id }, data: { updatedAt: new Date() } });
        await this.issue(tx, user, purpose);
      });
    }
    return genericEmailResponse;
  }
  async consume(token: string, purpose: AccountTokenPurpose, password?: string) {
    const record = await this.db.accountToken.findUnique({ where: { tokenHash: hash(token) } });
    if (!record || record.purpose !== purpose) throw new BadRequestException("Link inválido ou expirado.");
    const passwordHash = password === undefined ? undefined : await this.passwordHash(password);
    await this.db.$transaction(async tx => {
      // All account token consumers lock the same user first, serializing resets and login.
      await tx.user.update({ where: { id: record.userId }, data: { updatedAt: new Date() } });
      const now = new Date();
      const claimed = await tx.accountToken.updateMany({
        where: { id: record.id, purpose, consumedAt: null, expiresAt: { gt: now } },
        data: { consumedAt: now },
      });
      if (claimed.count !== 1) throw new BadRequestException("Link inválido ou expirado.");
      if (purpose === "VERIFY_EMAIL") {
        await tx.user.update({ where: { id: record.userId }, data: { emailVerifiedAt: now } });
      } else {
        if (!passwordHash) throw new BadRequestException("Nova senha obrigatória.");
        await tx.user.update({ where: { id: record.userId }, data: { passwordHash } });
        await tx.session.updateMany({ where: { userId: record.userId, revokedAt: null }, data: { revokedAt: now } });
      }
      await tx.accountToken.updateMany({ where: { userId: record.userId, purpose, consumedAt: null }, data: { consumedAt: now } });
    });
    return { message: purpose === "VERIFY_EMAIL" ? "E-mail confirmado. Você já pode entrar." : "Senha atualizada. Entre novamente." };
  }
  async profile(token: unknown) {
    const user = await this.requireUser(token);
    return { username: user.username, email: user.email, trainer: await this.db.trainer.findUniqueOrThrow({ where: { userId: user.id }, select: trainerSelect }) };
  }
  async updateTrainer(token: unknown, displayName: string) {
    const user = await this.requireUser(token);
    return this.db.trainer.update({ where: { userId: user.id }, data: { displayName }, select: trainerSelect });
  }
}
