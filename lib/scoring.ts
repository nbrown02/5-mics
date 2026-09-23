// Server-only scoring primitives.
export function albumScore(scores:number[]){
 const average=scores.reduce((a,b)=>a+b,0)/scores.length;
 const sorted=[...scores].sort((a,b)=>a-b);
 const n=Math.max(1,Math.ceil(scores.length*.25));
 const weak=sorted.slice(0,n).reduce((a,b)=>a+b,0)/n;
 const eliteCount=scores.filter(x=>x>=92).length;
 const exceptional=scores.filter(x=>x>=96).length;
 const minimum=Math.min(...scores);
 const total=average*.72+weak*.28;

 let mics=1;
 if(
   total>=92 &&
   minimum>=82 &&
   eliteCount>=Math.ceil(scores.length*.75) &&
   exceptional>=Math.ceil(scores.length*.35)
 ) mics=5;
 else if(total>=84 && minimum>=70) mics=4;
 else if(total>=75) mics=3;
 else if(total>=65) mics=2;

 return {score:Math.round(total*10)/10,mics};
}
