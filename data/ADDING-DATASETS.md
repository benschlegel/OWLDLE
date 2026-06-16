# Adding a New Dataset

## 1. Register the id — `data/datasetIds.ts`

Append the new id to `DATASETS` (keep order chronological):

```ts
export const DATASETS = [..., 'owcs-s3', 'owcs-s4'] as const;
```

`Dataset` and `DatasetMode` derive from this array automatically.

## 2. Add metadata — `data/datasets.ts`

Append an entry to `datasetInfo` and extend the two union types:

```ts
// datasetInfo array
{ dataset: 'owcs-s4', formattedName: 'OWCS S4 (2027)', name: 'OWCS S4',
  year: '2027', shorthand: 'S4', league: 'owcs',
  href: 'owcs?season=s4', prettyHref: '/owcs/season4' },

// CombinedDatasetMetadata union
| DatasetMetadata<'owcs-s4'>
```

## 3. Add player data — `data/players/players.ts`

Export a typed player array for the new dataset and add it to `ALL_PLAYERS` (same index position as in `DATASETS`).

## 4. Add logo data — `data/teams/logos.ts`

Export a logo entry for the new dataset and add it to `LOGOS` (same index).

## 5. Add team data — `data/teams/teams.ts`

Export team data for the new dataset and add it to `ALL_TEAMS` (same index).

## 6. Extend `CombinedFormattedPlayer` — `data/players/formattedPlayers.ts`

```ts
| FormattedPlayer<'owcs-s4'>
```

## 7. Verify

```
bun run verify && bun run build
```

`bun run test` includes a dataset-integrity check that confirms every dataset in `DATASETS` has corresponding player, logo, and team data.
