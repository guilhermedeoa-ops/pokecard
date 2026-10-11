export type Stats = { hp: number; attack: number; defense: number; specialAttack: number; specialDefense: number; speed: number };
export interface Species { id: number; name: string; types: string[]; baseStats: Stats; imageUrl: string; imagePlaceholder: boolean; abilities: string[]; moves: string[] }
export interface Card {
  id: string; speciesId: number; species: Species; level: number; experience: number;
  hpCurrent: number; stats: Stats; abilities: string[]; moves: string[];
  originBall: string; tier: string; originLocation: string; originDescription: string;
  capturedAt: string; originalTrainerId: string; originalTrainerName: string; ownerId: string;
  owner: { id: string; displayName: string };
  history: { event: string; at: string; trainerName: string; location: string; ball: string }[];
}
export interface JourneyState {
  phase: "OAK" | "PACKS" | "REVEAL" | "DETAILS" | "KIT" | "TUTORIAL" | "COMPLETE";
  kitGranted: boolean; oakMessages: string[];
  trainer: { id: string; displayName: string; pokedollars: number; locationId: string;
    tutorial: { dialogIndex: number; completedAt: string | null };
    starter: { packId: "fire" | "water" | "grass"; card: Card } | null;
    unlocks: { locationId: string }[];
  };
  mission: { key: string; text: string; done: boolean }[];
}
export type Section = "lab" | "collection" | "dex" | "inventory" | "missions" | "map";
export const typeLabels: Record<string, string> = {
  fire:"Fogo", water:"Água", grass:"Planta", poison:"Veneno", normal:"Normal", flying:"Voador",
  bug:"Inseto", electric:"Elétrico", ground:"Terra", fairy:"Fada", fighting:"Lutador", psychic:"Psíquico",
  rock:"Pedra", steel:"Aço", ice:"Gelo", ghost:"Fantasma", dragon:"Dragão",
};
