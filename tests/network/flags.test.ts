import { test, expect, describe } from 'vitest';
import { PLAYERS_S1 } from '@/data/players/formattedPlayers';
import { ALL_PLAYERS } from '@/data/players/players';

// Get the country and flag url from each player
// First, flatten players array
const mergedPlayers = ALL_PLAYERS.flat(1);
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
