# Adding a New Dataset

Checklist of files to update when adding a new dataset (e.g. `owcs-s4`).

## 1. `data/datasetIds.ts`
- Add the new id to the `DATASETS` array. This is the single source of truth for dataset ids.
- The position in the array controls display ordering (e.g. in dataset selectors); the integrity test guards everything else.

## 2. `data/registry.ts`
- Add one entry to `DATASET_REGISTRY` keyed by the new id, providing all metadata fields and `disabledTeams`.
- The compiler will produce an error until this entry exists and every `disabledTeams` value is a valid team name for that dataset.
- `datasetInfo` (in `datasets.ts`) and `DISABLED_TEAMS_CONFIG` (in `disabledTeams.ts`) are both derived from this registry automatically — no manual edits needed there.

## 3. `data/players/players.ts`
- Create and export a new player array (e.g. `export const owcsS4Players: Player<'owcs-s4'>[] = [...]`)
- Add type to `CombinedPlayers` union
- Add array to `ALL_PLAYERS`

## 4. `data/teams/teams.ts`
- Add region team arrays (e.g. `EMEA_OWCS_S4`, `NA_OWCS_S4`, `KR_OWCS_S4`, `CN_OWCS_S4`)
- Add entries to `ALL_EMEA`, `ALL_NA`, `ALL_KR`, `ALL_CN` (as applicable)
- Add entry to `ALL_TEAMS` with all regions spread together

## 5. `data/teams/logos.ts`
- Create and export a new logos array (e.g. `TEAM_LOGOS_OWCS_S4`)
- Add type to `CombinedLogoData` union
- Add entry to `LOGOS` array

## 6. `data/endless-filter-config.ts` (optional)
- Add an `ENDLESS_FILTER_CONFIGS` entry if the dataset needs region/partner filters for endless mode.

## 7. Verify
- Run `bun run verify`. The integrity test now fails loudly if players, teams, or logos are missing or misaligned.

## 8. Seed the database
- Run `db-scripts/generateDatasetData.ts` for the new dataset: set its `DATASET` const and the first reset date, then flip the `I_KNOW_WHAT_I_AM_DOING` guard.
- Until this runs, the dataset has no daily answer and the `/api/validate?dataset=all` route skips it.

## Notes
- **Display ordering** is determined by position in the `DATASETS` array in `data/datasetIds.ts`. The integrity test guards data correctness; positional ordering of the other arrays (players, logos, teams) is not required.
- Region getter functions (`getEmea`, `getNa`, `getKr`, `getCn`) and `HelpContent` work dynamically — no changes needed there unless adding a new region.
