"use client";
import {useEffect,useState} from "react";
import type {Pick,Track} from "@/lib/types";
const lengths=[8,10,12,14,16];

export default function Home(){
 const [length,setLength]=useState<number|null>(null),[picks,setPicks]=useState<Pick[]>([]);
 const [tracks,setTracks]=useState<Track[]>([]),[loading,setLoading]=useState(false),[error,setError]=useState("");
 const [result,setResult]=useState<{score:number,mics:number}|null>(null);
 const pos=picks.length+1, done=length!==null&&picks.length===length;

 useEffect(()=>{if(!length||done)return;setLoading(true);setError("");fetch(`/api/tracks?position=${pos}`).then(r=>r.json()).then(d=>{if(d.error)throw new Error(d.error);if(!d.tracks?.length)throw new Error("No tracks found for this position.");setTracks(d.tracks)}).catch(e=>setError(e.message)).finally(()=>setLoading(false))},[length,pos,done]);

 useEffect(()=>{if(!done||result)return;fetch("/api/score",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({picks})}).then(r=>r.json()).then(setResult)},[done,picks,result]);

 const choose=(track:Track)=>{setTracks([]);setPicks(v=>[...v,{position:pos,track}])};
 const reset=()=>{setLength(null);setPicks([]);setResult(null);setTracks([])};

 return <main><header><div className="brand">5 MICS</div><div className="tag">CAN YOU BUILD A 5 MIC ALBUM?</div></header>
 {!length?<section className="hero"><p className="kicker">THE HIP-HOP ALBUM DRAFT</p><h1>BUILD YOUR<br/>PERFECT ALBUM.</h1><p>Five choices per round. Every song really occupied that position on its original album.</p><h2>HOW MANY TRACKS?</h2><div className="lengths">{lengths.map(n=><button key={n} onClick={()=>setLength(n)}>{n}</button>)}</div></section>:
 done?<section className="result"><p className="kicker">FINAL VERDICT</p>{!result?<h2>JUDGING YOUR ALBUM…</h2>:<><div className="micScore">{result.mics}<span>/5</span></div><h1>{result.mics===5?"5 MICS. CLASSIC.":result.mics===4?"4 MICS. HEAT.":result.mics===3?"3 MICS. SOLID.":"BACK TO THE LAB."}</h1><p className="number">Album score {result.score}</p><div className="tracklist">{picks.map(p=><div key={p.position}><b>{String(p.position).padStart(2,"0")}</b><span>{p.track.title}<small>{p.track.artist} · {p.track.album}{p.track.year?` · ${p.track.year}`:""}</small></span></div>)}</div><button className="again" onClick={reset}>BUILD ANOTHER</button></>}</section>:
 <section className="draft"><div className="progress"><span>TRACK {String(pos).padStart(2,"0")}</span><span>{pos} / {length}</span></div><h1>PICK ONE.</h1><p>All five originally appeared at Track {pos}.</p>{loading?<div className="loading">DIGGING THROUGH THE CRATES…</div>:error?<div className="error">{error}<button onClick={()=>location.reload()}>TRY AGAIN</button></div>:<div className="choices">{tracks.map((t,i)=><button key={t.id+"-"+t.releaseId} onClick={()=>choose(t)}><span className="num">0{i+1}</span><span className="cover">{t.artwork?<img src={t.artwork} alt="" onError={e=>(e.currentTarget.style.display="none")}/>:null}</span><span><strong>{t.title}</strong><small>{t.artist}</small></span><span className="arrow">→</span></button>)}</div>}<div className="chosen">{picks.length} TRACK{picks.length===1?"":"S"} LOCKED</div></section>}
 </main>
}
