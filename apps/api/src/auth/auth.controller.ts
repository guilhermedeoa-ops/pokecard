import { Body, Controller, Get, HttpCode, Patch, Post, Req, Res } from "@nestjs/common";
import type { Request, Response, CookieOptions } from "express";
import { AuthService } from "./auth.service";
import { RegisterDto, LoginDto, EmailDto, TokenDto, ResetDto, TrainerDto } from "./dto";
import { settings } from "../config";

const cookieName = "pokecard_session";
const cookieOptions = (): CookieOptions => ({ httpOnly: true, secure: settings().production, sameSite: "lax", path: "/api" });
const session = (request: Request): unknown => request.cookies?.[cookieName];

@Controller("auth")
export class AuthController {
  constructor(private readonly auth: AuthService) {}
  @Post("register") register(@Body() dto: RegisterDto) { return this.auth.register(dto); }
  @Post("login") @HttpCode(200)
  async login(@Body() dto: LoginDto, @Res({ passthrough: true }) response: Response) {
    const result = await this.auth.login(dto.identifier, dto.password);
    response.cookie(cookieName, result.token, { ...cookieOptions(), expires: result.expiresAt });
    return { message: "Você entrou na conta." };
  }
  @Post("logout") @HttpCode(200)
  async logout(@Req() request: Request, @Res({ passthrough: true }) response: Response) {
    const result = await this.auth.logout(session(request));
    response.clearCookie(cookieName, cookieOptions());
    return result;
  }
  @Get("me") async me(@Req() request: Request, @Res({ passthrough: true }) response: Response) {
    response.setHeader("Cache-Control", "no-store");
    return this.auth.profile(session(request));
  }
  @Post("verify-email") @HttpCode(200) verify(@Body() dto: TokenDto) { return this.auth.consume(dto.token, "VERIFY_EMAIL"); }
  @Post("resend-verification") @HttpCode(200) resend(@Body() dto: EmailDto) { return this.auth.requestEmail(dto.email, "VERIFY_EMAIL"); }
  @Post("forgot-password") @HttpCode(200) forgot(@Body() dto: EmailDto) { return this.auth.requestEmail(dto.email, "RESET_PASSWORD"); }
  @Post("reset-password") @HttpCode(200) reset(@Body() dto: ResetDto) { return this.auth.consume(dto.token, "RESET_PASSWORD", dto.password); }
}
@Controller("trainer")
export class TrainerController {
  constructor(private readonly auth: AuthService) {}
  @Patch("me") update(@Body() dto: TrainerDto, @Req() request: Request) { return this.auth.updateTrainer(session(request), dto.displayName); }
}
