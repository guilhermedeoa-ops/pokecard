import "reflect-metadata";
import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix("api");
  app.enableCors({
    origin: process.env.WEB_ORIGIN ?? "http://localhost:3000",
    credentials: true,
  });
  app.enableShutdownHooks();
  await app.listen(Number(process.env.PORT ?? 3001), "127.0.0.1");
}
void bootstrap().catch((error: unknown) => {
  console.error("API startup failed", error);
  process.exitCode = 1;
});
