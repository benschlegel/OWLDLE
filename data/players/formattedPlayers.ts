import { DATASETS, type Dataset } from '@/data/datasets';
import { ALL_PLAYERS, s1Players } from '@/data/players/players';
import { getRegion } from '@/data/teams/teams';
import type { Player } from '@/types/players';

type CustomFlag = { country: Player['country']; customImg: string };
export type FormattedPlayer<T extends Dataset = 'season1'> = Player<T> & { countryImg: string; regionImg: string; id: number };
export type CombinedFormattedPlayer =
	| FormattedPlayer<'season1'>
	| FormattedPlayer<'season2'>
	| FormattedPlayer<'season3'>
	| FormattedPlayer<'season4'>
	| FormattedPlayer<'season5'>
	| FormattedPlayer<'season6'>;

export const FORMATTED_PLAYERS: CombinedFormattedPlayer[][] = [];

// Countries that are not supported by vectorflags api
const unsupportedCountries: CustomFlag[] = [{ country: 'ET', customImg: 'https://flagsapi.com/ET/flat/64.png' }];

// TODO: find out why using DATASETS causes "cant use before initialization"
const datasets = ['season1', 'season2', 'season3', 'season4', 'season5', 'season6'] as const;
for (let i = 0; i < ALL_PLAYERS.length; i++) {
	const currentPlayers = ALL_PLAYERS[i];
	const currRegion = datasets[i];
	const formattedPlayers = currentPlayers.map((player, index) => {
		// Default url for vectorflags country flag api
		let countryImg = `https://vectorflags.s3.amazonaws.com/flags/${player.country.toLowerCase()}-square-01.png`;
		let regionImg = '';

		// Check if player is unsupported by vectorflags api and override with custom image
		const unsupportedCountry = unsupportedCountries.find((unsupported) => unsupported.country === player.country);
		if (unsupportedCountry) {
			countryImg = unsupportedCountry.customImg;
		}

		// Set player region

		const region = getRegion<typeof currRegion>(player.team, currRegion);

		// Set region image
		if (region === 'AtlanticDivison') {
			regionImg = '/regions/atlantic.webp';
		} else if (region === 'PacificDivision') {
			regionImg = '/regions/pacific.webp';
		}

		// Take original player data and add auto calculated fields
		return { ...player, countryImg, regionImg, id: index, region: region };
	});
	FORMATTED_PLAYERS.push(formattedPlayers);
}

export const SORTED_PLAYERS: CombinedFormattedPlayer[][] = [];

for (const formatted of FORMATTED_PLAYERS) {
	const sorted = formatted.toSorted((a, b) => {
		// Sort all players by player name
		return a.name.localeCompare(b.name, undefined, {
			numeric: true,
			sensitivity: 'base',
		});
	});
	SORTED_PLAYERS.push(sorted);
}

// use sort instead of toSorted to fix webpack error
export const PLAYERS_S1 = SORTED_PLAYERS[0];

/**
 * Returns random formatted player
 */
export function getRandomPlayer() {
	return PLAYERS_S1[Math.floor(Math.random() * PLAYERS_S1.length)];
}
