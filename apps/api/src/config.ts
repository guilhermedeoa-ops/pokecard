export function settings() {
  const webOrigin = new URL(process.env.WEB_ORIGIN ?? "http://localhost:3000").origin;
  const production = process.env.NODE_ENV === "production";
  const mailKey = process.env.MAIL_ENCRYPTION_KEY ?? "";
  if (!/^[a-f0-9]{64}$/i.test(mailKey)) throw new Error("MAIL_ENCRYPTION_KEY must contain 32 bytes in hex");
  if (production && (webOrigin.startsWith("http:") || /^0+$/.test(mailKey) || !process.env.SMTP_HOST)) {
    throw new Error("Production requires HTTPS, a private mail encryption key and SMTP_HOST");
  }
  return { webOrigin, production, mailKey };
}
