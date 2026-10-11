import { Module } from "@nestjs/common";
import { DatabaseModule } from "../database/database.module";
import { AuthModule } from "../auth/auth.module";
import { JourneyService } from "./journey.service";
import { JourneyController } from "./journey.controller";
@Module({ imports: [DatabaseModule, AuthModule], providers: [JourneyService], controllers: [JourneyController] })
export class JourneyModule {}
