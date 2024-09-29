import { test, expect, describe } from 'vitest';
import { PLAYERS_S1 } from '@/data/players/formattedPlayers';

// Get the country and flag url from each player
const playerCountries = PLAYERS_S1.map((player) => ({ country: player.country, imgUrl: player.countryImg }));

// Test if all flags for countries that players are from are working
describe('country flag logos loading', () => {
	test.concurrent.each(playerCountries)('$country: flag url loading', async ({ country, imgUrl }) => {
		// Fetch the image
		const response = await fetch(imgUrl);

		// Ensure the request was successful
		expect(response.ok).toBe(true);
	});
});
