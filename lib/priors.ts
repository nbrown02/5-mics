type Prior={artist:string;album:string;score:number};
export const ALBUM_PRIORS:Prior[]=[
{artist:"Nas",album:"Illmatic",score:99},{artist:"The Notorious B.I.G.",album:"Ready to Die",score:97},
{artist:"Wu-Tang Clan",album:"Enter the Wu-Tang (36 Chambers)",score:97},{artist:"A Tribe Called Quest",album:"The Low End Theory",score:96},
{artist:"A Tribe Called Quest",album:"Midnight Marauders",score:96},{artist:"OutKast",album:"Aquemini",score:97},
{artist:"OutKast",album:"ATLiens",score:95},{artist:"Kendrick Lamar",album:"To Pimp a Butterfly",score:99},
{artist:"Kendrick Lamar",album:"good kid, m.A.A.d city",score:97},{artist:"Kendrick Lamar",album:"DAMN.",score:94},
{artist:"Jay-Z",album:"The Blueprint",score:96},{artist:"Jay-Z",album:"Reasonable Doubt",score:96},
{artist:"Lauryn Hill",album:"The Miseducation of Lauryn Hill",score:97},{artist:"Public Enemy",album:"It Takes a Nation of Millions to Hold Us Back",score:98},
{artist:"N.W.A",album:"Straight Outta Compton",score:94},{artist:"Dr. Dre",album:"The Chronic",score:96},
{artist:"Snoop Dogg",album:"Doggystyle",score:94},{artist:"2Pac",album:"Me Against the World",score:94},
{artist:"2Pac",album:"All Eyez on Me",score:93},{artist:"Mobb Deep",album:"The Infamous",score:96},
{artist:"Raekwon",album:"Only Built 4 Cuban Linx…",score:96},{artist:"GZA",album:"Liquid Swords",score:96},
{artist:"MF DOOM",album:"MM..FOOD",score:94},{artist:"Madvillain",album:"Madvillainy",score:98},
{artist:"Kanye West",album:"The College Dropout",score:95},{artist:"Kanye West",album:"Late Registration",score:95},
{artist:"Kanye West",album:"My Beautiful Dark Twisted Fantasy",score:97},{artist:"Clipse",album:"Hell Hath No Fury",score:95},
{artist:"Pusha T",album:"DAYTONA",score:93},{artist:"Freddie Gibbs & Madlib",album:"Piñata",score:95},
{artist:"Mos Def",album:"Black on Both Sides",score:95},{artist:"Black Star",album:"Mos Def & Talib Kweli Are Black Star",score:95},
{artist:"De La Soul",album:"3 Feet High and Rising",score:96},{artist:"Eric B. & Rakim",album:"Paid in Full",score:96},
{artist:"Gang Starr",album:"Moment of Truth",score:94},{artist:"The Roots",album:"Things Fall Apart",score:95},
{artist:"Common",album:"Be",score:94},{artist:"Eminem",album:"The Marshall Mathers LP",score:95},
{artist:"Missy Elliott",album:"Supa Dupa Fly",score:94},{artist:"Lil Wayne",album:"Tha Carter III",score:93},
{artist:"UGK",album:"Ridin' Dirty",score:95},{artist:"Scarface",album:"The Diary",score:94},
{artist:"Three 6 Mafia",album:"Mystic Stylez",score:93},{artist:"Future",album:"DS2",score:92},
{artist:"Travis Scott",album:"Rodeo",score:91},{artist:"Tyler, the Creator",album:"IGOR",score:94},
{artist:"J. Cole",album:"2014 Forest Hills Drive",score:91},{artist:"Little Simz",album:"Sometimes I Might Be Introvert",score:95},
{artist:"Dizzee Rascal",album:"Boy in da Corner",score:96},{artist:"Skepta",album:"Konnichiwa",score:93},
{artist:"Dave",album:"Psychodrama",score:93},{artist:"Stormzy",album:"Gang Signs & Prayer",score:90}
];

const TRACK_BONUSES:Record<string,number>={
"n.y. state of mind":4,"shook ones, pt. ii":4,"c.r.e.a.m.":4,"juicy":4,"respiration":4,
"93 'til infinity":4,"electric relaxation":4,"mass appeal":4,"intl players anthem (i choose you)":4,
"sing about me, i'm dying of thirst":4,"alright":4,"wesley's theory":3,"m.a.a.d city":4,
"dead presidents ii":4,"d'evils":3,"heart of the city (ain't no love)":3,"u don't know":3,
"the world is yours":4,"memory lane (sittin' in da park)":3,"life's a bitch":3,"ny state of mind":4,
"straight outta compton":4,"fuck tha police":3,"nuthin' but a 'g' thang":4,"gin and juice":4,
"protect ya neck":3,"triumph":4,"above the clouds":4,"accordion":4,"rapp snitch knishes":3,
"all caps":4,"runaway":4,"devil in a new dress":4,"through the wire":3,"jesus walks":3,
"grindin'":4,"numbers on the boards":3,"scenario":4,"award tour":3,"they reminisce over you (t.r.o.y.)":4,
"paid in full":4,"the message":4,"stan":4,"lose yourself":4,"get ur freak on":4,
"work it":3,"a milli":4,"6 foot 7 foot":3,"int'l players anthem (i choose you)":4,
"how much a dollar cost":3,"dna.":3,"fear.":3,"money trees":4,"bitch, don't kill my vibe":3,
"doomsday":3,"one beer":3,"otis":3,"power":3,"all falls down":3,"touch the sky":3
};
function norm(s:string){return s.toLowerCase().replace(/[’‘]/g,"'").replace(/\s+/g," ").trim()}
function hash01(s:string){
 let h=2166136261;
 for(const c of s){h^=c.charCodeAt(0);h=Math.imul(h,16777619)}
 return (h>>>0)/4294967295;
}
export function qualityPrior(artist:string,album:string,title:string){
 const a=norm(artist), al=norm(album), t=norm(title);
 let albumScore=78;
 for(const p of ALBUM_PRIORS){
   const pa=norm(p.artist), pal=norm(p.album);
   if((a.includes(pa)||pa.includes(a))&&(al===pal||al.includes(pal)||pal.includes(al))){
     albumScore=p.score; break;
   }
 }
 // Album reputation is only a starting point. Individual cuts vary widely.
 // Stable title variation gives every track its own hidden score instead of
 // awarding every song on a classic album a 95+.
 const variation=Math.round((hash01(`${a}|${al}|${t}`)-.5)*30); // -15..+15
 const landmark=(TRACK_BONUSES[t]||0)*3;
 const base=58+(albumScore-70)*.72;
 return Math.max(48,Math.min(99,Math.round(base+variation+landmark)));
}
