"use client";
import { useEffect, useState } from "react";
import { PokemonCard } from "./ui";
import type { Card } from "./types";

export type Element = "fire" | "water" | "grass";
export const packNames: Record<Element,string> = { fire:"Fogo",water:"Água",grass:"Planta" };
export const packSpeciesNames: Record<Element,string> = { fire:"Charmander",water:"Squirtle",grass:"Bulbasaur" };
export function ElementalPack({ element }: { element: Element }) {
  return <div className={"elemental-pack "+element}><div className="pack-seal"/><span className="pack-brand">KANTO<br/><b>CARDS</b></span>
    <span className="element-symbol" aria-hidden>{element==="fire"?"♨":element==="water"?"◈":"❧"}</span><span className="pack-label">{packNames[element]}</span><div className="pack-seal bottom"/></div>;
}
export function PackOpening({ element, card, finish, busy, sound }: { element: Element; card: Card; finish:()=>void; busy:boolean; sound:(kind:string,element?:Element)=>void }) {
  const [ready,setReady]=useState(false);
  useEffect(()=>{
    if(window.matchMedia("(prefers-reduced-motion: reduce)").matches){setReady(true);return;}
    const charge=setTimeout(()=>sound("charge",element),600),open=setTimeout(()=>sound("open",element),2200),
      reveal=setTimeout(()=>{setReady(true);sound("reveal",element);},5500);
    return ()=>{clearTimeout(charge);clearTimeout(open);clearTimeout(reveal);};
  // Sound is triggered only after a user has enabled audio; animation timer is not reset by UI renders.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  },[]);
  return <section className={"opening "+element+(ready?" ready":"")} aria-label="Abertura do pack">
    <h2 aria-live="polite">{ready?"Você recebeu um "+card.species.name+"!":"Abrindo seu pacote…"}</h2>
    <div className="reveal-stage">
      <div className="energy-ring ring-one"/><div className="energy-ring ring-two"/>
      <div className="opening-pack"><ElementalPack element={element}/></div>
      <div className="card-emerge"><PokemonCard card={card}/></div>
      <div className="light-burst"/>{Array.from({length:12},(_,i)=><i className="particle" style={{"--i":i} as React.CSSProperties} key={i}/>)}
    </div>
    {ready ? <><p>Sua carta foi registrada. Nível 5 · Poké Ball comum · borda vermelha.</p><button className="primary-button" disabled={busy} onClick={finish}>Adicionar à minha coleção</button></>
      : <button className="secondary-button" onClick={()=>setReady(true)}>Pular animação</button>}
  </section>;
}
