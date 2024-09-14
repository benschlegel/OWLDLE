import { test, expect, describe } from 'vitest';
import crypto from 'node:crypto';
import { PLAYERS } from '@/data/players/formattedPlayers';

// Function to create a hash of the image data
const hashImage = (data: ArrayBuffer): string => {
	return crypto.createHash('md5').update(Buffer.from(data)).digest('hex');
};

const playerCountries = PLAYERS.map((player) => ({ country: player.country, imgUrl: player.countryImg }));

describe('country flag logos loading', () => {
	test.concurrent.each(playerCountries)('$country: flag url loading', async ({ country, imgUrl }) => {
		// Fetch the image
		const response = await fetch(imgUrl);

		// Ensure the request was successful
		expect(response.ok).toBe(true);
	});
});
