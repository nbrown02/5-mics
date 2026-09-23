// Server-only scoring primitives. Do not import into client components.
export function albumScore(scores:number[]){
 const average=scores.reduce((a,b)=>a+b,0)/scores.length;
 const n=Math.max(1,Math.ceil(scores.length*.2));
 const weak=[...scores].sort((a,b)=>a-b).slice(0,n).reduce((a,b)=>a+b,0)/n;
 const elite=scores.filter(x=>x>=90).length/scores.length*100;
 const total=average*.70+weak*.20+elite*.10;
 let mics=1;
 if(total>=90&&Math.min(...scores)>=75)mics=5;
 else if(total>=80)mics=4; else if(total>=70)mics=3; else if(total>=60)mics=2;
 return {score:Math.round(total*10)/10,mics};
}