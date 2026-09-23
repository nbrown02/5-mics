# 5 Mics v1.2 — local catalogue

This build removes MusicBrainz from the gameplay request path completely.

- US hip-hop only.
- Track choices come from `data/catalog.json` bundled with the app.
- No external metadata API call is made while playing.
- No API rate-limit failure after several tracks.
- A per-game seed changes the five choices on repeat plays.
- Hidden scoring remains server-side.
- No environment variables are required.

The bundled catalogue is the first local seed. The architecture is now the same one intended for the larger catalogue: expand/import the local data without changing gameplay.

MusicBrainz core metadata is CC0. For a larger automated catalogue import, use only the CC0 `mbdump.tar.bz2` core dump; do not ingest supplementary tags/ratings unless separately licensed.

© 2026. All rights reserved.
