import { DATASETS, type Dataset } from '@/data/datasets';
import { DISABLED_TEAMS_CONFIG, getDisabledTeams } from '@/data/disabledTeams';
import { generateBacklog, getBacklog, getNextAnswer, setBacklog, setPartialAnswer, getUniqueRandomPlayer } from '@/lib/databaseAccess';
import { GAME_CONFIG } from '@/lib/config';
import { exit } from 'node:process';

// ! SAFETY: Set to true to allow this script to run. Reset to false after use.
const I_KNOW_WHAT_I_AM_DOING = false;
if (!I_KNOW_WHAT_I_AM_DOING) {
	console.error('Safety guard is enabled. Set I_KNOW_WHAT_I_AM_DOING to true to run this script.');
	exit(1);
}

// Configure which datasets to process (defaults to all datasets that have disabled teams)
const DATASETS_TO_PROCESS: Dataset[] = DATASETS.filter((d) => getDisabledTeams(d).length > 0);

if (DATASETS_TO_PROCESS.length === 0) {
	console.log('No datasets have disabled teams configured in DISABLED_TEAMS_CONFIG. Nothing to do.');
	exit(0);
}

console.log(`Processing datasets: ${DATASETS_TO_PROCESS.join(', ')}`);

for (const dataset of DATASETS_TO_PROCESS) {
	const disabledTeams = getDisabledTeams(dataset);
	console.log(`\n[${dataset}] Disabled teams: ${disabledTeams.join(', ')}`);

	// * Step 1: Filter disabled-team players from the backlog
	const backlog = await getBacklog(dataset);
	if (!backlog) {
		console.warn(`[${dataset}] No backlog found, skipping.`);
		continue;
	}

	const before = backlog.players.length;
	const filteredPlayers = backlog.players.filter((p) => !(disabledTeams as string[]).includes(p.team as string));
	const removed = before - filteredPlayers.length;

	if (removed > 0) {
		await setBacklog({ _id: dataset, players: filteredPlayers });
		console.log(`[${dataset}] Removed ${removed} player(s) from backlog (${before} → ${filteredPlayers.length}).`);
	} else {
		console.log(`[${dataset}] Backlog already clean, no disabled-team players found.`);
	}

	if (filteredPlayers.length === 0) {
		console.log(`[${dataset}] Backlog is now empty, regenerating...`);
		await generateBacklog(GAME_CONFIG.backlogMaxSize, dataset);
		console.log(`[${dataset}] Backlog regenerated with up to ${GAME_CONFIG.backlogMaxSize} players.`);
	}

	// * Step 2: Check if the next answer is from a disabled team
	const nextAnswer = await getNextAnswer(dataset);
	if (!nextAnswer) {
		console.warn(`[${dataset}] No next answer found, skipping next-answer check.`);
		continue;
	}

	const nextTeam = nextAnswer.player.team as string;
	if ((disabledTeams as string[]).includes(nextTeam)) {
		console.log(`[${dataset}] next answer "${nextAnswer.player.name}" (${nextTeam}) is on a disabled team, replacing...`);

		// Re-fetch updated backlog (after the filter above), pick first valid player
		const updatedBacklog = await getBacklog(dataset);
		const replacement = updatedBacklog?.players.find((p) => !(disabledTeams as string[]).includes(p.team as string));

		if (replacement) {
			// Remove replacement from backlog, then set as next answer
			const remainingPlayers = (updatedBacklog?.players ?? []).filter((p) => p.name !== replacement.name);
			await setBacklog({ _id: dataset, players: remainingPlayers });
			await setPartialAnswer('next', replacement, dataset);
			console.log(`[${dataset}] Replaced next answer with "${replacement.name}" (${replacement.team}).`);
		} else {
			// Backlog is empty or all players are disabled, pick a unique random player
			console.warn(`[${dataset}] No valid player in backlog, attempting to pick a unique random player...`);
			const randomPlayer = await getUniqueRandomPlayer(dataset);
			if (randomPlayer) {
				await setPartialAnswer('next', randomPlayer, dataset);
				console.log(`[${dataset}] Replaced next answer with random player "${randomPlayer.name}" (${randomPlayer.team}).`);
			} else {
				console.error(`[${dataset}] Could not find a valid replacement for the next answer. Manual intervention required.`);
			}
		}
	} else {
		console.log(`[${dataset}] next answer "${nextAnswer.player.name}" (${nextTeam}) is valid, no change needed.`);
	}
}

console.log('\nFinished.');
exit(0);
