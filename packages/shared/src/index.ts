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
