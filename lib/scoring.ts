// Server-only scoring primitives. Do not import into client components.
export function albumScore(scores:number[]){
 const average=scores.reduce((a,b)=>a+b,0)/scores.length;
 const n=Math.max(1,Math.ceil(scores.length*.2));
 const weak=[...scores].sort((a,b)=>a-b).slice(0,n).reduce((a,b)=>a+b,0)/n;
 const eliteRate=scores.filter(x=>x>=95).length/scores.length*100;
 const exceptional=scores.filter(x=>x>=98).length;
 const minimum=Math.min(...scores);

 // Quality dominates. Weak cuts matter heavily; elite cuts provide only a modest bonus.
 const total=average*.76+weak*.20+eliteRate*.04;

 let mics=1;
 if(total>=96 && minimum>=90 && eliteRate>=50 && exceptional>=2) mics=5;
 else if(total>=87) mics=4;
 else if(total>=78) mics=3;
 else if(total>=68) mics=2;

 return {score:Math.round(total*10)/10,mics};
}
