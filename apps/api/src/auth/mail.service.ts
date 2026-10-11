import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from "@nestjs/common";
import { createCipheriv, createDecipheriv, randomBytes } from "node:crypto";
import { Prisma, AccountTokenPurpose } from "@prisma/client";
import nodemailer from "nodemailer";
import { PrismaService } from "../database/prisma.service";
import { settings } from "../config";

@Injectable()
export class MailService implements OnModuleInit, OnModuleDestroy {
  private timer?: NodeJS.Timeout;
  private running = false;
  private readonly logger = new Logger(MailService.name);
  constructor(private readonly db: PrismaService) {}
  async queue(tx: Prisma.TransactionClient, email: string, token: string, purpose: AccountTokenPurpose) {
    const iv = randomBytes(12);
    const cipher = createCipheriv("aes-256-gcm", Buffer.from(settings().mailKey, "hex"), iv);
    const encrypted = Buffer.concat([cipher.update(JSON.stringify({ email, token, purpose }), "utf8"), cipher.final()]);
    const payload = [iv.toString("hex"), cipher.getAuthTag().toString("hex"), encrypted.toString("hex")].join(".");
    await tx.emailDelivery.create({ data: { payload } });
  }
  onModuleInit() {
    this.timer = setInterval(() => { void this.flush(); }, 3000);
    this.timer.unref();
  }
  onModuleDestroy() { if (this.timer) clearInterval(this.timer); }
  async flush() {
    if (this.running) return;
    this.running = true;
    try {
      const now = new Date();
      const jobs = await this.db.emailDelivery.findMany({
        where: { sentAt: null, attempts: { lt: 10 }, nextAttemptAt: { lte: now }, OR: [{ leaseUntil: null }, { leaseUntil: { lt: now } }] },
        take: 10, orderBy: { createdAt: "asc" },
      });
      for (const job of jobs) {
        const claim = await this.db.emailDelivery.updateMany({
          where: { id: job.id, sentAt: null, OR: [{ leaseUntil: null }, { leaseUntil: { lt: new Date() } }] },
          data: { leaseUntil: new Date(Date.now() + 120000), attempts: { increment: 1 } },
        });
        if (claim.count !== 1) continue;
        try {
          const [iv, tag, body] = job.payload.split(".");
          const decipher = createDecipheriv("aes-256-gcm", Buffer.from(settings().mailKey, "hex"), Buffer.from(iv, "hex"));
          decipher.setAuthTag(Buffer.from(tag, "hex"));
          const message = JSON.parse(Buffer.concat([decipher.update(Buffer.from(body, "hex")), decipher.final()]).toString("utf8")) as {
            email: string; token: string; purpose: AccountTokenPurpose;
          };
          const verify = message.purpose === "VERIFY_EMAIL";
          // Use a fragment so the token is not sent in web access logs/referrers.
          const link = settings().webOrigin + (verify ? "/verificar" : "/redefinir") + "#token=" + message.token;
          const transport = nodemailer.createTransport({
            host: process.env.SMTP_HOST ?? "localhost",
            port: Number(process.env.SMTP_PORT ?? 1025),
            secure: process.env.SMTP_SECURE === "true",
            requireTLS: settings().production,
            connectionTimeout: 10000, greetingTimeout: 10000, socketTimeout: 20000,
            ...(process.env.SMTP_USER ? { auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASSWORD } } : {}),
          });
          await transport.sendMail({
            from: process.env.MAIL_FROM ?? "Pokecard <no-reply@pokecard.local>", to: message.email,
            subject: verify ? "Confirme seu e-mail — Pokecard" : "Redefina sua senha — Pokecard",
            text: (verify ? "Confirme seu e-mail. Link válido por 24 horas: " : "Redefina sua senha. Link válido por 30 minutos: ") + link,
          });
          await this.db.emailDelivery.update({ where: { id: job.id }, data: { sentAt: new Date(), payload: "", leaseUntil: null } });
        } catch {
          await this.db.emailDelivery.update({ where: { id: job.id }, data: {
            leaseUntil: null, nextAttemptAt: new Date(Date.now() + Math.min(3600000, 30000 * 2 ** job.attempts)),
          } });
          this.logger.warn("Mail delivery failed; retry scheduled. No credentials or tokens logged.");
        }
      }
    } catch {
      this.logger.warn("Mail queue temporarily unavailable.");
    } finally { this.running = false; }
  }
}
