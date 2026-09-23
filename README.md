# 5 Mics v1.1

This fixes the live catalogue problem in v1.

- US hip-hop only; UK-specific catalogue removed.
- Real MusicBrainz track-position data.
- Different games rotate through much larger search windows instead of repeatedly using the first results.
- MusicBrainz 429/503 responses retry with backoff.
- Six-hour server/CDN caching reduces upstream calls.
- Five-choice hands are deliberately mixed across quality tiers.
- Hidden album scoring remains server-side.
- Next.js uses the current release at install/deploy time.

There are no API keys or environment variables.

## Deploy
Replace the existing repo contents with these files, commit and push. Vercel should deploy automatically.

## Architecture note
This is resilient enough for testing, but a public launch should ingest the catalogue into our own database rather than make MusicBrainz part of the gameplay request path. MusicBrainz's public API is rate-limited and its normal web service is intended for non-commercial use.

© 2026. All rights reserved.
