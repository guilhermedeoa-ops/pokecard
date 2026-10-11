export interface HealthResponse {
  status: "ok";
  service: "pokecard-api";
  database: "connected";
}

// Public contracts never expose password hashes, sessions or token hashes.
export interface TrainerProfile {
  id: string;
  displayName: string;
  avatarUrl: string | null;
  level: number;
  experience: number;
}

export type CardOrigin = "STARTER_PACK" | "POKEMON_PACK" | "CAUGHT";
export type CardNature = "HARDY"|"LONELY"|"BRAVE"|"ADAMANT"|"NAUGHTY"|"BOLD"|"DOCILE"|"RELAXED"|"IMPISH"|"LAX"|"TIMID"|"HASTY"|"SERIOUS"|"JOLLY"|"NAIVE"|"MODEST"|"MILD"|"QUIET"|"BASHFUL"|"RASH"|"CALM"|"GENTLE"|"SASSY"|"CAREFUL"|"QUIRKY";
export interface CardStats { hp:number;attack:number;defense:number;specialAttack:number;specialDefense:number;speed:number }
export interface CardAttributes { id:string;speciesId:number;ownerId:string;originalTrainerId:string;origin:CardOrigin;originBall:string;level:number;experience:number;ivs:CardStats;evs:CardStats;nature:CardNature;activeAbility:string|null;stats:CardStats;hpCurrent:number }
