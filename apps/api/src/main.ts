import { createApp } from "./create-app";
async function bootstrap() {
  const app = await createApp();
  await app.listen(Number(process.env.PORT ?? 3001), "127.0.0.1");
}
void bootstrap().catch(() => {
  console.error("API startup failed. Check database and configuration.");
  process.exitCode = 1;
});
