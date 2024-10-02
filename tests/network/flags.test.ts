import { test, expect, describe } from 'vitest';
import { PLAYERS_S1, SORTED_PLAYERS } from '@/data/players/formattedPlayers';
import type { CountryCode } from '@/types/countries';

type MergedPlayer = { country: CountryCode; imgUrl: string };

// Get the country and flag url from each player
// First, flatten players array (for players from all seasins)
const mergedPlayers: MergedPlayer[] = SORTED_PLAYERS.flatMap((p) => p.players).map((p) => ({ country: p.country, imgUrl: p.countryImg }));

// Then, only use unique countries to minimize fetch calls/tests
const uniqueCountries = getUniqueCountries(mergedPlayers);

// Test if all flags for countries that players are from are working
describe('country flag logos loading', () => {
	test.concurrent.each(uniqueCountries)('$country: flag url loading', async ({ country, imgUrl }) => {
		// Fetch the image
		const response = await fetch(imgUrl);

		// Ensure the request was successful
		expect(response.ok).toBe(true);
	});
});

function getUniqueCountries(arr: MergedPlayer[]) {
	const seen = new Set();
	return arr.filter((obj) => {
		const key = obj.imgUrl;
		if (seen.has(key)) {
			return false;
		}
		seen.add(key);
		return true;
	});
}
