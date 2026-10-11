import { randomUUID } from "node:crypto";
import assert from "node:assert/strict";
import { test } from "node:test";
import { PrismaClient } from "@prisma/client";

test("database enforces account identity, trainer ownership and token cleanup", async () => {
  // Run only against a disposable database, never production.
  assert.ok(process.env.DATABASE_URL?.includes("/pokecard_test"), "Use pokecard_test database");
  const db = new PrismaClient();
  const suffix = randomUUID().replaceAll("-", "").slice(0, 12);
  const usernameKey = `trainer_${suffix}`;
  let userId: string | undefined;
  try {
    const user = await db.user.create({ data: {
      username: usernameKey, usernameKey,
      email: `${suffix}@example.test`, emailKey: `${suffix}@example.test`,
      passwordHash: "test-fixture-not-a-real-password",
      trainer: { create: { displayName: "Trainer" } },
      sessions: { create: { tokenHash: randomUUID(), expiresAt: new Date(Date.now() + 60000) } },
      tokens: { create: { purpose: "VERIFY_EMAIL", tokenHash: randomUUID(), expiresAt: new Date(Date.now() + 60000) } },
    }, include: { trainer: true } });
    userId = user.id;
    assert.equal(user.trainer?.level, 1);
    await assert.rejects(db.user.create({ data: {
      username: usernameKey, usernameKey,
      email: `other_${suffix}@example.test`, emailKey: `other_${suffix}@example.test`,
      passwordHash: "test-fixture",
    } }), { code: "P2002" });
    await assert.rejects(db.user.create({ data: {
      username: `other_${suffix}`, usernameKey: `other_${suffix}`,
      email: user.email, emailKey: user.emailKey, passwordHash: "test-fixture",
    } }), { code: "P2002" });
    await assert.rejects(db.trainer.create({ data: { userId: user.id, displayName: "Second" } }), { code: "P2002" });
    await db.user.delete({ where: { id: user.id } });
    assert.equal(await db.trainer.count({ where: { userId: user.id } }), 0);
    assert.equal(await db.session.count({ where: { userId: user.id } }), 0);
    assert.equal(await db.accountToken.count({ where: { userId: user.id } }), 0);
    userId = undefined;
  } finally {
    if (userId) await db.user.deleteMany({ where: { id: userId } });
    await db.$disconnect();
  }
});
