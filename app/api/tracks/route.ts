import {NextRequest,NextResponse} from "next/server";
import catalog from "@/data/catalog.json";
import {qualityPrior} from "@/lib/priors";

function h(s:string){let x=2166136261;for(const c of s){x^=c.charCodeAt(0);x=Math.imul(x,16777619)}return x>>>0}
function shuffle<T>(xs:T[],seed:string){return [...xs].sort((a:any,b:any)=>h(seed+a.id)-h(seed+b.id))}
export async function GET(req:NextRequest){
 const position=Math.max(1,Math.min(16,Number(req.nextUrl.searchParams.get("position")||1)));
 const seed=req.nextUrl.searchParams.get("seed")||String(Date.now());
 const pool=(catalog as any[]).filter(a=>a.tracks.length>=position).map(a=>{
   const title=a.tracks[position-1];
   return {
    id:`${a.artist}-${a.album}-${position}`,title,artist:a.artist,album:a.album,
    year:String(a.year),position,releaseId:"",artwork:null,
    prior:qualityPrior(a.artist,a.album,title)
   };
 });
 if(pool.length<5)return NextResponse.json({error:"Catalogue needs more albums at this track position."},{status:500});

 // Deal a deliberately mixed hand. There should normally be one genuinely
 // elite option, one strong option, two middling options and one risky option.
 // Scores remain hidden from the player.
 const bands=[
   pool.filter(x=>x.prior>=92),
   pool.filter(x=>x.prior>=84&&x.prior<92),
   pool.filter(x=>x.prior>=72&&x.prior<84),
   pool.filter(x=>x.prior<72)
 ];
 const wanted=[1,1,2,1], deal:any[]=[], used=new Set<string>(), artists=new Set<string>();
 for(let b=0;b<bands.length;b++){
   for(const x of shuffle(bands[b],`${seed}|${position}|${b}`)){
     if(deal.filter(d=>d.prior>=92).length>=wanted[0]&&b===0) break;
     if(deal.filter(d=>d.prior>=84&&d.prior<92).length>=wanted[1]&&b===1) break;
     if(deal.filter(d=>d.prior>=72&&d.prior<84).length>=wanted[2]&&b===2) break;
     if(deal.filter(d=>d.prior<72).length>=wanted[3]&&b===3) break;
     if(!used.has(x.id)&&!artists.has(x.artist.toLowerCase())){
       deal.push(x);used.add(x.id);artists.add(x.artist.toLowerCase());
     }
   }
 }
 // Small seed catalogues may not populate every band at every position.
 for(const x of shuffle(pool,`${seed}|${position}|fill`)){
   if(deal.length>=5)break;
   if(!used.has(x.id)&&!artists.has(x.artist.toLowerCase())){
     deal.push(x);used.add(x.id);artists.add(x.artist.toLowerCase());
   }
 }
 return NextResponse.json({tracks:shuffle(deal,`${seed}|${position}|display`).slice(0,5),position,poolSize:pool.length});
}
