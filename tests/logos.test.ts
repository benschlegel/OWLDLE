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
			return { logo: teamData, hash: '' } as HashedLogo;
		case 'FloridaMayhem':
			return { logo: teamData, hash: '' } as HashedLogo;
		case 'HoustonOutlaws':
			return { logo: teamData, hash: '' } as HashedLogo;
		case 'LondonSpitfire':
			return { logo: teamData, hash: '' } as HashedLogo;
		case 'LosAngelesGladiators':
			return { logo: teamData, hash: '' } as HashedLogo;
		case 'LosAngelesValiant':
			return { logo: teamData, hash: '' } as HashedLogo;
		case 'NewYorkExcelsior':
			return { logo: teamData, hash: '' } as HashedLogo;
		case 'PhiladelphiaFusion':
			return { logo: teamData, hash: '' } as HashedLogo;
		case 'SanFranciscoShock':
			return { logo: teamData, hash: '' } as HashedLogo;
		case 'SeoulDynasty':
			return { logo: teamData, hash: '' } as HashedLogo;
		case 'ShanghaiDragons':
			return { logo: teamData, hash: '' } as HashedLogo;
	}
});

// Run test for all teams of season 1
const cases = [hashedTeamLogos];

describe('team logos loading (season 1)', () => {
	test.each(cases)('%logo.teamName logo loading and matches hash', async (logoData) => {
		const imageSource = logoData.logo.imgUrl;

		// Fetch the image
		const response = await fetch(imageSource);

		// Ensure the request was successful
		expect(response.ok).toBe(true);

		// Get the image data as ArrayBuffer
		const imageData = await response.arrayBuffer();

		// Hash the image data
		const imageHash = hashImage(imageData);

		// Compare the fetched image's hash with the expected hash
		expect(imageHash).toBe(logoData.hash);
		//
	});
});
