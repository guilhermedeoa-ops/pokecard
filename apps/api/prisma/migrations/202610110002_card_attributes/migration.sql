-- Prompt 01: additive card attributes; preserve all existing instances.
CREATE TYPE "CardOrigin" AS ENUM ('STARTER_PACK','POKEMON_PACK','CAUGHT');
CREATE TYPE "PokemonNature" AS ENUM ('HARDY','LONELY','BRAVE','ADAMANT','NAUGHTY','BOLD','DOCILE','RELAXED','IMPISH','LAX','TIMID','HASTY','SERIOUS','JOLLY','NAIVE','MODEST','MILD','QUIET','BASHFUL','RASH','CALM','GENTLE','SASSY','CAREFUL','QUIRKY');
ALTER TABLE "PokemonInstance" ADD COLUMN "origin" "CardOrigin" NOT NULL DEFAULT 'STARTER_PACK', ADD COLUMN "ivs" JSONB NOT NULL DEFAULT '{"hp":0,"attack":0,"defense":0,"specialAttack":0,"specialDefense":0,"speed":0}', ADD COLUMN "evs" JSONB NOT NULL DEFAULT '{"hp":0,"attack":0,"defense":0,"specialAttack":0,"specialDefense":0,"speed":0}', ADD COLUMN "nature" "PokemonNature" NOT NULL DEFAULT 'HARDY', ADD COLUMN "activeAbility" TEXT;
UPDATE "PokemonInstance" p SET "activeAbility" = p."abilities"[1] WHERE array_length(p."abilities",1)>0;
-- Historical non-starter instances must not be silently assigned a false origin.
DO $$ BEGIN IF EXISTS (SELECT 1 FROM "PokemonInstance" p WHERE NOT EXISTS (SELECT 1 FROM "StarterSelection" s WHERE s."cardId"=p."id")) THEN RAISE EXCEPTION 'Card origin migration requires manual classification of non-starter instances'; END IF; END $$;
