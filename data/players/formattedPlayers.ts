import { DATASETS, type Dataset } from '@/data/datasetIds';
import { ALL_PLAYERS } from '@/data/players/players';
import { getRegion } from '@/data/teams/teams';
import type { CountryCode } from '@/types/countries';
import type { Player } from '@/types/players';

export type FormattedPlayer<T extends Dataset = 'season1'> = Player<T> & { countryImg: string; regionImg: string; id: number };
export type CombinedFormattedPlayer = { [D in Dataset]: FormattedPlayer<D> }[Dataset];

export type PlayerDataset = {
	dataset: Dataset;
	players: CombinedFormattedPlayer[];
};

export const FORMATTED_PLAYERS: PlayerDataset[] = [];

/**
 * Custom flag images for non-standard country codes
 */
const customCountryImages: Partial<Record<CountryCode, string>> = {
	ET: 'https://flagsapi.com/ET/flat/64.png',
	RO: 'https://flagsapi.com/RO/flat/64.png',
	LV: 'https://flagsapi.com/LV/flat/64.png',
	PL: 'https://flagsapi.com/PL/flat/64.png',
	KH: 'https://flagsapi.com/KH/flat/64.png',
	'GB-WLS': '/countries/wales.avif',
	'GB-SCT': '/countries/scotland.avif',
	AX: '/countries/aland.avif',
	'GB-NI': '/countries/GB-NI.avif',
};

/** Flag image URL for a country code (honoring custom overrides). */
export function getCountryImg(country: CountryCode): string {
	return customCountryImages[country] ?? `https://vectorflags.s3.amazonaws.com/flags/${country.toLowerCase()}-square-01.png`;
}

/** Region image (only OWL Atlantic/Pacific divisions have one). */
export function getRegionImg(region: string | null | undefined): string {
	if (region === 'AtlanticDivison') return '/regions/atlantic.webp';
	if (region === 'PacificDivision') return '/regions/pacific.webp';
	return '';
}

for (let i = 0; i < ALL_PLAYERS.length; i++) {
	const currentPlayers = ALL_PLAYERS[i];
	const currDataset = DATASETS[i];
	const formattedPlayers = currentPlayers.map((player, index) => {
		// Set player region
		const region = getRegion<typeof currDataset>(player.team, currDataset);

		// Take original player data and add auto calculated fields
		return { ...player, countryImg: getCountryImg(player.country), regionImg: getRegionImg(region), id: index, region: region };
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
	const datasetPlayers = SORTED_PLAYERS.find((d) => d.dataset === dataset)?.players;
	if (!datasetPlayers || datasetPlayers.length === 0) {
		throw new Error(`getRandomPlayer: no players found for dataset "${dataset}"`);
	}
	return datasetPlayers[Math.floor(Math.random() * datasetPlayers.length)];
}
