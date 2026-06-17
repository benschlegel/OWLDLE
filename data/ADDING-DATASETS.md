# Adding a New Dataset

## 1. Register the id, `data/datasetIds.ts`

Append the new id to `DATASETS` (keep order chronological):

```ts
export const DATASETS = [..., 'owcs-s3', 'owcs-s4'] as const;
```

`Dataset` and `DatasetMode` derive from this array automatically.

## 2. Add metadata, `data/registry.ts`

Add an entry to `DATASET_REGISTRY` keyed by the new dataset id:

```ts
'owcs-s4': {
  formattedName: 'OWCS S4 (2027)',
  name: 'OWCS S4',
  year: '2027',
  shorthand: 'S4',
  league: 'owcs',
  href: 'owcs?season=s4',
  prettyHref: '/owcs/season4',
  disabledTeams: [],
},
```

`datasetInfo` and `CombinedDatasetMetadata` in `datasets.ts` derive from this automatically, no changes needed there.

## 3. Add player data, `data/players/players.ts`

Export a stage-named player array and a bare alias pointing at it. The alias is
what `ALL_PLAYERS` and the rest of the codebase consume, the stage name is so a
future stage-switch is a small additive diff instead of a destructive rewrite.

```ts
// Stage 1 roster. Next stage: add `owcsS4Stage2Players`, archive this one in
// data/stage-archive.ts, and repoint the alias below.
export const owcsS4Stage1Players: Player<'owcs-s4'>[] = [ ... ];
/** Bare dataset roster always points at the latest stage. */
export const owcsS4Players = owcsS4Stage1Players;
```

Add `owcsS4Players` (the alias) to `CombinedPlayers` union and `ALL_PLAYERS`.

## 4. Add logo data, `data/teams/logos.ts`

Export a logo array and add it to `LOGOS`.

## 5. Add team data, `data/teams/teams.ts`

Add region arrays, then export a named stage-1 team list and reference it from
`ALL_TEAMS`. This gives the next stage-switch a single seam to update.

```ts
// Latest stage team list. Next stage: add OWCS_S4_STAGE2_TEAMS and repoint.
const OWCS_S4_STAGE1_TEAMS = [...EMEA_OWCS_S4, ...NA_OWCS_S4, ...KR_OWCS_S4] as const;
// ...in ALL_TEAMS:
{ dataset: 'owcs-s4', data: OWCS_S4_STAGE1_TEAMS },
```

## 6. Verify

```
bun run verify && bun run build
```

`bun run test` includes a dataset-integrity check that confirms every dataset in `DATASETS` has corresponding player, logo, and team data.

## Switching a season to a new stage

A "stage" is a mid-season roster/team change within an existing dataset (e.g.
OWCS S3 Stage 1 → Stage 2). The **bare dataset key always holds the latest
stage**, the frontend and DB key scheme never change.

### Naming convention

A superseded stage is identified by `<dataset>-stage<N>`, where `N` is the
1-based number of the stage that was live *before* the switch (e.g.
`owcs-s3-stage1`). The bare key (`owcs-s3`) is always the current stage.

### Data side (this repo)

Example: `owcs-s3` moves from Stage 1 to Stage 2 (substitute your dataset id
and camelCase name throughout).

1. **`data/players/players.ts`**, add the new roster as `owcsS3Stage2Players:
   Player<'owcs-s3'>[]`. Move the previous stage's roster into
   `data/stage-archive.ts` under key `'owcs-s3-stage1'` (relaxed `ArchivedPlayer`
   type, see the type definition in that file), then repoint the alias:
   `export const owcsS3Players = owcsS3Stage2Players;`.
2. **`data/teams/teams.ts`**, if the team list changed, add the new stage's
   region arrays and a named const (e.g. `OWCS_S3_STAGE2_TEAMS`), then repoint
   the `ALL_TEAMS` `'owcs-s3'` entry to it.
3. **`data/teams/logos.ts`**, add/adjust logos for new teams; repoint the
   `'owcs-s3'` `LOGOS` entry to the latest-stage logos.
4. **Verify**: `bun run verify && bun run build`. The integrity test confirms
   players/teams/logos are mutually consistent.

This is the only repo change. It is small, typed, and reviewable, no parallel
arrays are reordered.

### Database side (production)

**Do this after the data-side steps above are deployed.** The switch script
reads the new roster directly from the deployed code (`SORTED_PLAYERS`) to pick
the carry-over answer, so the new stage data must be live before you run it.

Archiving the live records and seeding the new stage is done by
`db-scripts/switchStage.ts`, a guarded, atomic, reversible script. Do NOT
hand-run rename + reseed scripts against prod.

#### Database swap (run once, after the data-side deploy is live)

In `db-scripts/switchStage.ts`:

1. Set `const BASE: Dataset = 'owcs-s3'`, `const ENDING_STAGE = 1` (the stage
   number being archived), and the first/second reset dates.
2. Set `ROLLBACK = false` and `I_KNOW_WHAT_I_AM_DOING = true`.
3. Run: `bun db-scripts/switchStage.ts`

It **prepares** the new stage under a staging key (no live impact), then **swaps
atomically** in a transaction: archives the live `owcs-s3` records (all five
collections: players, backlog, answers, iterations, game_logs) to
`owcs-s3-stage1` and promotes the staged records onto `owcs-s3`. The first live
answer is auto-chosen as a **carry-over player** (present in both the old and new
rosters) so the daily puzzle is solvable regardless of deploy timing.

#### Verify after the swap

- The site loads `owcs-s3` with the new roster.
- `/api/validate?dataset=owcs-s3` returns the carry-over answer.
- Cron rolls to the new-stage `next` answer at the following daily reset.

#### Rolling back

If the switch went wrong, set `ROLLBACK = true` (and the same `BASE` /
`ENDING_STAGE`) in `db-scripts/switchStage.ts` and re-run. It restores the
archived stage onto the live `owcs-s3` key. Safest immediately after the swap; if
the new stage has already accumulated daily iterations, those move to the staging
key on rollback.

#### Safety properties

- **No live broken window**, the new stage is fully prepared off the live key,
  then swapped atomically in one transaction (readers never see a partial state).
- **No unsolvable puzzle**, the first live answer is a carry-over player valid in
  both rosters.
- **Idempotent + reversible**, re-running detects the archive and aborts;
  `ROLLBACK` restores the previous stage.
- **All collections archived**, players, backlog, answers (current + next),
  iterations, and game_logs all move together (unlike the old `migrateStage.ts`
  which left answers and backlog behind).
