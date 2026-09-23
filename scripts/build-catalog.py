import csv,json,re,sys
from collections import defaultdict
inp=sys.argv[1] if len(sys.argv)>1 else "us-albums.csv"
out=sys.argv[2] if len(sys.argv)>2 else "data/catalog.generated.json"
rows=defaultdict(list)
with open(inp,encoding="utf-8") as f:
    for r in csv.DictReader(f):
        key=(r["artist"],r["album"],r["year"])
        rows[key].append((int(r["position"]),r["track"]))
albums=[]
for (artist,album,year),tracks in rows.items():
    tracks=sorted(tracks)
    if len(tracks)<5: continue
    # Keep contiguous first-disc album track order only.
    if [p for p,_ in tracks] != list(range(1,len(tracks)+1)): continue
    albums.append({"artist":artist,"album":album,"year":int(year) if year and year.isdigit() else None,
                   "quality":72,"tracks":[t for _,t in tracks]})
with open(out,"w",encoding="utf-8") as f: json.dump(albums,f,ensure_ascii=False,separators=(",",":"))
print(f"Wrote {len(albums):,} US album editions to {out}")
