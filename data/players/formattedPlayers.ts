import { s1Players } from '@/data/players/players';
import { getRegion, type Player } from '@/types/players';

type CustomFlag = { country: Player['country']; customImg: string };

// Countries that are not supported by vectorflags api
const unsupportedCountries: CustomFlag[] = [{ country: 'ET', customImg: 'https://flagsapi.com/ET/flat/64.png' }];

const unsortedPlayers = s1Players.map((player: Player, index) => {
	// Default url for vectorflags country flag api
	let countryImg = `https://vectorflags.s3.amazonaws.com/flags/${player.country.toLowerCase()}-square-01.png`;
	let regionImg = '';

	// Check if player is unsupported by vectorflags api and override with custom image
	const unsupportedCountry = unsupportedCountries.find((unsupported) => unsupported.country === player.country);
	if (unsupportedCountry) {
		countryImg = unsupportedCountry.customImg;
	}

	// Set player region
	const region = getRegion(player.team);

	// Set region image
	if (region === 'AtlanticDivison') {
		regionImg = '/regions/atlantic.webp';
	} else if (region === 'PacificDivision') {
		regionImg = '/regions/pacific.webp';
	}

	// Take original player data and add auto calculated fields
	return { ...player, countryImg, regionImg, id: index, region: region };
});

// use sort instead of toSorted to fix webpack error
export const PLAYERS = unsortedPlayers.sort((a, b) => {
	// Sort all players by player name
	return a.name.localeCompare(b.name, undefined, {
		numeric: true,
		sensitivity: 'base',
	});
});
export type FormattedPlayer = (typeof PLAYERS)[number];

/**
 * Returns random formatted player
 */
export function getRandomPlayer() {
	return PLAYERS[Math.floor(Math.random() * PLAYERS.length)];
}
