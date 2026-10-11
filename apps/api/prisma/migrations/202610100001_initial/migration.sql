CREATE TYPE "AccountTokenPurpose" AS ENUM ('VERIFY_EMAIL', 'RESET_PASSWORD');
CREATE TABLE "User" (
  "id" UUID NOT NULL, "username" VARCHAR(32) NOT NULL, "usernameKey" VARCHAR(32) NOT NULL,
  "email" VARCHAR(254) NOT NULL, "emailKey" VARCHAR(254) NOT NULL, "passwordHash" VARCHAR(255) NOT NULL,
  "emailVerifiedAt" TIMESTAMP(3), "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL, CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "Trainer" (
  "id" UUID NOT NULL, "userId" UUID NOT NULL, "displayName" VARCHAR(32) NOT NULL, "avatarUrl" TEXT,
  "level" INTEGER NOT NULL DEFAULT 1, "experience" INTEGER NOT NULL DEFAULT 0, "onboardingAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Trainer_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "Session" (
  "id" UUID NOT NULL, "userId" UUID NOT NULL, "tokenHash" VARCHAR(64) NOT NULL,
  "expiresAt" TIMESTAMP(3) NOT NULL, "revokedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "AccountToken" (
  "id" UUID NOT NULL, "userId" UUID NOT NULL, "purpose" "AccountTokenPurpose" NOT NULL,
  "tokenHash" VARCHAR(64) NOT NULL, "expiresAt" TIMESTAMP(3) NOT NULL, "consumedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, CONSTRAINT "AccountToken_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "EmailDelivery" (
  "id" UUID NOT NULL, "payload" TEXT NOT NULL, "attempts" INTEGER NOT NULL DEFAULT 0,
  "nextAttemptAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "leaseUntil" TIMESTAMP(3), "sentAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, CONSTRAINT "EmailDelivery_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "User_usernameKey_key" ON "User"("usernameKey");
CREATE UNIQUE INDEX "User_emailKey_key" ON "User"("emailKey");
CREATE UNIQUE INDEX "Trainer_userId_key" ON "Trainer"("userId");
CREATE UNIQUE INDEX "Session_tokenHash_key" ON "Session"("tokenHash");
CREATE INDEX "Session_userId_idx" ON "Session"("userId");
CREATE INDEX "Session_expiresAt_idx" ON "Session"("expiresAt");
CREATE UNIQUE INDEX "AccountToken_tokenHash_key" ON "AccountToken"("tokenHash");
CREATE INDEX "AccountToken_userId_purpose_idx" ON "AccountToken"("userId", "purpose");
CREATE INDEX "AccountToken_expiresAt_idx" ON "AccountToken"("expiresAt");
CREATE INDEX "EmailDelivery_sentAt_nextAttemptAt_idx" ON "EmailDelivery"("sentAt", "nextAttemptAt");
ALTER TABLE "Trainer" ADD CONSTRAINT "Trainer_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "AccountToken" ADD CONSTRAINT "AccountToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
