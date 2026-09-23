"use client";
import {useEffect,useRef,useState} from "react";
import type {Pick,Track} from "@/lib/types";
const lengths=[8,10,12,14,16];
function Mic({filled}:{filled:boolean}){
 return <span className={`mic ${filled?"filled":"empty"}`} aria-hidden="true">
   <span className="micHead"/><span className="micGrip"/><span className="micStem"/>
 </span>
}
function MicRating({rating}:{rating:number}){
 return <div className="micRating" aria-label={`${rating} out of 5 microphones`}>
   {Array.from({length:5},(_,i)=><Mic key={i} filled={i<rating}/>)}
 </div>
}
export default function Home(){
 const gameSeed=useRef(`${Date.now()}-${Math.random()}`);
 const [length,setLength]=useState<number|null>(null),[picks,setPicks]=useState<Pick[]>([]),[tracks,setTracks]=useState<Track[]>([]);
 const [loading,setLoading]=useState(false),[error,setError]=useState(""),[result,setResult]=useState<any>(null);
 const pos=picks.length+1,done=!!length&&picks.length===length;
 useEffect(()=>{if(!length||done)return;setLoading(true);setError("");fetch(`/api/tracks?position=${pos}&seed=${encodeURIComponent(gameSeed.current)}`).then(async r=>{const d=await r.json();if(!r.ok)throw Error(d.error);return d}).then(d=>setTracks(d.tracks)).catch(e=>setError(e.message)).finally(()=>setLoading(false))},[length,pos,done]);
 useEffect(()=>{if(!done||result)return;fetch("/api/score",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({picks})}).then(r=>r.json()).then(setResult)},[done,picks,result]);
 const choose=(t:Track)=>{const offered=[...tracks];setTracks([]);setPicks(v=>[...v,{position:pos,track:t,offered}])}; const reset=()=>{gameSeed.current=`${Date.now()}-${Math.random()}`;setLength(null);setPicks([]);setResult(null);setTracks([])};
 return <main><header><div className="brand">5 MICS</div><div className="tag">CAN YOU BUILD A 5 MIC ALBUM?</div></header>
 {!length?<section className="hero"><p className="kicker">THE HIP-HOP ALBUM DRAFT</p><h1>BUILD A<br/>CLASSIC.</h1><p>Pick your album length. For every slot you get five real hip-hop tracks that originally appeared at that exact track number. No going back.</p><h2>HOW MANY TRACKS?</h2><div className="lengths">{lengths.map(n=><button onClick={()=>setLength(n)} key={n}>{n}</button>)}</div></section>
 :done?<section className="result"><p className="kicker">THE VERDICT</p>{!result?<h2>THE MICS ARE DELIBERATING…</h2>:<><MicRating rating={result.mics}/><div className="micScoreText">{result.mics}<span>/5</span></div><h1>{result.mics===5?"CERTIFIED CLASSIC.":result.mics===4?"SERIOUS HEAT.":result.mics===3?"SOLID ALBUM.":result.mics===2?"A FEW JOINTS.":"BACK TO THE LAB."}</h1><p className="number">{result.score} / 100</p>
<div className="review">
 <h2>WHY IT SCORED {result.mics}/5</h2>
 <p>{result.summary}</p>
 <div className="reviewStats">
  <div><strong>{result.bestPicks}</strong><span>BEST PICKS</span></div>
  <div><strong>{result.eliteCount}</strong><span>ELITE CUTS</span></div>
  <div><strong>{result.biggestMiss?.gap||0}</strong><span>BIGGEST MISS</span></div>
 </div>
 {result.biggestMiss?.gap>0&&<p className="miss"><b>Biggest miss — Track {result.biggestMiss.position}:</b> you chose <i>{result.biggestMiss.chosen}</i>. <i>{result.biggestMiss.best}</i> was the strongest option you were offered (+{result.biggestMiss.gap}).</p>}
 <p className="fiveReq"><b>5 Mic check:</b> {result.fiveMicExplanation}</p>
</div>
<div className="tracklist">{result.tracks.map((r:any)=><div key={r.position} className="reviewTrack"><b>{String(r.position).padStart(2,"0")}</b><span>{r.title}<small>{r.artist} — {r.album}{r.year?` (${r.year})`:""}</small></span><em className={`verdict v${r.verdictKey}`}>{r.verdict}{r.gap>0?` · +${r.gap} available`:""}</em></div>)}</div><button className="again" onClick={reset}>RUN IT BACK</button></>}</section>
 :<section className="draft"><div className="progress"><span>TRACK {String(pos).padStart(2,"0")}</span><span>{pos} / {length}</span></div><h1>PICK ONE.</h1><p>Every choice below was Track {pos} on an official album release.</p>{loading?<div className="state">DIGGING THROUGH THE CRATES…</div>:error?<div className="state">{error}<button onClick={()=>location.reload()}>TRY AGAIN</button></div>:<div className="choices">{tracks.map((t,i)=><button key={t.id+t.releaseId} onClick={()=>choose(t)}><span className="num">0{i+1}</span><span><strong>{t.title}</strong><small>{t.artist}</small></span><span className="arrow">→</span></button>)}</div>}<div className="locked">{picks.length} LOCKED · NO GOING BACK</div></section>}</main>
}