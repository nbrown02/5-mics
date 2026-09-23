import {NextRequest,NextResponse} from "next/server";
import {albumScore} from "@/lib/scoring";
export async function POST(req:NextRequest){
 const {picks}=await req.json();
 if(!Array.isArray(picks)||picks.length<1)return NextResponse.json({error:"No album supplied"},{status:400});
 const scores=picks.map((p:any)=>Math.max(40,Math.min(99,Number(p?.track?.prior||60))));
 const result=albumScore(scores);
 const weakest=scores.indexOf(Math.min(...scores))+1;
 return NextResponse.json({...result,weakestTrack:weakest});
}