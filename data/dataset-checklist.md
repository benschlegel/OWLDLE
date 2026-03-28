# Adding a New Dataset

Checklist of files to update when adding a new dataset (e.g. `owcs-s4`).

## 1. `data/datasets.ts`
- Add entry to `DATASETS` array
- Add to `CombinedDatasetMetadata` union type
- Add metadata object to `datasetInfo` (including `href`)

## 2. `data/players/players.ts`
- Create and export a new player array (e.g. `export const owcsS4Players: Player<'owcs-s4'>[] = [...]`)
- Add type to `CombinedPlayers` union
- Add array to `ALL_PLAYERS`

## 3. `data/players/formattedPlayers.ts`
- Add dataset name to local `datasets` array
- Add type to `CombinedFormattedPlayer` union

## 4. `data/teams/teams.ts`
- Add region team arrays (e.g. `EMEA_OWCS_S4`, `NA_OWCS_S4`, `KR_OWCS_S4`, `CN_OWCS_S4`)
- Add entries to `ALL_EMEA`, `ALL_NA`, `ALL_KR`, `ALL_CN` (as applicable)
- Add entry to `ALL_TEAMS` with all regions spread together

## 5. `data/teams/logos.ts`
- Create and export a new logos array (e.g. `TEAM_LOGOS_OWCS_S4`)
- Add type to `CombinedLogoData` union
- Add entry to `LOGOS` array

## Notes
- All parallel arrays (`datasetInfo`, `ALL_PLAYERS`, `LOGOS`, `ALL_TEAMS`, `datasets` in formattedPlayers) are indexed positionally and **must stay in the same order**.
- Region getter functions (`getEmea`, `getNa`, `getKr`, `getCn`) and `HelpContent` work dynamically — no changes needed there unless adding a new region.
