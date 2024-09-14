import { TEAM_LOGOS_S1 } from '@/data/teams/logos';
import { test, expect, describe } from 'bun:test';
import crypto from 'node:crypto';

// Function to create a hash of the image data
const hashImage = (data: ArrayBuffer): string => {
	return crypto.createHash('md5').update(Buffer.from(data)).digest('hex');
};

describe('team logos loading', () => {
	test('LosAngelesGladiators logo loading and match hash', async () => {
		// biome-ignore lint/style/noNonNullAssertion: Team will always exist
		const imageSource = TEAM_LOGOS_S1.find((team) => team.teamName === 'BostonUprising')!.imgUrl;

		// Fetch the image
		const response = await fetch(imageSource);

		// Ensure the request was successful
		expect(response.ok).toBe(true);

		// Get the image data as ArrayBuffer
		const imageData = await response.arrayBuffer();

		// Hash the image data
		const imageHash = hashImage(imageData);

		// Precomputed hash of the correct image
		const expectedHash = '7076a13fab2167295a6d1f28f7d9b0e7';

		// Compare the fetched image's hash with the expected hash
		expect(imageHash).toBe(expectedHash);
		//
	});
	test('LosAngelesGladiators logo loading and match hash', async () => {
		// biome-ignore lint/style/noNonNullAssertion: Team will always exist
		const imageSource = TEAM_LOGOS_S1.find((team) => team.teamName === 'DallasFuel')!.imgUrl;

		// Fetch the image
		const response = await fetch(imageSource);

		// Ensure the request was successful
		expect(response.ok).toBe(true);

		// Get the image data as ArrayBuffer
		const imageData = await response.arrayBuffer();

		// Hash the image data
		const imageHash = hashImage(imageData);

		// Precomputed hash of the correct image
		const expectedHash = 'f12203f3b27bb190657cdfe5c3344a2e';

		// Compare the fetched image's hash with the expected hash
		expect(imageHash).toBe(expectedHash);
		//
	});
});
