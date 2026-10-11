"use client";
import { useState } from "react";
import { typeLabels, type Species } from "./types";
export function Pokedex({ entries }: { entries: (Species & {status:"UNKNOWN"|"SEEN"|"CAPTURED"})[] }) {
  const [query,setQuery]=useState(""),[filter,setFilter]=useState("all");
  const seen=entries.filter(s=>s.status!=="UNKNOWN").length,captured=entries.filter(s=>s.status==="CAPTURED").length;
  const visible=entries.filter(s=>(s.name.toLowerCase().includes(query.toLowerCase())||String(s.id).padStart(3,"0").includes(query))&&
    (filter==="all"||filter==="captured"&&s.status==="CAPTURED"||filter==="seen"&&s.status!=="UNKNOWN"||filter==="unknown"&&s.status==="UNKNOWN"));
  return <section><span className="eyebrow">CATÁLOGO DA REGIÃO</span><h2>Pokédex de Kanto</h2>
    <div className="dex-counts"><span>Total: {entries.length}</span><span>Avistadas: {seen}</span><span>Capturadas: {captured}</span><span>{(captured/151*100).toFixed(1)}% completo</span></div>
    <div className="dex-tools"><label>Buscar nome ou número<input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Charmander ou 004" type="search"/></label>
      <label>Filtrar<select value={filter} onChange={e=>setFilter(e.target.value)}><option value="all">Todas</option><option value="seen">Avistadas</option><option value="captured">Capturadas</option><option value="unknown">Desconhecidas</option></select></label></div>
    <div className="dex-grid">{visible.map(s=><article className={"dex-entry "+(s.status==="UNKNOWN"?"unknown":"")} key={s.id} aria-label={s.name+" "+(s.status==="CAPTURED"?"Capturado":s.status==="SEEN"?"Avistado":"Desconhecido")}>
      <img src={s.imageUrl} alt={s.status==="UNKNOWN"?"Silhueta provisória":"Ilustração provisória de "+s.name}/>
      <small>#{String(s.id).padStart(3,"0")}</small><strong>{s.name}</strong>
      <span>{s.status==="CAPTURED"?"✓ Capturado":s.status==="SEEN"?"Avistado":"Desconhecido"}</span>
      <small>{s.types.map(t=>typeLabels[t]??t).join(" / ")}</small>
    </article>)}</div>{!visible.length&&<p>Nenhuma espécie encontrada para esses filtros.</p>}
    <p className="asset-note">Imagens provisórias identificadas. Registros capturados permanecem após futuras trocas.</p>
  </section>;
}
