import "reflect-metadata";
import { randomUUID, createHash, createDecipheriv } from "node:crypto";
import { setTimeout as delay } from "node:timers/promises";
import assert from "node:assert/strict";
import { test } from "node:test";
import * as argon2 from "argon2";
import { createApp } from "../src/create-app";
import { PrismaService } from "../src/database/prisma.service";
import { MailService } from "../src/auth/mail.service";

test("HTTP account lifecycle, authorization, email delivery and single-use tokens", async () => {
  assert.ok(process.env.DATABASE_URL?.includes("/pokecard_test"), "Use a disposable test database");
  const app = await createApp();
  await app.listen(0, "127.0.0.1");
  const url = await app.getUrl();
  const db = app.get(PrismaService);
  app.get(MailService).onModuleDestroy(); // Deterministic delivery: flush explicitly below.
  const suffix = randomUUID().replaceAll("-", "").slice(0, 12);
  const username = "player_" + suffix;
  const email = suffix + "@example.test";
  const password = "Correct horse battery staple!";
  const start = new Date();
  const call = (path: string, body?: unknown, cookie?: string, method?: string, origin = "http://localhost:3000") =>
    fetch(url + "/api" + path, {
      method: method ?? (body === undefined ? "GET" : "POST"),
      headers: { "Content-Type": "application/json", Origin: origin, ...(cookie ? { Cookie: cookie } : {}) },
      ...(body === undefined ? {} : { body: JSON.stringify(body) }),
    });
  const tokenFixture = async (purpose: "VERIFY_EMAIL" | "RESET_PASSWORD", expiry = Date.now() + 60000) => {
    const user = await db.user.findUniqueOrThrow({ where: { emailKey: email } });
    const token = createHash("sha256").update(randomUUID()).digest("hex");
    await db.accountToken.create({ data: {
      userId: user.id, purpose, tokenHash: createHash("sha256").update(token).digest("hex"), expiresAt: new Date(expiry),
    } });
    return token;
  };
  try {
    assert.equal((await call("/auth/me")).status, 401);
    assert.equal((await call("/auth/register", { username, email, password, displayName: "Ash" }, undefined, undefined, "https://evil.example")).status, 403);
    assert.equal((await call("/auth/register", { username, email, password: "short", displayName: "Ash" })).status, 400);
    assert.equal((await call("/auth/register", { username, email, password, displayName: "Ash", level: 99 })).status, 400);
    assert.equal((await call("/auth/register", { username, email, password, displayName: "Ash" })).status, 201);
    const user = await db.user.findUniqueOrThrow({ where: { emailKey: email }, include: { trainer: true } });
    assert.ok(await argon2.verify(user.passwordHash, password));
    assert.notEqual(user.passwordHash, password);
    assert.equal(user.trainer?.displayName, "Ash");
    assert.equal(user.emailVerifiedAt, null);
    assert.equal((await call("/auth/register", { username: username.toUpperCase(), email: "other_" + email, password, displayName: "Other" })).status, 409);
    assert.equal((await call("/auth/register", { username: "other_" + suffix, email: email.toUpperCase(), password, displayName: "Other" })).status, 409);
    assert.equal((await call("/auth/login", { identifier: username, password })).status, 401);
    const outbox = await db.emailDelivery.findFirstOrThrow({ where: { createdAt: { gte: start } }, orderBy: { createdAt: "desc" } });
    assert.ok(!outbox.payload.includes(email));
    const [iv, tag, body] = outbox.payload.split(".");
    const decipher = createDecipheriv("aes-256-gcm", Buffer.from(process.env.MAIL_ENCRYPTION_KEY!, "hex"), Buffer.from(iv, "hex"));
    decipher.setAuthTag(Buffer.from(tag, "hex"));
    const queued = JSON.parse(Buffer.concat([decipher.update(Buffer.from(body, "hex")), decipher.final()]).toString("utf8")) as { token: string };
    const token = queued.token;
    assert.equal(await db.accountToken.count({ where: { tokenHash: token } }), 0);
    await app.get(MailService).flush();
    let delivered = false;
    for (let attempt = 0; attempt < 20; attempt++) {
      const list = await fetch("http://localhost:8025/api/v1/messages").then(r => r.json()) as {
        messages: Array<{ ID: string; To: Array<{ Address: string }> }>;
      };
      const match = list.messages.find(m => m.To.some(to => to.Address === email));
      if (match) {
        const message = await fetch("http://localhost:8025/api/v1/message/" + match.ID).then(r => r.json()) as { Text: string };
        assert.ok(message.Text.includes("/verificar#token=" + token));
        delivered = true; break;
      }
      await delay(500);
    }
    assert.ok(delivered, "Queued email must reach SMTP inbox");
    assert.equal((await call("/auth/verify-email", { token })).status, 200);
    assert.equal((await call("/auth/verify-email", { token })).status, 400);
    assert.equal((await call("/auth/login", { identifier: username, password: "incorrect" })).status, 401);
    const login = await call("/auth/login", { identifier: email.toUpperCase(), password });
    assert.equal(login.status, 200);
    const setCookie = login.headers.get("set-cookie")!;
    assert.match(setCookie, /HttpOnly/); assert.match(setCookie, /SameSite=Lax/i);
    const cookie = setCookie.split(";")[0];
    const me = await call("/auth/me", undefined, cookie);
    assert.equal(me.status, 200);
    const profile = await me.json() as Record<string, unknown>;
    assert.equal(profile.username, username);
    assert.equal(profile.passwordHash, undefined);
    assert.equal(profile.sessions, undefined);
    assert.equal((await call("/trainer/me", { displayName: "Misty", userId: randomUUID() }, cookie, "PATCH")).status, 400);
    assert.equal((await call("/trainer/me", { displayName: "Misty" }, cookie, "PATCH")).status, 200);
    assert.equal((await db.trainer.findUniqueOrThrow({ where: { userId: user.id } })).displayName, "Misty");
    const known = await call("/auth/forgot-password", { email }).then(r => r.json());
    const unknown = await call("/auth/forgot-password", { email: "unknown_" + email }).then(r => r.json());
    assert.deepEqual(known, unknown);
    const expired = await tokenFixture("RESET_PASSWORD", Date.now() - 1000);
    assert.equal((await call("/auth/reset-password", { token: expired, password })).status, 400);
    const reset = await tokenFixture("RESET_PASSWORD");
    const newPassword = "A brand new strong password!";
    const outcomes = await Promise.all([
      call("/auth/reset-password", { token: reset, password: newPassword }),
      call("/auth/reset-password", { token: reset, password: newPassword }),
    ]);
    assert.deepEqual(outcomes.map(r => r.status).sort(), [200, 400]);
    assert.equal((await call("/auth/me", undefined, cookie)).status, 401);
    assert.equal((await call("/auth/login", { identifier: username, password })).status, 401);
    const second = await call("/auth/login", { identifier: username, password: newPassword });
    assert.equal(second.status, 200);
    const newCookie = second.headers.get("set-cookie")!.split(";")[0];
    assert.equal((await call("/auth/logout", {}, newCookie)).status, 200);
    assert.equal((await call("/auth/me", undefined, newCookie)).status, 401);
    const expiredSession = createHash("sha256").update(randomUUID()).digest("hex");
    await db.session.create({ data: { userId: user.id, tokenHash: createHash("sha256").update(expiredSession).digest("hex"), expiresAt: new Date(0) } });
    assert.equal((await call("/auth/me", undefined, "pokecard_session=" + expiredSession)).status, 401);
    // Throttler works without trusting client-provided forwarded IP headers.
    let last = 0;
    for (let i = 0; i < 21; i++) last = (await call("/auth/login", { identifier: username, password: "wrong" })).status;
    assert.equal(last, 429);
  } finally {
    await db.user.deleteMany({ where: { usernameKey: { contains: suffix } } });
    await db.emailDelivery.deleteMany({ where: { createdAt: { gte: start } } });
    await app.close();
  }
});
