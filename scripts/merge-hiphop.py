import json,sys
generated=json.load(open(sys.argv[1],encoding="utf-8"))
seed=json.load(open("data/catalog.json",encoding="utf-8"))
# Artist inclusion list is deliberately explicit: MusicBrainz core is CC0 but genre tags live in derived data
# with a different licence. Expand this list as catalogue curation grows.
artists={a["artist"].lower() for a in seed}
extra={
"2pac","50 cent","beastie boys","big pun","big l","black thought","busta rhymes","cam'ron",
"common","cypress hill","de la soul","dmx","dr. dre","eminem","eric b. & rakim","fugees",
"gang starr","ghostface killah","ice cube","j. cole","jadakiss","juvenile","kid cudi",
"lil wayne","ll cool j","lupe fiasco","method man","missy elliott","mos def","n.w.a",
"public enemy","q-tip","redman","rick ross","run-d.m.c.","scarface","snoop dogg",
"souls of mischief","the game","the roots","three 6 mafia","tyler, the creator","ugk",
"vince staples","future","travis scott","pusha t","freddie gibbs","earl sweatshirt",
"schoolboy q","joey bada$$","denzel curry","kid cudi","mac miller","meek mill","jeezy",
"t.i.","ludacris","lil kim","foxy brown","big daddy kane","krs-one","boogie down productions",
"epmd","slick rick","biz markie","onyx","gravediggaz","goodie mob","killer mike","run the jewels"
}
artists |= extra
picked=[a for a in generated if a["artist"].lower() in artists and 1980 <= (a["year"] or 0) <= 2026]
# Deduplicate artist+album, prefer longest edition.
best={}
for a in picked:
    k=(a["artist"].lower(),a["album"].lower())
    if k not in best or len(a["tracks"])>len(best[k]["tracks"]): best[k]=a
cur={(a["artist"].lower(),a["album"].lower()):a for a in seed}
for k,a in best.items():
    if k not in cur: cur[k]=a
result=list(cur.values())
json.dump(result,open("data/catalog.json","w",encoding="utf-8"),ensure_ascii=False,separators=(",",":"))
print("Hip-hop catalogue:",len(result),"albums /",sum(len(a["tracks"]) for a in result),"tracks")
