import { IsIn } from "class-validator";
export class PackDto {
  @IsIn(["fire", "water", "grass"]) packId!: "fire" | "water" | "grass";
}
export class EventDto {
  @IsIn(["REVEALED", "DETAILS", "COLLECTION", "POKEDEX", "MAP"])
  event!: "REVEALED" | "DETAILS" | "COLLECTION" | "POKEDEX" | "MAP";
}
