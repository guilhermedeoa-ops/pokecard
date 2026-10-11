export const oakMessages = [
  "Olá, jovem treinador! Seja bem-vindo à região de Kanto! Meu nome é Oak.",
  "Para iniciar sua jornada, você precisará de um Pokémon companheiro.",
  "Preparei três pacotes especiais: Fogo, Água e Planta. Escolha o elemento que mais combina com você!",
];
export const packSpecies = { fire: 4, water: 7, grass: 1 } as const;
export type PackId = keyof typeof packSpecies;
export type Stats = { hp: number; attack: number; defense: number; specialAttack: number; specialDefense: number; speed: number };
export function starterStats(base: Stats): Stats {
  const level = 5;
  const stat = (value: number) => Math.floor(2 * value * level / 100) + 5;
  return {
    hp: Math.floor(2 * base.hp * level / 100) + level + 10,
    attack: stat(base.attack), defense: stat(base.defense),
    specialAttack: stat(base.specialAttack), specialDefense: stat(base.specialDefense), speed: stat(base.speed),
  };
}
