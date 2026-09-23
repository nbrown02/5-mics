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

## v1.3 rating changes

Five Mics is intentionally rare. It now requires:
- 96+ weighted album score
- no selected track below 90
- at least half of the album at 95+
- at least two tracks at 98+

The result screen uses an original five-microphone visual: filled microphones show the awarded rating and outlined/faded microphones show the remainder. It is CSS artwork created for this app rather than copied Source artwork.
