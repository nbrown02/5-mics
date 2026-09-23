import {NextRequest,NextResponse} from "next/server";
import {qualityPrior} from "@/lib/priors";

const UA="5-Mics/1.1 (https://github.com/nbrown02/5-mics)";
const MB="https://musicbrainz.org/ws/2/recording/";

function h(s:string){let x=2166136261;for(const c of s){x^=c.charCodeAt(0);x=Math.imul(x,16777619)}return x>>>0}
function sleep(ms:number){return new Promise(r=>setTimeout(r,ms))}
async function mbFetch(url:string){
 let last=500;
 for(let attempt=0;attempt<4;attempt++){
   const r=await fetch(url,{headers:{"User-Agent":UA,Accept:"application/json"},next:{revalidate:21600}});
   if(r.ok)return r;
   last=r.status;
   if(r.status!==503&&r.status!==429)break;
   await sleep(1100+(attempt*900));
 }
 throw new Error(`MusicBrainz returned ${last}`);
}
export async function GET(req:NextRequest){
 const position=Math.max(1,Math.min(20,Number(req.nextUrl.searchParams.get("position")||1)));
 const seed=req.nextUrl.searchParams.get("seed")||new Date().toISOString().slice(0,10);
 // country:US intentionally keeps this edition US-focused; no UK-specific catalogue.
 const q=`(tag:"hip hop" OR tag:"hip-hop" OR tag:rap) AND tnum:${position} AND primarytype:album AND status:official AND country:US`;
 // Rotate across the search index so every game doesn't see the same top 100.
 const offset=(h(`${seed}:${position}`)%8)*100;
 const url=`${MB}?query=${encodeURIComponent(q)}&fmt=json&limit=100&offset=${offset}`;
 try{
   const r=await mbFetch(url), j=await r.json();
   const seen=new Set<string>(), pool:any[]=[];
   for(const rec of j.recordings||[]){
     const releases=(rec.releases||[]).filter((x:any)=>x.status==="Official"&&x.country==="US");
     for(const rel of releases){
       const artist=(rec["artist-credit"]||[]).map((x:any)=>x.name).filter(Boolean).join(" & ");
       if(!artist||!rel.title)continue;
       const key=`${artist}|${rec.title}`.toLowerCase();
       if(seen.has(key))continue; seen.add(key);
       const prior=qualityPrior(artist,rel.title,rec.title);
       pool.push({id:rec.id,title:rec.title,artist,album:rel.title,
         year:(rel.date||rec["first-release-date"]||"").slice(0,4),
         position,releaseId:rel.id,
         artwork:`https://coverartarchive.org/release/${rel.id}/front-250`,
         prior});
       break;
     }
   }
   // Mix the hand: one top-tier candidate where possible, two strong/mid,
   // and two wildcards. Randomness is seeded per game+position.
   const sh=(a:any[],salt:string)=>[...a].sort((a,b)=>h(seed+position+salt+a.id)-h(seed+position+salt+b.id));
   const elite=pool.filter(x=>x.prior>=94);
   const strong=pool.filter(x=>x.prior>=88&&x.prior<94);
   const field=pool.filter(x=>x.prior<88);
   let deal=[...sh(elite,"e").slice(0,1),...sh(strong,"s").slice(0,2),...sh(field,"f").slice(0,2)];
   if(deal.length<5)deal.push(...sh(pool.filter(x=>!deal.some(d=>d.id===x.id)),"x").slice(0,5-deal.length));
   deal=sh(deal,"deal").slice(0,5);
   if(deal.length<5)throw new Error(`Only ${deal.length} suitable US tracks returned`);
   return NextResponse.json({tracks:deal,position,poolSize:pool.length},
     {headers:{"Cache-Control":"public, s-maxage=21600, stale-while-revalidate=86400"}});
 }catch(e:any){
   return NextResponse.json({error:"Couldn't load this round. Tap retry.",detail:e.message},{status:502});
 }
}