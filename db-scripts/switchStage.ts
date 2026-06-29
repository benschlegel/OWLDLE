// RUNBOOK: switching <base> from stage N to stage N+1:
//  1. Land the new-stage repo data on main and DEPLOY it.
//     (The guessable roster is served from the deployed bundle.)
//  2. Set BASE, ENDING_STAGE (= N), reset dates; set I_KNOW_WHAT_I_AM_DOING = true.
//  3. Run: bun db-scripts/switchStage.ts   (prepares staging, then swaps atomically)
//  4. Verify the site: current answer is a carry-over player (valid in both rosters);
//     /api/validate?dataset=<base> returns it.
//  5. If something is wrong, set ROLLBACK = true and re-run to restore stage N.
// Because `current` is a carry-over player, the puzzle stays solvable whether or
// not the deploy in step 1 has fully propagated.

import type { Dataset } from '@/data/datasets';
import { dbClient, database } from '@/lib/databaseAccess';
import { getDisabledTeams } from '@/data/disabledTeams';
import { SORTED_PLAYERS } from '@/data/players/formattedPlayers';
import { formattedToDbPlayer } from '@/lib/databaseHelpers';
import { runStageSwitch, runStageRollback, COLLECTION_NAMES } from '@/lib/stageSwitch';
import { trimDate } from '@/lib/utils';
import type { AnswerKey, DbAnswerFull, DbFormattedPlayers } from '@/types/database';
import { exit } from 'node:process';

// ! SAFETY: Set to true to allow this script to run. Reset to false after use.
const I_KNOW_WHAT_I_AM_DOING = false;
if (!I_KNOW_WHAT_I_AM_DOING) {
	console.error('Safety guard is enabled. Set I_KNOW_WHAT_I_AM_DOING to true to run this script.');
	exit(1);
}

// ! Configure the base dataset key (the live key, e.g. 'owcs-s3').
const BASE: Dataset = 'owcs-s3';

// ! The stage number currently live (i.e. the one being archived, e.g. 1 for Stage 1 → Stage 2).
const ENDING_STAGE = 1;

// ! Set to true to roll back a previously applied switch (restores archive → live).
const ROLLBACK = false;

// ! Configure first and second reset dates for the new stage (in UTC).
// ! Keep in mind that JavaScript months start at 0.
const now = new Date();
const firstReset = trimDate(new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate(), 22, 0, 0)));
const secondReset = new Date(firstReset);
secondReset.setDate(secondReset.getDate() + 1);

console.log('Node env:', process.env.NODE_ENV);
console.log(`Base dataset: ${BASE}, Ending stage: ${ENDING_STAGE}, Rollback: ${ROLLBACK}`);
console.time('switchStage');

if (ROLLBACK) {
	console.log(`Rolling back: restoring ${BASE}-stage${ENDING_STAGE} → ${BASE} ...`);
	await runStageRollback(database, dbClient, BASE, ENDING_STAGE);
	console.timeEnd('switchStage');
	console.log('Rollback complete.');
	exit(0);
}

// ─── Compute currentPlayer and nextPlayer ────────────────────────────────────

// New roster from deployed code
const newRosterEntry = SORTED_PLAYERS.find((p) => p.dataset === BASE);
if (!newRosterEntry) {
	console.error(`No SORTED_PLAYERS entry found for dataset '${BASE}'. Has the new-stage code been deployed?`);
	exit(1);
}

// Players on disabled teams must never be chosen as answers (they can't be guessed
// in daily mode). Only eligible players are valid current/next answers.
const disabledTeams = getDisabledTeams(BASE);
const isEligibleAnswer = (p: { team: unknown }) => !disabledTeams.includes(p.team as string);
const eligibleRoster = newRosterEntry.players.filter(isEligibleAnswer);
if (eligibleRoster.length < 2) {
	console.error(`New roster for '${BASE}' has fewer than 2 players after excluding disabled teams. Aborting.`);
	exit(1);
}

// Prefer keeping the live current answer unchanged (no mid-day disruption).
// Fall back to an intersection pick only if the live answer isn't in the new roster
// (in which case the puzzle would be unsolvable, so a mid-day change is unavoidable).
const liveCurrentAnswerDoc = await database.collection<DbAnswerFull>(COLLECTION_NAMES.answers).findOne({ _id: `current_${BASE}` as AnswerKey });
const liveCurrentName: string | undefined = liveCurrentAnswerDoc?.player?.name;

let currentFormattedPlayer = liveCurrentName ? eligibleRoster.find((p) => p.name === liveCurrentName) : undefined;

if (currentFormattedPlayer) {
	console.log(`Current answer '${currentFormattedPlayer.name}' is in the new roster, keeping it unchanged.`);
} else {
	if (liveCurrentName) {
		console.log(`Current answer '${liveCurrentName}' is not in the new roster, finding a carry-over replacement.`);
	}
	// Load old roster to compute intersection
	const livePlayersDoc = await database.collection<DbFormattedPlayers>(COLLECTION_NAMES.players).findOne({ _id: BASE });
	const livePlayerNames = new Set<string>((livePlayersDoc?.players ?? []).map((p) => p.name));
	const intersection = eligibleRoster.filter((p) => livePlayerNames.has(p.name));
	if (intersection.length === 0) {
		console.error(
			`The old roster (DB) and new roster (deployed code) for '${BASE}' share NO players in common.\nA full roster turnover requires a maintenance window, this script cannot safely choose a carry-over answer.\nAborting.`
		);
		exit(1);
	}
	currentFormattedPlayer = intersection[0];
	console.log(`Carry-over current answer: ${currentFormattedPlayer.name}`);
}

const currentPlayer = formattedToDbPlayer(currentFormattedPlayer);

// nextPlayer: any eligible new-roster player distinct from currentPlayer.
const nextFormattedPlayer = eligibleRoster.find((p) => p.name !== currentPlayer.name);
if (!nextFormattedPlayer) {
	console.error(`New roster for '${BASE}' has fewer than 2 players, cannot set next answer. Aborting.`);
	exit(1);
}
const nextPlayer = formattedToDbPlayer(nextFormattedPlayer);

console.log(`Next answer: ${nextPlayer.name}`);
console.log('Preparing staging and swapping stages atomically...');

await runStageSwitch(database, dbClient, {
	base: BASE,
	endingStage: ENDING_STAGE,
	currentPlayer,
	nextPlayer,
	firstReset,
	secondReset,
});

console.timeEnd('switchStage');
console.log(`Switch complete: ${BASE}-stage${ENDING_STAGE} archived, new stage live on '${BASE}'.`);
exit(0);
