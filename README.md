# 5 Mics v1.4 — large-catalogue pipeline

The app still plays entirely from `data/catalog.json`; there are no MusicBrainz requests during gameplay.

This version also includes the production catalogue pipeline for MusicBrainz's CC0 core dump:

1. Import the official `mbdump.tar.bz2` core dump into PostgreSQL using MusicBrainz's documented tooling.
2. Run `psql ... -f scripts/export-us-albums.sql > us-albums.csv`.
3. Run `python scripts/build-catalog.py us-albums.csv data/catalog.generated.json`.
4. Run `python scripts/merge-hiphop.py data/catalog.generated.json`.

The pipeline selects official US album releases, preserves ordered track positions, deduplicates editions, then filters against an explicit US hip-hop artist set. We intentionally do not use MusicBrainz derived tags/ratings because those are not CC0.

The game API draws from the resulting local JSON and avoids duplicate artists in a five-track hand where possible.

Important: the ZIP does not contain the multi-gigabyte MusicBrainz dump itself. That upstream dump is not suitable for committing to a Vercel/GitHub application repository.

© 2026. All rights reserved.
