import { PrismaClient } from "@prisma/client";
import catalog from "./kanto.json";
export async function seedCatalog(db: PrismaClient) {
  for (const [id, name] of [["pallet-town", "Pallet Town"], ["route-1", "Rota 1"], ["viridian-city", "Viridian City"]]) {
    await db.location.upsert({ where: { id }, create: { id, name }, update: { name } });
  }
  for (const s of catalog) {
    await db.pokemonSpecies.upsert({ where: { id: s.id }, create: s, update: {
      name: s.name, types: s.types, baseStats: s.baseStats, abilities: s.abilities, moves: s.moves,
      imageUrl: s.imageUrl, imagePlaceholder: s.imagePlaceholder,
    } });
  }
  for (const p of [
    { id: "fire", name: "Pack Fogo", element: "fire", speciesId: 4 },
    { id: "water", name: "Pack Água", element: "water", speciesId: 7 },
    { id: "grass", name: "Pack Planta", element: "grass", speciesId: 1 },
  ]) await db.packDefinition.upsert({ where: { id: p.id }, create: p, update: p });
  for (const item of [
    { id: "poke-ball", name: "Poké Ball", category: "BALL" },
    { id: "potion", name: "Poção", category: "HEALING" },
    { id: "revive", name: "Revive", category: "REVIVAL" },
  ]) await db.itemDefinition.upsert({ where: { id: item.id }, create: item, update: item });
}
if (require.main === module) {
  const db = new PrismaClient();
  void seedCatalog(db).then(() => console.log("Kanto: 151 species, packs, locations and items seeded"))
    .catch(() => { console.error("Catalog seed failed"); process.exitCode = 1; })
    .finally(() => db.$disconnect());
}
