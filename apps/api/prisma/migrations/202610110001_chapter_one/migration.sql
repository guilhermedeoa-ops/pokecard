CREATE TYPE "DexStatus" AS ENUM ('SEEN','CAPTURED');
CREATE TABLE "Location" ("id" TEXT PRIMARY KEY, "name" TEXT NOT NULL);
INSERT INTO "Location" ("id","name") VALUES ('pallet-town','Pallet Town'),('route-1','Rota 1'),('viridian-city','Viridian City');
ALTER TABLE "Trainer" ADD COLUMN "locationId" TEXT NOT NULL DEFAULT 'pallet-town', ADD COLUMN "pokedollars" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "Trainer" ADD CONSTRAINT "Trainer_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "Location"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Trainer" ADD CONSTRAINT "Trainer_pokedollars_nonnegative" CHECK ("pokedollars" >= 0);
CREATE TABLE "PokemonSpecies" (
 "id" INTEGER PRIMARY KEY, "name" TEXT NOT NULL, "types" TEXT[], "baseStats" JSONB NOT NULL,
 "abilities" TEXT[], "moves" TEXT[], "imageUrl" TEXT NOT NULL, "imagePlaceholder" BOOLEAN NOT NULL DEFAULT true
);
CREATE TABLE "PackDefinition" ("id" TEXT PRIMARY KEY, "name" TEXT NOT NULL, "element" TEXT NOT NULL, "speciesId" INTEGER NOT NULL);
CREATE TABLE "PokemonInstance" (
 "id" UUID PRIMARY KEY, "speciesId" INTEGER NOT NULL, "ownerId" UUID NOT NULL, "originalTrainerId" UUID NOT NULL,
 "originalTrainerName" TEXT NOT NULL, "level" INTEGER NOT NULL DEFAULT 5, "experience" INTEGER NOT NULL DEFAULT 0,
 "hpCurrent" INTEGER NOT NULL, "stats" JSONB NOT NULL, "abilities" TEXT[], "moves" TEXT[],
 "originBall" TEXT NOT NULL DEFAULT 'POKE_BALL', "tier" TEXT NOT NULL DEFAULT 'COMMON',
 "originLocation" TEXT NOT NULL DEFAULT 'Pallet Town',
 "originDescription" TEXT NOT NULL DEFAULT 'Pokémon Inicial — Presente do Professor Oak',
 "capturedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "history" JSONB NOT NULL,
 CONSTRAINT "PokemonInstance_valid_values" CHECK ("level" >= 1 AND "experience" >= 0 AND "hpCurrent" >= 0)
);
CREATE TABLE "StarterSelection" ("trainerId" UUID PRIMARY KEY, "packId" TEXT NOT NULL, "cardId" UUID NOT NULL, "chosenAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP);
CREATE TABLE "PokedexEntry" (
 "trainerId" UUID NOT NULL, "speciesId" INTEGER NOT NULL, "status" "DexStatus" NOT NULL,
 "firstSeenAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "capturedAt" TIMESTAMP(3),
 PRIMARY KEY ("trainerId","speciesId")
);
CREATE TABLE "ItemDefinition" ("id" TEXT PRIMARY KEY, "name" TEXT NOT NULL, "category" TEXT NOT NULL);
CREATE TABLE "InventoryEntry" ("trainerId" UUID NOT NULL, "itemId" TEXT NOT NULL, "quantity" INTEGER NOT NULL DEFAULT 0, PRIMARY KEY ("trainerId","itemId"), CONSTRAINT "InventoryEntry_quantity_nonnegative" CHECK ("quantity" >= 0));
CREATE TABLE "TutorialProgress" (
 "trainerId" UUID PRIMARY KEY, "dialogIndex" INTEGER NOT NULL DEFAULT 0, "oakDone" BOOLEAN NOT NULL DEFAULT false,
 "revealed" BOOLEAN NOT NULL DEFAULT false, "detailsViewed" BOOLEAN NOT NULL DEFAULT false,
 "collectionVisited" BOOLEAN NOT NULL DEFAULT false, "dexVisited" BOOLEAN NOT NULL DEFAULT false,
 "mapVisited" BOOLEAN NOT NULL DEFAULT false, "completedAt" TIMESTAMP(3), "updatedAt" TIMESTAMP(3) NOT NULL
);
CREATE TABLE "PlayerLocationUnlock" ("trainerId" UUID NOT NULL, "locationId" TEXT NOT NULL, "unlockedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, PRIMARY KEY ("trainerId","locationId"));
CREATE TABLE "RewardGrant" ("trainerId" UUID NOT NULL, "key" TEXT NOT NULL, "grantedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, PRIMARY KEY ("trainerId","key"));
CREATE INDEX "PokemonInstance_ownerId_idx" ON "PokemonInstance"("ownerId");
CREATE INDEX "PokemonInstance_speciesId_idx" ON "PokemonInstance"("speciesId");
CREATE UNIQUE INDEX "StarterSelection_cardId_key" ON "StarterSelection"("cardId");
ALTER TABLE "PackDefinition" ADD CONSTRAINT "PackDefinition_speciesId_fkey" FOREIGN KEY ("speciesId") REFERENCES "PokemonSpecies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "PokemonInstance" ADD CONSTRAINT "PokemonInstance_speciesId_fkey" FOREIGN KEY ("speciesId") REFERENCES "PokemonSpecies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "PokemonInstance" ADD CONSTRAINT "PokemonInstance_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "Trainer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "PokemonInstance" ADD CONSTRAINT "PokemonInstance_originalTrainerId_fkey" FOREIGN KEY ("originalTrainerId") REFERENCES "Trainer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "StarterSelection" ADD CONSTRAINT "StarterSelection_trainerId_fkey" FOREIGN KEY ("trainerId") REFERENCES "Trainer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "StarterSelection" ADD CONSTRAINT "StarterSelection_packId_fkey" FOREIGN KEY ("packId") REFERENCES "PackDefinition"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "StarterSelection" ADD CONSTRAINT "StarterSelection_cardId_fkey" FOREIGN KEY ("cardId") REFERENCES "PokemonInstance"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "PokedexEntry" ADD CONSTRAINT "PokedexEntry_trainerId_fkey" FOREIGN KEY ("trainerId") REFERENCES "Trainer"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "PokedexEntry" ADD CONSTRAINT "PokedexEntry_speciesId_fkey" FOREIGN KEY ("speciesId") REFERENCES "PokemonSpecies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "InventoryEntry" ADD CONSTRAINT "InventoryEntry_trainerId_fkey" FOREIGN KEY ("trainerId") REFERENCES "Trainer"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "InventoryEntry" ADD CONSTRAINT "InventoryEntry_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "ItemDefinition"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "TutorialProgress" ADD CONSTRAINT "TutorialProgress_trainerId_fkey" FOREIGN KEY ("trainerId") REFERENCES "Trainer"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "PlayerLocationUnlock" ADD CONSTRAINT "PlayerLocationUnlock_trainerId_fkey" FOREIGN KEY ("trainerId") REFERENCES "Trainer"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "PlayerLocationUnlock" ADD CONSTRAINT "PlayerLocationUnlock_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "Location"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "RewardGrant" ADD CONSTRAINT "RewardGrant_trainerId_fkey" FOREIGN KEY ("trainerId") REFERENCES "Trainer"("id") ON DELETE CASCADE ON UPDATE CASCADE;
