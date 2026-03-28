import { test, expect, describe } from 'vitest';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { SORTED_PLAYERS } from '@/data/players/formattedPlayers';
import type { CountryCode } from '@/types/countries';

type MergedPlayer = { country: CountryCode; imgUrl: string };

// Get the country and flag url from each player
// First, flatten players array (for players from all seasins)
const mergedPlayers: MergedPlayer[] = SORTED_PLAYERS.flatMap((p) => p.players).map((p) => ({ country: p.country, imgUrl: p.countryImg }));

// Then, only use unique countries to minimize fetch calls/tests
const uniqueCountries = getUniqueCountries(mergedPlayers);

// Test if all flags for countries that players are from are working
describe('country flag logos loading', () => {
	test.concurrent.each(uniqueCountries)('$country: flag url loading', async ({ imgUrl }) => {
		if (imgUrl.startsWith('/')) {
			// Local file -> check in public folder
			const filePath = path.join(process.cwd(), 'public', imgUrl);

			expect(existsSync(filePath)).toBe(true);
		} else {
			// Remote URL -> fetch
			const response = await fetch(imgUrl);
			expect(response.ok).toBe(true);
		}
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
