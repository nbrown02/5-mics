import {NextRequest,NextResponse} from "next/server";

const MB="https://musicbrainz.org/ws/2/recording/";
const UA="5-Mics/0.2 (https://github.com/nbrown02/5-mics)";

function hash(s:string){let h=2166136261;for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619)}return h>>>0}
function art(releaseId:string){return `https://coverartarchive.org/release/${releaseId}/front-250`}

export async function GET(req:NextRequest){
  const position=Math.max(1,Math.min(30,Number(req.nextUrl.searchParams.get("position")||1)));
  // MusicBrainz Recording Search supports tnum (track position), tags and release-group primary type.
  const query=`(tag:"hip hop" OR tag:rap) AND tnum:${position} AND primarytype:album AND status:official`;
  const url=`${MB}?query=${encodeURIComponent(query)}&fmt=json&limit=100`;
  try{
    const r=await fetch(url,{headers:{"User-Agent":UA,"Accept":"application/json"},next:{revalidate:3600}});
    if(!r.ok) throw new Error(`MusicBrainz ${r.status}`);
    const data=await r.json();
    const seen=new Set<string>();
    const pool:any[]=[];
    for(const rec of data.recordings||[]){
      const releases=(rec.releases||[]).filter((x:any)=>x.status==="Official");
      for(const rel of releases){
        const media=rel.media||[];
        const matching=media.some((m:any)=>(m.tracks||[]).some((t:any)=>Number(t.position)===position && (t.recording?.id===rec.id || t.id)));
        // Search results do not always include expanded tracks; tnum in the query already enforces position.
        if(!matching && media.length && !media.some((m:any)=>Number(m["track-count"])>=position)) continue;
        const artist=(rec["artist-credit"]||[]).map((a:any)=>a.name).filter(Boolean).join(" & ")||"Unknown artist";
        const key=`${artist.toLowerCase()}|${rec.title.toLowerCase()}`;
        if(seen.has(key)) continue;
        seen.add(key);
        const year=(rel.date||rel["release-group"]?.["first-release-date"]||"").slice(0,4);
        const signal=Math.max(50,Math.min(99,Math.round(Number(rec.score||70)*.72 + (year?8:0) + (rel["release-group"]?.["primary-type"]==="Album"?8:0) + (hash(rec.id)%12))));
        pool.push({id:rec.id,title:rec.title,artist,album:rel.title,year,position,releaseId:rel.id,artwork:art(rel.id),signal});
        break;
      }
    }
    // Deterministic daily shuffle: different set over time without thrashing the upstream API.
    const day=new Date().toISOString().slice(0,10);
    pool.sort((a,b)=>hash(`${day}-${position}-${a.id}`)-hash(`${day}-${position}-${b.id}`));
    return NextResponse.json({tracks:pool.slice(0,5),position,source:"MusicBrainz"});
  }catch(e:any){
    return NextResponse.json({error:"Could not load tracks",detail:e.message},{status:502});
  }
}
