import { Module } from "@nestjs/common";
import { DatabaseModule } from "../database/database.module";
import { AuthService } from "./auth.service";
import { AuthController, TrainerController } from "./auth.controller";
import { MailService } from "./mail.service";
@Module({
  imports: [DatabaseModule],
  providers: [AuthService, MailService],
  controllers: [AuthController, TrainerController],
})
export class AuthModule {}
