import { PLAYERS_S1 } from '@/data/players/formattedPlayers';
import { getRegion } from '@/types/players';

// Only adds unique teams but keeps the other props (like )
export const TEAMS_S1 = [...new Set(PLAYERS_S1.map((item) => item.team))];

const atlantic = [];
const pacific = [];
for (const team of TEAMS_S1) {
	const division = getRegion(team);
	if (division === 'AtlanticDivison') {
		atlantic.push(team);
	} else if (division === 'PacificDivision') {
		pacific.push(team);
	}
}

export const ATLANTIC = [...atlantic];
export const PACIFIC = [...pacific];
