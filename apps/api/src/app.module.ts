import { Module } from "@nestjs/common";
import { APP_GUARD } from "@nestjs/core";
import { ThrottlerGuard, ThrottlerModule } from "@nestjs/throttler";
import { DatabaseModule } from "./database/database.module";
import { HealthController } from "./health/health.controller";
import { JourneyModule } from "./journey/journey.module";
import { AuthModule } from "./auth/auth.module";
import { OriginGuard } from "./auth/origin.guard";

@Module({
  imports: [DatabaseModule, AuthModule, JourneyModule, ThrottlerModule.forRoot([{ ttl: 60000, limit: 20 }])],
  controllers: [HealthController],
  providers: [
    { provide: APP_GUARD, useClass: OriginGuard },
    { provide: APP_GUARD, useClass: ThrottlerGuard },
  ],
})
export class AppModule {}
