import {NextRequest,NextResponse} from "next/server";
import catalog from "@/data/catalog.json";
function h(s:string){let x=2166136261;for(const c of s){x^=c.charCodeAt(0);x=Math.imul(x,16777619)}return x>>>0}
export async function GET(req:NextRequest){
 const position=Math.max(1,Math.min(16,Number(req.nextUrl.searchParams.get("position")||1)));
 const seed=req.nextUrl.searchParams.get("seed")||String(Date.now());
 const pool=(catalog as any[]).filter(a=>a.tracks.length>=position).map(a=>({
  id:`${a.artist}-${a.album}-${position}`,title:a.tracks[position-1],artist:a.artist,album:a.album,
  year:String(a.year),position,releaseId:"",artwork:null,prior:a.quality
 }));
 pool.sort((a,b)=>h(seed+position+a.id)-h(seed+position+b.id));
 if(pool.length<5)return NextResponse.json({error:"Catalogue needs more albums at this track position."},{status:500});
 return NextResponse.json({tracks:pool.slice(0,5),position,poolSize:pool.length});
}