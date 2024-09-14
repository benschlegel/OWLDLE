import { TEAM_LOGOS_S1, type TeamLogoData } from '@/data/teams/logos';
import { test, expect, describe } from 'vitest';
import crypto from 'node:crypto';

// Function to create a hash of the image data
const hashImage = (data: ArrayBuffer): string => {
	return crypto.createHash('md5').update(Buffer.from(data)).digest('hex');
};

type HashedLogo = { logo: TeamLogoData; hash: string };

// Add expected hashes to team logos
const hashedTeamLogos: HashedLogo[] = TEAM_LOGOS_S1.map((teamData) => {
	switch (teamData.teamName) {
		case 'BostonUprising':
			return { logo: teamData, hash: '5b874e8a9e4ce66ab9bcab597b82485b' } as HashedLogo;
		case 'DallasFuel':
			return { logo: teamData, hash: 'f12203f3b27bb190657cdfe5c3344a2e' } as HashedLogo;
		case 'FloridaMayhem':
			return { logo: teamData, hash: 'a016a9974e6df38ac09d800aa5438e38' } as HashedLogo;
		case 'HoustonOutlaws':
			return { logo: teamData, hash: '124a5e03e803874f96c2d421862c51a7' } as HashedLogo;
		case 'LondonSpitfire':
			return { logo: teamData, hash: '032d2f106965b1f88f890c042442e5f8' } as HashedLogo;
		case 'LosAngelesGladiators':
			return { logo: teamData, hash: 'ad84bbc797cb06243f20e79a8afdff9b' } as HashedLogo;
		case 'LosAngelesValiant':
			return { logo: teamData, hash: 'cfbea1a4d74d81726112f0fb6eca20f5' } as HashedLogo;
		case 'NewYorkExcelsior':
			return { logo: teamData, hash: 'd868c45ef3656030337279c7c48d51d8' } as HashedLogo;
		case 'PhiladelphiaFusion':
			return { logo: teamData, hash: 'e2dd58d419ad41bfb7a96252b7f17a5f' } as HashedLogo;
		case 'SanFranciscoShock':
			return { logo: teamData, hash: '8b3e63a1ec6da47256be209559a4e029' } as HashedLogo;
		case 'SeoulDynasty':
			return { logo: teamData, hash: '049dbe116ff21e6082916692a6a0528c' } as HashedLogo;
		case 'ShanghaiDragons':
			return { logo: teamData, hash: '5ff27894dbc5eb7682db0703795a8dee' } as HashedLogo;
	}
});

describe('team logos loading (season 1)', () => {
	test.skip.each(hashedTeamLogos)('($logo.displayName): logo loading and matches hash', async ({ logo, hash }) => {
		const imageSource = logo.imgUrl;

		// Fetch the image
		const response = await fetch(imageSource);

		// Ensure the request was successful
		expect(response.ok).toBe(true);

		// Get the image data as ArrayBuffer
		const imageData = await response.arrayBuffer();

		// Hash the image data
		const imageHash = hashImage(imageData);

		// Compare the fetched image's hash with the expected hash
		expect(imageHash).toBe(hash);
		//
	});
});
