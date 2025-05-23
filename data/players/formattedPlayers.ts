import { DATASETS, type Dataset } from '@/data/datasets';
import { ALL_PLAYERS, s1Players } from '@/data/players/players';
import { getRegion } from '@/data/teams/teams';
import type { CountryCode } from '@/types/countries';
import type { Player } from '@/types/players';

type CustomFlag = { country: Player['country']; customImg: string };
export type FormattedPlayer<T extends Dataset = 'season1'> = Player<T> & { countryImg: string; regionImg: string; id: number };
export type CombinedFormattedPlayer =
	| FormattedPlayer<'season1'>
	| FormattedPlayer<'season2'>
	| FormattedPlayer<'season3'>
	| FormattedPlayer<'season4'>
	| FormattedPlayer<'season5'>
	| FormattedPlayer<'season6'>
	| FormattedPlayer<'owcs-s2'>;

export type PlayerDataset = {
	dataset: Dataset;
	players: CombinedFormattedPlayer[];
};

export const FORMATTED_PLAYERS: PlayerDataset[] = [];

// Countries that are not supported by vectorflags api
// ! Add unsupported countries here
const unsupportedCountryCodes: CountryCode[] = ['ET', 'RO', 'LV', 'PL', 'KH'];
const unsupportedCountries: CustomFlag[] = unsupportedCountryCodes.map((c) => ({ country: c, customImg: `https://flagsapi.com/${c}/flat/64.png` }));

// TODO: find out why using DATASETS causes "cant use before initialization"
const datasets = ['season1', 'season2', 'season3', 'season4', 'season5', 'season6', 'owcs-s2'] as const;
for (let i = 0; i < ALL_PLAYERS.length; i++) {
	const currentPlayers = ALL_PLAYERS[i];
	const currDataset = datasets[i];
	const formattedPlayers = currentPlayers.map((player, index) => {
		// Default url for vectorflags country flag api
		let countryImg = `https://vectorflags.s3.amazonaws.com/flags/${player.country.toLowerCase()}-square-01.png`;
		let regionImg = '';

		// Check if player is unsupported by vectorflags api and override with custom image
		const unsupportedCountry = unsupportedCountries.find((unsupported) => unsupported.country === player.country);
		if (unsupportedCountry) {
			countryImg = unsupportedCountry.customImg;
		}

		// Special case for wales (was not in unsupported api either)
		if (player.country === 'GB-WLS') {
			countryImg = 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/dc/Flag_of_Wales.svg/1200px-Flag_of_Wales.svg.png';
		}

		// Set player region

		const region = getRegion<typeof currDataset>(player.team, currDataset);

		// Set region image
		if (region === 'AtlanticDivison') {
			regionImg = '/regions/atlantic.webp';
		} else if (region === 'PacificDivision') {
			regionImg = '/regions/pacific.webp';
		}

		// Take original player data and add auto calculated fields
		return { ...player, countryImg, regionImg, id: index, region: region };
	});
	FORMATTED_PLAYERS.push({ dataset: currDataset, players: formattedPlayers });
}

export const SORTED_PLAYERS: PlayerDataset[] = [];

for (const formatted of FORMATTED_PLAYERS) {
	const sorted = formatted.players.toSorted((a, b) => {
		// Sort all players by player name
		return a.name.localeCompare(b.name, undefined, {
			numeric: true,
			sensitivity: 'base',
		});
	});
	SORTED_PLAYERS.push({ dataset: formatted.dataset, players: sorted });
}

// use sort instead of toSorted to fix webpack error
export const PLAYERS_S1 = SORTED_PLAYERS[0].players;

/**
 * Returns random formatted player
 */
export function getRandomPlayer(dataset: Dataset) {
	const datasetIndex = datasets.findIndex((d) => d === dataset);
	const datasetPlayers = SORTED_PLAYERS[datasetIndex].players;
	return datasetPlayers[Math.floor(Math.random() * datasetPlayers.length)];
}
