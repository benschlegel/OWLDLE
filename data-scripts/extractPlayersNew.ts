import type { Dataset } from '@/data/datasets';
import { getCountryAbbreviation } from '@/types/countries';
import { playerSchema } from '@/types/players';
import axios from 'axios';
import puppeteer from 'puppeteer';
import * as cheerio from 'cheerio';
import fs from 'node:fs';
import { exit } from 'node:process';

type PlayerData = {
	name: string;
	country: string;
	role: string;
	team: string;
	isFlex?: boolean;
};

type MappedDataset = {
	dataset: Dataset;
	url: string;
};

const mappedDatasets: MappedDataset[] = [
	{ dataset: 'season1', url: 'https://liquipedia.net/overwatch/Overwatch_League/2018' },
	{ dataset: 'season2', url: 'https://liquipedia.net/overwatch/Overwatch_League/2019' },
	{ dataset: 'season3', url: 'https://liquipedia.net/overwatch/Overwatch_League/2020' },
	{ dataset: 'season4', url: 'https://liquipedia.net/overwatch/Overwatch_League/2021' },
	{ dataset: 'season5', url: 'https://liquipedia.net/overwatch/Overwatch_League/2022' },
	{ dataset: 'season6', url: 'https://liquipedia.net/overwatch/Overwatch_League/2023' },
	// { dataset: 'owcs-s2', url: 'https://liquipedia.net/overwatch/Overwatch_Champions_Series/2025/EMEA/Stage_1' },
	// { dataset: 'owcs-s2', url: 'https://liquipedia.net/overwatch/Overwatch_Champions_Series/2025/NA/Stage_1' },
	{ dataset: 'owcs-s2', url: 'https://liquipedia.net/overwatch/Overwatch_Champions_Series/2025/Asia/Stage_2/Korea' },
];

// ! Change this value for different script output
const DATASET: Dataset = 'owcs-s2';

const url = mappedDatasets.find((d) => d.dataset === DATASET)?.url ?? mappedDatasets[0].dataset;
const blacklist = ['sinatraa', 'Aspire'];
console.time('parse');

// Function to fetch and extract player data
async function extractPlayers() {
	try {
		// Fetch the HTML content of the page
		// Launch headless browser
		const browser = await puppeteer.launch({ headless: true });
		const page = await browser.newPage();

		// Set User-Agent (optional but recommended)
		await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/110.0.0.0 Safari/537.36');

		// Navigate to Liquipedia page
		await page.goto(url, { waitUntil: 'domcontentloaded' });

		// Extract HTML after page fully loads
		const data = await page.content();
		console.log('Page loaded successfully');

		// Close browser
		await browser.close();

		// Load into cheerio
		const $ = cheerio.load(data);
		const players: PlayerData[] = [];

		// Loop through each section and extract player details
		// Find the parent div and loop through all teamcards
		console.log('Start.');
		$(`.teamcard-inner`).each(function (this) {
			// Extract the team name from the center tag just before the .teamcard-inner div
			const teamName = $(this).siblings().find('center a').text().trim();

			// Only select the table with [data-toggle-area-content="1"] (this one actually contains the data, not images, etc)
			const validTable = $(this).find('table[data-toggle-area-content="1"]');

			// Loop through each player row in the valid table
			validTable.find('tbody tr').each((index, element) => {
				const row = $(element);

				// Extract the role from the image's alt attribute in the first <th> cell
				const role = row.find('th img').attr('alt') || 'Unknown';

				// Extract the player's name from the second <td> cell
				const name = row.find('td:nth-child(2) a').text().trim();

				// Extract the player's country from the title attribute of the <a> tag inside the flag span
				const country = row.find('td span a img').attr('alt') || 'Unknown';

				// If a player's name exists, add them to the players array
				if (name && role !== 'Unknown' && !blacklist.includes(name)) {
					// * Parse data
					let parsedRole = role;
					if (parsedRole === 'DPS') {
						parsedRole = 'Damage';
					}

					const parsedCountry = getCountryAbbreviation(country) ?? 'Unknown';
					// Remove whitespaces from team name
					const parsedTeamName = teamName.replaceAll(' ', '');

					const parsedPlayer: PlayerData = {
						name,
						country: parsedCountry,
						role: parsedRole,
						team: parsedTeamName,
					};

					if (parsedRole === 'Flex') {
						parsedPlayer.role = 'Tank';
						parsedPlayer.isFlex = true;
					}
					players.push(parsedPlayer);
				}
			});
		});

		// * Validate data
		// const validatePlayers = playerSchema(DATASET);
		// for (const player of players) {
		// 	const playerRes = validatePlayers.safeParse(player);

		// 	// Error handling
		// 	if (!playerRes.success) {
		// 		const errMessage = playerRes.error.errors.map((err) => `${err.path}: ${err.message},`);
		// 		console.error(`Invalid Player. Errors: {\n${errMessage.join('\n')}\n}`);
		// 		exit(1);
		// 	}
		// }

		// Write the players array to a JSON file
		fs.writeFileSync('players.json', JSON.stringify(players));

		// Log success and output the players
		console.log('Players data has been written to players.json');
		console.log('Found: ', players.length);
		console.timeEnd('parse');

		const valueArr = players.map((item) => item.name);
		const isDuplicate = valueArr.some((item, idx) => valueArr.indexOf(item) !== idx);
		console.log('Found duplicates: ', isDuplicate);
	} catch (error) {
		console.error('Error fetching or parsing the data:', error);
	}
}

// Run the extraction
extractPlayers();
