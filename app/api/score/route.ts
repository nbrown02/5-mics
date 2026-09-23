import {NextRequest,NextResponse} from "next/server";
function hash(s:string){let h=2166136261;for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619)}return h>>>0}
export async function POST(req:NextRequest){
 const {picks}=await req.json();
 if(!Array.isArray(picks)||!picks.length)return NextResponse.json({error:"No picks"},{status:400});
 // Server-side: don't expose per-track hidden scores to the client.
 const scores=picks.map((p:any)=>{
   const base=Math.max(45,Math.min(99,Number(p.track?.signal||65)));
   const stable=(hash(String(p.track?.id||""))%9)-4;
   return Math.max(40,Math.min(99,base+stable));
 });
 const avg=scores.reduce((a:number,b:number)=>a+b,0)/scores.length;
 const n=Math.max(1,Math.ceil(scores.length*.2));
 const low=[...scores].sort((a,b)=>a-b).slice(0,n).reduce((a,b)=>a+b,0)/n;
 const elite=scores.filter((x:number)=>x>=90).length/scores.length*100;
 const total=avg*.70+low*.20+elite*.10;
 let mics=1;
 if(total>=90&&Math.min(...scores)>=75)mics=5; else if(total>=80)mics=4; else if(total>=70)mics=3; else if(total>=60)mics=2;
 return NextResponse.json({score:Math.round(total*10)/10,mics});
}
