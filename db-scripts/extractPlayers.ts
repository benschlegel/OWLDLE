import { getCountryAbbreviation } from '@/types/countries';
import axios from 'axios';
import * as cheerio from 'cheerio';
import fs from 'node:fs';

type PlayerData = {
	name: string;
	country: string;
	role: string;
	team: string;
};

const url = 'https://liquipedia.net/overwatch/Overwatch_League/2018';
const blacklist = ['sinatraa'];
console.time('parse');

// Function to fetch and extract player data
async function extractPlayers() {
	try {
		// Fetch the HTML content of the page
		const { data } = await axios.get(url);

		// Load the HTML into cheerio for parsing
		const $ = cheerio.load(data);

		// Division ids/selectors (Only select Atlantic because Pacific sibling will be automatically selected, Specify Atlantic_Division and _Conference, because 2020 season has a different id)
		// Could also select by <span id="Participants"> and select h3 sibling children
		const divisions = ['Atlantic_Division', 'Atlantic_Conference'];

		const players: PlayerData[] = [];

		// Loop through each section and extract player details
		for (const sectionId of divisions) {
			// Find the parent div and loop through all teamcards
			$(`#${sectionId}`)
				.parent()
				.nextAll('div')
				.find('.teamcard-inner')
				.each(function (this) {
					// Extract the team name from the center tag just before the .teamcard-inner div
					const teamName = $(this).parent().find('center a').text().trim();

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
							players.push({
								name,
								country: parsedCountry,
								role: parsedRole,
								team: parsedTeamName,
							});
						}
					});
				});
		}

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
