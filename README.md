# 5 Mics

Can you build a 5 Mic hip-hop album?

This build uses **real release/track metadata from MusicBrainz**. There is no fake demo catalogue. Each round asks the server for hip-hop recordings that actually occur at the requested track position on an album. Album artwork is resolved from the Cover Art Archive when available.

## Run

```bash
npm install
npm run dev
```

No API key is required for this MVP.

## Deploy

Import the repo into Vercel. Framework: Next.js. No environment variables are required.

## Data behaviour

The `/api/tracks?position=N` route searches MusicBrainz for hip-hop/rap album recordings at track N, filters unusable/duplicate results, chooses five, and caches responses. MusicBrainz asks clients to stay at or below one request/second and identify themselves with a meaningful User-Agent; this app makes one upstream request per uncached position query and uses Next.js caching.

The production catalogue should eventually be pre-ingested into our own database. That gives us tighter editorial control, faster play, better duplicate/deluxe handling and a richer scoring model.

## Scoring

The score endpoint is server-side. The browser never receives individual hidden quality values. For this live-data MVP it combines MusicBrainz search confidence, catalogue metadata signals, consistency, and deterministic tie-breaking. The next production step is replacing that proxy with a curated/acclaim/listener dataset while retaining the same server API.

© 2026. All rights reserved.
