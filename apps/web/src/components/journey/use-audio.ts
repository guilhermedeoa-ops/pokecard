"use client";
import { useEffect, useRef, useState } from "react";
import type { Element } from "./pack";
export function useAudio() {
  const [enabled,setEnabled]=useState(false);
  const context=useRef<AudioContext|null>(null), enabledRef=useRef(false);
  useEffect(()=>{try{const value=localStorage.getItem("pokecard-audio")==="on";setEnabled(value);enabledRef.current=value;}catch{} return ()=>{void context.current?.close();context.current=null;};},[]);
  function sound(kind:string,element:Element="fire") {
    if(!enabledRef.current)return;
    try {
      const audio=context.current??(context.current=new AudioContext());
      // Do not play from a timer if the browser has not unlocked audio.
      if(audio.state!=="running")return;
      const frequency={fire:330,water:440,grass:523}[element],offset=({select:0,confirm:80,charge:120,open:180,reveal:260,reward:340} as Record<string,number>)[kind]??0;
      const oscillator=audio.createOscillator(),gain=audio.createGain();
      oscillator.type=element==="fire"?"triangle":"sine";
      oscillator.frequency.setValueAtTime(frequency+offset,audio.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(frequency+offset+100,audio.currentTime+0.18);
      gain.gain.setValueAtTime(0.035,audio.currentTime);gain.gain.exponentialRampToValueAtTime(0.001,audio.currentTime+0.3);
      oscillator.connect(gain);gain.connect(audio.destination);oscillator.start();oscillator.stop(audio.currentTime+0.32);
    }catch{/* Browser without Web Audio: visual flow continues. */}
  }
  async function toggle() {
    const next=!enabled;setEnabled(next);enabledRef.current=next;try{localStorage.setItem("pokecard-audio",next?"on":"off");}catch{}
    if(next){try {const audio=context.current??(context.current=new AudioContext());await audio.resume();sound("select");}catch{/* optional audio */}}
  }
  return {enabled,toggle,sound};
}
