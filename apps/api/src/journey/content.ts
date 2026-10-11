export const oakMessages = [
  "Olá, jovem treinador! Seja bem-vindo à região de Kanto! Meu nome é Oak.",
  "Para iniciar sua jornada, você precisará de um Pokémon companheiro.",
  "Preparei três pacotes especiais: Fogo, Água e Planta. Escolha o elemento que mais combina com você!",
];
export const packSpecies = { fire: 4, water: 7, grass: 1 } as const;
export type PackId = keyof typeof packSpecies;
export type Stats = { hp: number; attack: number; defense: number; specialAttack: number; specialDefense: number; speed: number };
export type StatKey = keyof Stats;
export const statKeys: readonly StatKey[] = ["hp","attack","defense","specialAttack","specialDefense","speed"];
export const zeroStats = (): Stats => ({hp:0,attack:0,defense:0,specialAttack:0,specialDefense:0,speed:0});
export type NatureModifier = { increase?: Exclude<StatKey,"hp">; decrease?: Exclude<StatKey,"hp"> };
export const natureModifiers: Record<string,NatureModifier> = {
 HARDY:{},LONELY:{increase:"attack",decrease:"defense"},BRAVE:{increase:"attack",decrease:"speed"},ADAMANT:{increase:"attack",decrease:"specialAttack"},NAUGHTY:{increase:"attack",decrease:"specialDefense"},
 BOLD:{increase:"defense",decrease:"attack"},DOCILE:{},RELAXED:{increase:"defense",decrease:"speed"},IMPISH:{increase:"defense",decrease:"specialAttack"},LAX:{increase:"defense",decrease:"specialDefense"},
 TIMID:{increase:"speed",decrease:"attack"},HASTY:{increase:"speed",decrease:"defense"},SERIOUS:{},JOLLY:{increase:"speed",decrease:"specialAttack"},NAIVE:{increase:"speed",decrease:"specialDefense"},
 MODEST:{increase:"specialAttack",decrease:"attack"},MILD:{increase:"specialAttack",decrease:"defense"},QUIET:{increase:"specialAttack",decrease:"speed"},BASHFUL:{},RASH:{increase:"specialAttack",decrease:"specialDefense"},
 CALM:{increase:"specialDefense",decrease:"attack"},GENTLE:{increase:"specialDefense",decrease:"defense"},SASSY:{increase:"specialDefense",decrease:"speed"},CAREFUL:{increase:"specialDefense",decrease:"specialAttack"},QUIRKY:{}
};
export function calculateStats(base:Stats, level:number, ivs:Stats, evs:Stats, nature="HARDY"):Stats {
 if(!Number.isInteger(level)||level<1||level>100) throw new RangeError("Invalid level");
 for(const key of statKeys){if(!Number.isInteger(base[key])||base[key]<1||!Number.isInteger(ivs[key])||ivs[key]<0||ivs[key]>31||!Number.isInteger(evs[key])||evs[key]<0||evs[key]>252)throw new RangeError("Invalid stat values");}
 if(statKeys.reduce((sum,key)=>sum+evs[key],0)>510)throw new RangeError("EV total exceeds 510");
 const modifier=natureModifiers[nature];if(!modifier)throw new RangeError("Invalid nature");
 const result={} as Stats;
 for(const key of statKeys){const raw=Math.floor((2*base[key]+ivs[key]+Math.floor(evs[key]/4))*level/100);if(key==="hp"){result.hp=raw+level+10;}else{const natural=raw+5;result[key]=Math.floor(natural*(modifier.increase===key?1.1:modifier.decrease===key?0.9:1));}}
 return result;
}
export function starterStats(base:Stats):Stats{return calculateStats(base,5,zeroStats(),zeroStats(),"HARDY");}
