import { PLAYERS } from '@/data/players/formattedPlayers';
import { setCurrentAnswer, setNextAnswer } from '@/lib/databaseAccess';
import { formattedToDbPlayer } from '@/lib/databaseHelpers';
import { exit } from 'node:process';

console.time('setCurrent');
const randomPlayer = formattedToDbPlayer(PLAYERS[Math.floor(Math.random() * PLAYERS.length)]);
// await setCurrentAnswer({ player: randomPlayer, iteration: 1, nextReset: getFormattedMidnightTmrw() });
await setNextAnswer({ player: randomPlayer, iteration: 2, nextReset: getFormattedMidnightDayAfter() });
console.timeEnd('setCurrent');
console.log('Finished.');
exit(0);

function getFormattedMidnight(): Date {
	const midnight = new Date();
	midnight.setHours(26);
	midnight.setDate(midnight.getDate() - 1);
	midnight.setMinutes(0);
	midnight.setSeconds(0);
	midnight.setMilliseconds(0);
	return midnight;
}

function getFormattedMidnightTmrw(): Date {
	const midnight = new Date();
	midnight.setHours(26);
	midnight.setMinutes(0);
	midnight.setSeconds(0);
	midnight.setMilliseconds(0);
	return midnight;
}

function getFormattedMidnightDayAfter(): Date {
	const midnight = new Date();
	midnight.setHours(26);
	midnight.setDate(midnight.getDate() + 1);
	midnight.setMinutes(0);
	midnight.setSeconds(0);
	midnight.setMilliseconds(0);
	return midnight;
}
