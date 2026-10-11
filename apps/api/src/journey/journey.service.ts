import { BadRequestException, ConflictException, Injectable } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { PrismaService } from "../database/prisma.service";
import { AuthService } from "../auth/auth.service";
import { oakMessages, packSpecies, PackId, starterStats, Stats } from "./content";
import { EventDto } from "./dto";

@Injectable()
export class JourneyService {
  constructor(private readonly db: PrismaService, private readonly auth: AuthService) {}
  async trainerId(token: unknown) {
    const user = await this.auth.requireUser(token);
    return (await this.db.trainer.findUniqueOrThrow({ where: { userId: user.id }, select: { id: true } })).id;
  }
  private async locked<T>(id: string, work: (tx: Prisma.TransactionClient) => Promise<T>) {
    return this.db.$transaction(async tx => {
      await tx.trainer.update({ where: { id }, data: { updatedAt: new Date() } });
      await tx.tutorialProgress.upsert({ where: { trainerId: id }, create: { trainerId: id }, update: {} });
      return work(tx);
    });
  }
  async state(id: string) {
    await this.db.tutorialProgress.upsert({ where: { trainerId: id }, create: { trainerId: id }, update: {} });
    const trainer = await this.db.trainer.findUniqueOrThrow({
      where: { id }, select: {
        id: true, displayName: true, locationId: true, pokedollars: true, onboardingAt: true,
        tutorial: true, starter: { include: { card: { include: {
          species: true, owner: { select: { id: true, displayName: true } },
        } } } }, unlocks: true, rewards: true,
      },
    });
    const p = trainer.tutorial!;
    const kitGranted = trainer.rewards.some(r => r.key === "STARTER_KIT");
    const phase = p.completedAt ? "COMPLETE" : !p.oakDone ? "OAK" : !trainer.starter ? "PACKS" : !p.revealed ? "REVEAL" : !p.detailsViewed ? "DETAILS" : !kitGranted ? "KIT" : "TUTORIAL";
    return {
      trainer, phase, kitGranted, oakMessages,
      packs: await this.db.packDefinition.findMany({ orderBy: { speciesId: "asc" } }),
      mission: [
        { key: "pack", text: "Escolher o Pokémon inicial", done: !!trainer.starter },
        { key: "reveal", text: "Revelar a primeira carta", done: p.revealed },
        { key: "details", text: "Visualizar os atributos", done: p.detailsViewed },
        { key: "collection", text: "Acessar Minhas Cartas", done: p.collectionVisited },
        { key: "dex", text: "Consultar a Pokédex", done: p.dexVisited },
        { key: "map", text: "Abrir o mapa de Kanto", done: p.mapVisited },
        { key: "route", text: "Desbloquear a Rota 1", done: !!p.completedAt },
      ],
    };
  }
  async advanceOak(id: string) {
    await this.locked(id, async tx => {
      const p = await tx.tutorialProgress.findUniqueOrThrow({ where: { trainerId: id } });
      if (p.oakDone) return;
      await tx.tutorialProgress.update({ where: { trainerId: id }, data: {
        dialogIndex: Math.min(p.dialogIndex + 1, oakMessages.length - 1),
        oakDone: p.dialogIndex >= oakMessages.length - 1,
      } });
    });
    return this.state(id);
  }
  async choose(id: string, packId: PackId) {
    await this.locked(id, async tx => {
      const prior = await tx.starterSelection.findUnique({ where: { trainerId: id } });
      if (prior) {
        if (prior.packId !== packId) throw new ConflictException("Seu inicial já foi escolhido. A escolha é definitiva.");
        return;
      }
      const p = await tx.tutorialProgress.findUniqueOrThrow({ where: { trainerId: id } });
      if (!p.oakDone) throw new BadRequestException("Converse com o Professor Oak primeiro.");
      const pack = await tx.packDefinition.findUniqueOrThrow({ where: { id: packId }, include: { species: true } });
      if (pack.speciesId !== packSpecies[packId]) throw new ConflictException("Definição de pack inválida.");
      const trainer = await tx.trainer.findUniqueOrThrow({ where: { id } });
      const stats = starterStats(pack.species.baseStats as Stats);
      const capturedAt = new Date();
      const card = await tx.pokemonInstance.create({ data: {
        ownerId: id, originalTrainerId: id, originalTrainerName: trainer.displayName,
        speciesId: packSpecies[packId], stats, hpCurrent: stats.hp,
        abilities: pack.species.abilities, moves: pack.species.moves, capturedAt,
        history: [{ event: "STARTER_GIFT", at: capturedAt.toISOString(), trainerId: id, trainerName: trainer.displayName, location: "Pallet Town", ball: "POKE_BALL" }],
      } });
      await tx.starterSelection.create({ data: { trainerId: id, packId, cardId: card.id } });
      await tx.pokedexEntry.upsert({ where: { trainerId_speciesId: { trainerId: id, speciesId: pack.speciesId } },
        create: { trainerId: id, speciesId: pack.speciesId, status: "CAPTURED", capturedAt },
        update: { status: "CAPTURED", capturedAt } });
    });
    return this.state(id);
  }
  async event(id: string, event: EventDto["event"]) {
    await this.locked(id, async tx => {
      const p = await tx.tutorialProgress.findUniqueOrThrow({ where: { trainerId: id } });
      const starter = await tx.starterSelection.findUnique({ where: { trainerId: id } });
      if (!starter) throw new BadRequestException("Escolha seu inicial primeiro.");
      const kit = await tx.rewardGrant.findUnique({ where: { trainerId_key: { trainerId: id, key: "STARTER_KIT" } } });
      if (event !== "REVEALED" && !p.revealed) throw new BadRequestException("Conclua a apresentação da carta.");
      if (["POKEDEX", "MAP"].includes(event) && !kit) throw new BadRequestException("Receba o kit de Oak primeiro.");
      const field = { REVEALED: "revealed", DETAILS: "detailsViewed", COLLECTION: "collectionVisited", POKEDEX: "dexVisited", MAP: "mapVisited" }[event];
      await tx.tutorialProgress.update({ where: { trainerId: id }, data: { [field]: true } });
    });
    return this.state(id);
  }
  async kit(id: string) {
    await this.locked(id, async tx => {
      const prior = await tx.rewardGrant.findUnique({ where: { trainerId_key: { trainerId: id, key: "STARTER_KIT" } } });
      if (prior) return;
      const p = await tx.tutorialProgress.findUniqueOrThrow({ where: { trainerId: id } });
      if (!p.revealed || !p.detailsViewed || !await tx.starterSelection.findUnique({ where: { trainerId: id } })) {
        throw new BadRequestException("Revele a carta e visualize seus atributos antes de receber o kit.");
      }
      await tx.rewardGrant.create({ data: { trainerId: id, key: "STARTER_KIT" } });
      for (const [itemId, quantity] of [["poke-ball", 5], ["potion", 3], ["revive", 1]] as const) {
        await tx.inventoryEntry.upsert({ where: { trainerId_itemId: { trainerId: id, itemId } },
          create: { trainerId: id, itemId, quantity }, update: { quantity: { increment: quantity } } });
      }
      await tx.trainer.update({ where: { id }, data: { pokedollars: { increment: 500 } } });
      await tx.playerLocationUnlock.upsert({ where: { trainerId_locationId: { trainerId: id, locationId: "pallet-town" } },
        create: { trainerId: id, locationId: "pallet-town" }, update: {} });
    });
    return this.state(id);
  }
  async complete(id: string) {
    await this.locked(id, async tx => {
      const p = await tx.tutorialProgress.findUniqueOrThrow({ where: { trainerId: id } });
      if (p.completedAt) return;
      const starter = await tx.starterSelection.findUnique({ where: { trainerId: id } });
      const kit = await tx.rewardGrant.findUnique({ where: { trainerId_key: { trainerId: id, key: "STARTER_KIT" } } });
      if (!starter || !kit || !p.oakDone || !p.revealed || !p.detailsViewed || !p.collectionVisited || !p.dexVisited || !p.mapVisited) {
        throw new BadRequestException("Conclua todos os objetivos do tutorial.");
      }
      const now = new Date();
      await tx.tutorialProgress.update({ where: { trainerId: id }, data: { completedAt: now } });
      await tx.trainer.update({ where: { id }, data: { onboardingAt: now } });
      await tx.playerLocationUnlock.upsert({ where: { trainerId_locationId: { trainerId: id, locationId: "route-1" } },
        create: { trainerId: id, locationId: "route-1" }, update: {} });
    });
    return this.state(id);
  }
  async cards(id: string) {
    return this.db.pokemonInstance.findMany({ where: { ownerId: id }, include: { species: true, owner: { select: { id: true, displayName: true } } }, orderBy: { capturedAt: "asc" } });
  }
  async dex(id: string) {
    const granted = await this.db.rewardGrant.findUnique({ where: { trainerId_key: { trainerId: id, key: "STARTER_KIT" } } });
    if (!granted) throw new BadRequestException("Receba a Pokédex de Oak primeiro.");
    const [species, entries] = await Promise.all([
      this.db.pokemonSpecies.findMany({ orderBy: { id: "asc" } }), this.db.pokedexEntry.findMany({ where: { trainerId: id } }),
    ]);
    return species.map(s => ({ ...s, status: entries.find(e => e.speciesId === s.id)?.status ?? "UNKNOWN" }));
  }
  inventory(id: string) {
    return this.db.inventoryEntry.findMany({ where: { trainerId: id }, include: { item: true }, orderBy: { itemId: "asc" } });
  }
}
