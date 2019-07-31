# collector

Imports station data into the SMAI database.

## Adding a new collector

Each shared mobility services needs its own collector. To add a new one
two basic functionality modules must be provided:

 - `collector` – reads input snapshot from the given `.tar.gz` file,
   parses them and imports each into the Postgres database.
 - `init-database` – creates the tables needed for the given service.
   Sets all metadata for the mobility service, e.g. URLs and slugs.
   
You should validate each `.tar.gz` before importing it. Are all known
stations present? Any missing snapshots due to a service outage?
Your modules are responsible for the correct import into the snapshot
database.

If you want to add a shared mobility service by *ACME Inc.* create
these two modules under `/src/services/acme/` and you can initializes
with `node index.js init-database acme /path/to/acme-snapshots.tar.gz`