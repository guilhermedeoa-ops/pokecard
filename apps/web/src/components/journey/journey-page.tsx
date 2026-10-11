"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { api } from "../../lib/api";
import { useAudio } from "./use-audio";
import { OakDialog, Modal, PokemonCard, CardDetails, TutorialMission, KantoMap } from "./ui";
import { ElementalPack, PackOpening, packNames, packSpeciesNames, type Element } from "./pack";
import { Pokedex } from "./pokedex";
import type { JourneyState, Section, Card, Species } from "./types";
import "./journey.css";

const navigation: {id:Section;label:string;icon:string}[] = [
  {id:"lab",label:"Laboratório Oak",icon:"⌂"}, {id:"collection",label:"Minhas Cartas",icon:"▣"},
  {id:"dex",label:"Pokédex",icon:"▤"},{id:"inventory",label:"Inventário",icon:"◈"},
  {id:"missions",label:"Missões",icon:"✓"},{id:"map",label:"Mapa de Kanto",icon:"⌖"},
];
export function JourneyPage({ initialSection = "lab" }: { initialSection?: Section }) {
  const [state,setState]=useState<JourneyState|null>(null),[section,setSection]=useState<Section>(initialSection);
  const [error,setError]=useState(""),[busy,setBusy]=useState(false),[selected,setSelected]=useState<Element|null>(null),[confirm,setConfirm]=useState(false);
  const [cards,setCards]=useState<Card[]|null>(null),[dex,setDex]=useState<(Species&{status:"UNKNOWN"|"SEEN"|"CAPTURED"})[]|null>(null);
  const [inventory,setInventory]=useState<{itemId:string;quantity:number;item:{name:string;category:string}}[]|null>(null);
  const [details,setDetails]=useState<Card|null>(null),[reward,setReward]=useState(false);
  const audio=useAudio();
  useEffect(()=>{
    let active=true;
    api<JourneyState>("/journey").then(value=>{
      if(!active)return;setState(value);
      if(["OAK","PACKS","REVEAL","DETAILS","KIT"].includes(value.phase))setSection("lab");
    }).catch(cause=>{if(active)setError(cause instanceof Error?cause.message:"Não foi possível carregar a jornada.");});
    return ()=>{active=false;};
  },[]);
  const cardId=state?.trainer.starter?.card.id;
  useEffect(()=>{
    if(!state)return;
    let active=true;
    const load=async()=>{
      try {
        if(section==="collection"){
          setCards(null);const value=await api<Card[]>("/journey/cards");if(!active)return;setCards(value);
          if(value.length&&state.phase!=="REVEAL")setState(await api<JourneyState>("/journey/event",{event:"COLLECTION"}));
        }else if(section==="dex"&&state.kitGranted){
          setDex(null);const value=await api<(Species&{status:"UNKNOWN"|"SEEN"|"CAPTURED"})[]>("/journey/dex");
          if(!active)return;setDex(value);setState(await api<JourneyState>("/journey/event",{event:"POKEDEX"}));
        }else if(section==="inventory"){
          setInventory(null);const value=await api<typeof inventory>("/journey/inventory");if(active)setInventory(value);
        }else if(section==="map"&&state.kitGranted){
          const value=await api<JourneyState>("/journey/event",{event:"MAP"});if(active)setState(value);
        }
      }catch(cause){if(active)setError(cause instanceof Error?cause.message:"Não foi possível carregar.");}
    };
    void load();return ()=>{active=false;};
  // The progress returned by visits does not retrigger another visit request.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  },[section,state?.trainer.id,state?.kitGranted,cardId]);
  async function action(path:string,body:unknown={}) {
    if(busy)return null;
    setBusy(true);setError("");
    try {const next=await api<JourneyState>("/journey"+path,body);setState(next);return next;}
    catch(cause){setError(cause instanceof Error?cause.message:"A conexão caiu. Tente novamente; seu progresso está salvo.");return null;}
    finally{setBusy(false);}
  }
  const choose=async()=>{
    if(!selected)return;
    audio.sound("confirm",selected);
    const next=await action("/starter",{packId:selected});
    if(next){setConfirm(false);setSection("lab");}
  };
  const claim=async()=>{const next=await action("/kit");if(next){audio.sound("reward");setReward(true);}};
  const finish=async()=>{const next=await action("/complete");if(next){audio.sound("reward");setSection("lab");}};
  const canOpen=(id:Section)=>{
    if(id==="lab")return true;if(!state||["OAK","PACKS","REVEAL"].includes(state.phase))return false;
    return id==="collection"||id==="missions"||state.kitGranted;
  };
  function navigate(id:Section){setError("");setDetails(null);setSection(id);audio.sound("select");}
  const card=state?.trainer.starter?.card;
  const progress=state?.mission.filter(x=>x.done).length??0;
  return <div className="journey">
    <header className="journey-header"><Link href="/" className="journey-logo"><strong>POKÉMON</strong><span>KANTO CARDS</span></Link>
      <div className="city-label"><span aria-hidden>⌂</span><div><small>KANTO · CAPÍTULO 1</small><strong>Pallet Town</strong></div></div>
      <div className="header-controls"><span>{state?.trainer.displayName??"Treinador"}</span><span className="money">{state?.trainer.pokedollars??0} ₽</span>
        <button onClick={audio.toggle} aria-pressed={audio.enabled}>{audio.enabled?"Áudio ligado":"Áudio desligado"}</button><Link href="/treinador">Perfil</Link></div>
    </header>
    <div className="journey-layout">
      <aside className="journey-sidebar"><span className="eyebrow">SUA JORNADA</span><nav aria-label="Menus de Pallet Town">
        {navigation.map(item=><button key={item.id} className={section===item.id?"active":""} disabled={!canOpen(item.id)||busy} onClick={()=>navigate(item.id)}>
          <span aria-hidden>{item.icon}</span>{item.label}{!canOpen(item.id)&&<span className="lock-icon" aria-label="bloqueado">🔒</span>}
        </button>)}</nav><div className="sidebar-mission"><small>Missão #001</small><strong>O começo de uma jornada</strong><progress max={7} value={progress}/><span>{progress}/7 objetivos</span></div>
        <p className="sidebar-note">Rota 1 {state?.phase==="COMPLETE"?"desbloqueada":"bloqueada"}</p>
      </aside>
      <main className={"journey-content "+(section==="lab"?"laboratory":"")}>
        {error&&<div className="journey-error" role="alert">{error} {!state?<Link href="/login">Entrar na conta</Link>:<button onClick={()=>window.location.reload()}>Recarregar progresso</button>}</div>}
        {!state&&!error&&<p role="status" className="loading-state">Preparando sua chegada a Pallet Town…</p>}
        {state&&section==="lab"&&<>
          <div className="chapter-heading"><span className="eyebrow">LABORATÓRIO DO PROFESSOR OAK</span><h1>{state.phase==="COMPLETE"?"A jornada está só começando":"Seu primeiro companheiro"}</h1></div>
          {state.phase==="OAK"&&<OakDialog text={state.oakMessages[state.trainer.tutorial.dialogIndex]} busy={busy} onContinue={()=>void action("/oak/advance")}/>}
          {state.phase==="PACKS"&&<section className="pack-selection"><h2>Escolha o seu Pacote Inicial</h2><p>Cada pack contém um Pokémon definido. Escolha o elemento que mais combina com você.</p>
            <div className="pack-grid">{(["fire","water","grass"] as const).map(element=><button key={element} className={"pack-option "+(selected===element?"selected":selected?"dimmed":"")}
              onClick={()=>{setSelected(element);audio.sound("select",element);}} aria-pressed={selected===element} aria-label={"Escolher Pack "+packNames[element]}>
              <ElementalPack element={element}/><strong>Pack {packNames[element]}</strong><span>{packSpeciesNames[element]}</span></button>)}</div>
            {selected&&<button className="primary-button" onClick={()=>setConfirm(true)}>Confirmar Pack {packNames[selected]}</button>}
            <p className="pack-note">Conteúdo predeterminado · um único inicial por treinador · sem sorteio</p>
          </section>}
          {state.phase==="REVEAL"&&card&&<PackOpening element={state.trainer.starter!.packId} card={card} busy={busy} sound={audio.sound} finish={()=>void action("/event",{event:"REVEALED"})}/>}
          {state.phase==="DETAILS"&&card&&<section className="first-card"><h2>Conheça seu {card.species.name}</h2><CardDetails card={card}/>
            <button className="primary-button" disabled={busy} onClick={()=>void action("/event",{event:"DETAILS"})}>Confirmar e iniciar minha jornada</button></section>}
          {state.phase==="KIT"&&<OakDialog text={"Excelente escolha! "+card?.species.name+" será um ótimo companheiro em sua jornada. Aqui estão alguns itens para ajudar no seu começo."} busy={busy} button="Receber kit inicial" onContinue={()=>void claim()}/>}
          {state.phase==="TUTORIAL"&&<OakDialog text="Agora conheça sua coleção, consulte a Pokédex e abra o mapa de Kanto. Acompanhe os objetivos na missão #001." busy={busy} button="Ver minha missão" onContinue={()=>navigate("missions")}/>}
          {state.phase==="COMPLETE"&&<><OakDialog text="Excelente trabalho! Agora você está pronto para explorar Kanto. Sua primeira aventura começa na Rota 1!" busy={busy} button="Ver mapa de Kanto" onContinue={()=>navigate("map")}/></>}
        </>}
        {state&&section==="collection"&&<section><span className="eyebrow">SEUS COMPANHEIROS</span><h1>Minhas Cartas</h1>
          {cards===null?<p role="status">Carregando suas cartas…</p>:!cards.length?<p>Você ainda não tem cartas. Visite o Laboratório Oak.</p>:<div className="collection-grid">{cards.map(c=><PokemonCard key={c.id} card={c} compact onClick={()=>{setDetails(c);void action("/event",{event:"DETAILS"});}}/>)}
            <div className="empty-slot" aria-hidden><span>＋</span><small>Seus próximos companheiros</small></div></div>}
        </section>}
        {state&&section==="dex"&&(dex?<Pokedex entries={dex}/>:<p role="status">Carregando Pokédex…</p>)}
        {state&&section==="inventory"&&<section><span className="eyebrow">PREPARE SUA JORNADA</span><h1>Inventário</h1><p>Saldo: <strong>{state.trainer.pokedollars} Pokédollars</strong></p>
          {inventory===null?<p role="status">Carregando inventário…</p>:!inventory.length?<p>Seu inventário está vazio.</p>:<div className="inventory-grid">{inventory.map(item=><article key={item.itemId}><span aria-hidden>{item.itemId==="poke-ball"?"◉":item.itemId==="potion"?"⚗":"◆"}</span><strong>{item.item.name}</strong><b>×{item.quantity}</b><small>{item.item.category==="BALL"?"Bola de captura":item.item.category==="HEALING"?"Cura":"Reviver"}</small></article>)}</div>}
          <p className="asset-note">O uso de consumíveis chegará nos próximos capítulos.</p></section>}
        {state&&section==="missions"&&<><h1>Missões</h1><TutorialMission state={state} busy={busy} complete={()=>void finish()}/></>}
        {state&&section==="map"&&<><h1>Mapa de Kanto</h1><KantoMap state={state}/></>}
      </main>
    </div>
    {confirm&&selected&&<Modal title="Confirmar Pokémon inicial" close={()=>setConfirm(false)}><p>O Pack {packNames[selected]} entrega <strong>{packSpeciesNames[selected]}</strong> no nível 5.</p><p>Após confirmar, a escolha será definitiva.</p>
      <button className="primary-button" disabled={busy} onClick={()=>void choose()}>{busy?"Registrando…":"Receber "+packSpeciesNames[selected]}</button>{error&&<p role="alert">{error}</p>}</Modal>}
    {details&&<Modal title={"Atributos de "+details.species.name} close={()=>setDetails(null)}><CardDetails card={details}/></Modal>}
    {reward&&<Modal title="Kit inicial recebido"><p>Professor Oak preparou sua primeira recompensa!</p><div className="kit-rewards">
      {[["◉","5 Poké Balls"],["⚗","3 Poções"],["◆","1 Revive"],["₽","500 Pokédollars"],["▤","Pokédex de Kanto"]].map(([icon,label])=><div key={label}><span aria-hidden>{icon}</span><strong>{label}</strong></div>)}</div>
      <button className="primary-button" onClick={()=>{setReward(false);navigate("missions");}}>Continuar</button></Modal>}
  </div>;
}
