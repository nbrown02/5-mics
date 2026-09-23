import {NextRequest,NextResponse} from "next/server";
import {albumScore} from "@/lib/scoring";
const clamp=(x:any)=>Math.max(40,Math.min(99,Number(x||60)));
export async function POST(req:NextRequest){
 const {picks}=await req.json();
 if(!Array.isArray(picks)||picks.length<1)return NextResponse.json({error:"No album supplied"},{status:400});
 const scores=picks.map((p:any)=>clamp(p?.track?.prior));
 const result=albumScore(scores);
 const details=picks.map((p:any,i:number)=>{
   const chosen=clamp(p.track?.prior);
   const offered=(Array.isArray(p.offered)&&p.offered.length?p.offered:[p.track]);
   const bestTrack=offered.reduce((a:any,b:any)=>clamp(b.prior)>clamp(a.prior)?b:a,offered[0]);
   const best=clamp(bestTrack.prior),gap=Math.max(0,best-chosen);
   let verdict="WEAK PICK",verdictKey="weak";
   if(gap===0){verdict="BEST PICK";verdictKey="best"}
   else if(gap<=4){verdict="GREAT PICK";verdictKey="great"}
   else if(gap<=10){verdict="SOLID PICK";verdictKey="solid"}
   else if(gap<=18){verdict="COSTLY MISS";verdictKey="costly"}
   return {position:p.position,title:p.track.title,artist:p.track.artist,album:p.track.album,year:p.track.year,
           score:chosen,bestScore:best,gap,verdict,verdictKey,bestTitle:bestTrack.title};
 });
 const bestPicks=details.filter((d:any)=>d.gap===0).length;
 const eliteCount=scores.filter((x:number)=>x>=92).length;
 const exceptional=scores.filter((x:number)=>x>=96).length;
 const minimum=Math.min(...scores);
 const biggestMiss=[...details].sort((a:any,b:any)=>b.gap-a.gap)[0];
 const needElite=Math.ceil(scores.length*.75), needExceptional=Math.ceil(scores.length*.35);
 const failures:string[]=[];
 if(result.score<92) failures.push(`album score ${result.score}/92`);
 if(minimum<82) failures.push(`weakest track ${minimum}/82`);
 if(eliteCount<needElite) failures.push(`${eliteCount}/${needElite} elite tracks`);
 if(exceptional<needExceptional) failures.push(`${exceptional}/${needExceptional} exceptional tracks`);
 const fiveMicExplanation=result.mics===5
   ?`You cleared every requirement: ${eliteCount} elite tracks, ${exceptional} exceptional tracks, no selection below ${minimum}, and a ${result.score} album score.`
   :`You missed ${failures.join(", ")}.`;
 let summary="";
 if(result.mics===5) summary=`You chose the strongest option in ${bestPicks} of ${scores.length} rounds and kept the floor high enough that there was no meaningful drop-off.`;
 else if(biggestMiss.gap>=12) summary=`Track ${biggestMiss.position} did the most damage. You left ${biggestMiss.gap} points on the table there. Across the draft you chose the strongest available track ${bestPicks} of ${scores.length} times.`;
 else summary=`You chose the strongest available track ${bestPicks} of ${scores.length} times. The album was ${eliteCount>=needElite?"elite often enough, but the floor or exceptional-track count held it back":`short of the ${needElite} elite selections needed for 5 Mics`}.`;
 return NextResponse.json({...result,bestPicks,eliteCount,exceptional,minimum,
   biggestMiss:{position:biggestMiss.position,chosen:biggestMiss.title,best:biggestMiss.bestTitle,gap:biggestMiss.gap},
   summary,fiveMicExplanation,tracks:details});
}