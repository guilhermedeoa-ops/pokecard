"use client";
import { useEffect, useRef, useState, type ReactNode } from "react";
import type { Card, JourneyState } from "./types";
import { typeLabels } from "./types";

export function Modal({ title, children, close }: { title: string; children: ReactNode; close?: () => void }) {
  const panel = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    const first = panel.current?.querySelector<HTMLElement>("button,input,select,a[href]");
    first?.focus();
    return () => previous?.focus();
  }, []);
  return <div className="modal-shade"><div className="journey-modal" role="dialog" aria-modal="true" aria-label={title} ref={panel}
    onKeyDown={e => {
      if (e.key === "Escape" && close) close();
      if (e.key !== "Tab") return;
      const nodes = Array.from(panel.current?.querySelectorAll<HTMLElement>("button:not(:disabled),input,select,a[href]") ?? []);
      if (!nodes.length) { e.preventDefault(); return; }
      const first = nodes[0], last = nodes[nodes.length-1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }}>
    <h2>{title}</h2>{children}
    {close && <button className="secondary-button" onClick={close}>Voltar</button>}
  </div></div>;
}
export function OakDialog({ text, onContinue, busy, button = "Continuar" }: {
  text: string; onContinue: () => void; busy: boolean; button?: string;
}) {
  const [typing, setTyping] = useState(false), [shown, setShown] = useState(text);
  useEffect(() => {
    if (!typing || window.matchMedia("(prefers-reduced-motion: reduce)").matches) { setShown(text); return; }
    let index = 0; setShown("");
    const timer = setInterval(() => { index += 2; setShown(text.slice(0,index)); if(index >= text.length)clearInterval(timer); },18);
    return () => clearInterval(timer);
  }, [text,typing]);
  return <div className="oak-scene">
    <img src="/art/oak-placeholder.svg" className="oak-portrait" alt="Retrato provisório de Professor Oak, cientista com jaleco" />
    <span className="portrait-note">Retrato provisório</span>
    <section className="oak-dialog" aria-label="Diálogo do Professor Oak">
      <span className="nameplate">Professor Oak</span>
      <p aria-live="polite">{shown}</p>
      <div className="dialog-actions"><label><input type="checkbox" checked={typing} onChange={e => setTyping(e.target.checked)} /> Efeito de digitação</label>
        <button className="primary-button" disabled={busy} onClick={() => { if(shown!==text)setTyping(false);else onContinue(); }}>
          {shown!==text ? "Mostrar texto" : button} <span aria-hidden>›</span>
        </button>
      </div>
    </section>
  </div>;
}
export function PokemonCard({ card, onClick, compact = false }: { card: Card; onClick?: () => void; compact?: boolean }) {
  const body = <><div className="card-top"><span aria-hidden>◉</span><span>Nv. {card.level}</span></div>
    <div className="pokemon-art"><img src={card.species.imageUrl} alt={"Ilustração provisória de "+card.species.name} /></div>
    <strong>{card.species.name}</strong><div className="type-row">{card.species.types.map(t=><span className={"type-pill type-"+t} key={t}>{typeLabels[t]??t}</span>)}</div>
    {!compact && <small>#{String(card.speciesId).padStart(3,"0")} · Poké Ball comum</small>}
  </>;
  return onClick ? <button className="pokemon-card red-border" onClick={onClick} aria-label={"Ver atributos de "+card.species.name}>{body}</button>
    : <article className="pokemon-card red-border">{body}</article>;
}
export function CardDetails({ card }: { card: Card }) {
  return <div className="card-details">
    <PokemonCard card={card} /><div className="stat-panel">
      <h2>{card.species.name} <span>#{String(card.speciesId).padStart(3,"0")}</span></h2>
      <dl className="stats">{([
        ["HP",card.hpCurrent+"/"+card.stats.hp],["Ataque",card.stats.attack],["Defesa",card.stats.defense],
        ["Ataque Especial",card.stats.specialAttack],["Defesa Especial",card.stats.specialDefense],["Velocidade",card.stats.speed],["EXP",card.experience],
      ] as const).map(([label,value])=><div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl>
      <h3>Habilidades</h3><p>{card.abilities.join(", ")}</p>
      <h3>Movimentos</h3><p>{card.moves.join(" · ")}</p>
      <details><summary>Origem e histórico da carta</summary><dl className="origin-list">
        <dt>ID individual</dt><dd>{card.id}</dd><dt>Bola de origem</dt><dd>Poké Ball · borda vermelha · tier comum</dd>
        <dt>Origem</dt><dd>{card.originDescription}</dd><dt>Local</dt><dd>{card.originLocation}</dd>
        <dt>Data</dt><dd>{new Date(card.capturedAt).toLocaleString("pt-BR")}</dd>
        <dt>Treinador original</dt><dd>{card.originalTrainerName} ({card.originalTrainerId})</dd>
        <dt>Proprietário</dt><dd>{card.owner.displayName} ({card.ownerId})</dd>
      </dl><ul>{card.history.map((entry,i)=><li key={i}>{entry.trainerName} · {entry.location} · {new Date(entry.at).toLocaleDateString("pt-BR")}</li>)}</ul></details>
      <small className="asset-note">Ilustração provisória · substituível por asset autorizado</small>
    </div>
  </div>;
}
export function TutorialMission({ state, complete, busy }: { state: JourneyState; complete: () => void; busy: boolean }) {
  const completed = state.mission.filter(x=>x.done).length;
  const ready = state.mission.filter(x=>x.key!=="route").every(x=>x.done) && state.kitGranted;
  return <section className="mission-panel"><span className="eyebrow">MISSÃO #001 · TUTORIAL</span><h2>O começo de uma jornada</h2>
    <p>Professor Oak quer que você conheça sua primeira carta e prepare a aventura em Kanto.</p>
    <progress max={7} value={completed} aria-label="Progresso da missão" /><p>{completed} de 7 objetivos concluídos</p>
    <ul>{state.mission.map(x=><li key={x.key}><span aria-hidden>{x.done?"✓":"○"}</span> {x.text} <span className="sr-only">{x.done?"concluído":"pendente"}</span></li>)}</ul>
    {state.phase==="COMPLETE" ? <p className="success-banner">Rota 1 desbloqueada. Expedições chegarão no próximo capítulo.</p> :
      <button className="primary-button" disabled={!ready||busy} onClick={complete}>Concluir tutorial e desbloquear Rota 1</button>}
    <aside className="reward-list">Kit inicial: 5 Poké Balls · 3 Poções · 1 Revive · 500 Pokédollars · Pokédex de Kanto.
      {state.kitGranted && <strong> Já recebido; a conclusão não concede outro kit.</strong>}</aside>
  </section>;
}
export function KantoMap({ state }: { state: JourneyState }) {
  const route = state.trainer.unlocks.some(x=>x.locationId==="route-1");
  const [selected,setSelected]=useState("Pallet Town");
  return <section><span className="eyebrow">REGIÃO DE KANTO</span><h2>Seu primeiro passo</h2>
    <div className="kanto-map" aria-hidden><div className="map-land"/><div className="map-road"/><span className="map-pin pallet-pin">●</span><span className="map-pin viridian-pin">●</span></div>
    <div className="location-grid">{[
      {name:"Pallet Town",status:"Local atual",icon:"⌂",locked:false},
      {name:"Rota 1",status:route?"Desbloqueada":"Conclua o tutorial",icon:route?"↗":"🔒",locked:!route},
      {name:"Viridian City",status:"Próximos capítulos",icon:"🔒",locked:true},
    ].map(location=><button className={"location-card "+(location.locked?"locked":"")} key={location.name} disabled={location.locked} onClick={()=>setSelected(location.name)} aria-pressed={selected===location.name}><span aria-hidden>{location.icon}</span><h3>{location.name}</h3><p>{location.status}</p></button>)}</div>
    <p role="status">{selected==="Pallet Town"?"Pallet Town é sua localização atual.": "Rota 1 selecionada. Expedições chegarão no próximo capítulo."}</p>
    {route && <p className="success-banner">Sua primeira aventura começa na Rota 1. Expedições chegarão no próximo capítulo.</p>}
  </section>;
}
