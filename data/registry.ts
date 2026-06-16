import type { Dataset, DatasetMode } from '@/data/datasetIds';
import type { TeamName } from '@/data/teams/teams';

/** Everything needed to declare a dataset's metadata + gameplay config in one place. */
export type DatasetDefinition<D extends Dataset> = {
	formattedName: string;
	name: string;
	year: string;
	shorthand: string;
	league: DatasetMode;
	/** Query-string href, e.g. "owl?season=1" */
	href: string;
	/** Clean share-link path, e.g. "/owl/season1" */
	prettyHref: string;
	/** Teams excluded from daily-mode answers (still valid in endless). */
	disabledTeams: readonly TeamName<D>[];
};

export const DATASET_REGISTRY: { [D in Dataset]: DatasetDefinition<D> } = {
	season1: {
		formattedName: 'Season 1 (2018)',
		name: 'Season 1',
		year: '2018',
		shorthand: 'S1',
		league: 'owl',
		href: 'owl?season=1',
		prettyHref: '/owl/season1',
		disabledTeams: [],
	},
	season2: {
		formattedName: 'Season 2 (2019)',
		name: 'Season 2',
		year: '2019',
		shorthand: 'S2',
		league: 'owl',
		href: 'owl?season=2',
		prettyHref: '/owl/season2',
		disabledTeams: [],
	},
	season3: {
		formattedName: 'Season 3 (2020)',
		name: 'Season 3',
		year: '2020',
		shorthand: 'S3',
		league: 'owl',
		href: 'owl?season=3',
		prettyHref: '/owl/season3',
		disabledTeams: [],
	},
	season4: {
		formattedName: 'Season 4 (2021)',
		name: 'Season 4',
		year: '2021',
		shorthand: 'S4',
		league: 'owl',
		href: 'owl?season=4',
		prettyHref: '/owl/season4',
		disabledTeams: [],
	},
	season5: {
		formattedName: 'Season 5 (2022)',
		name: 'Season 5',
		year: '2022',
		shorthand: 'S5',
		league: 'owl',
		href: 'owl?season=5',
		prettyHref: '/owl/season5',
		disabledTeams: [],
	},
	season6: {
		formattedName: 'Season 6 (2023)',
		name: 'Season 6',
		year: '2023',
		shorthand: 'S6',
		league: 'owl',
		href: 'owl?season=6',
		prettyHref: '/owl/season6',
		disabledTeams: [],
	},
	'owcs-s1': {
		formattedName: 'OWCS S1 (2024)',
		name: 'OWCS S1',
		year: '2024',
		shorthand: 'S1',
		league: 'owcs',
		href: 'owcs?season=s1',
		prettyHref: '/owcs/season1',
		disabledTeams: [
			'WASPXOHHHHNO',
			'AOneManArmy',
			'ExOblivione',
			'TeamG4mbit',
			'NegMentalAttitude',
			'Hypnos',
			'Metaboiz',
			'Vendetta',
			'TanukiTapire',
			'EXNZenith',
			'Ramattrapunch',
			'Absolution',
			'TeamZ',
			'RadxAvidity',
			'BlastOffBuds',
			'YFPGaming',
		],
	},
	'owcs-s2': {
		formattedName: 'OWCS S2 (2025)',
		name: 'OWCS S2',
		year: '2025',
		shorthand: 'S2',
		league: 'owcs',
		href: 'owcs?season=s2',
		prettyHref: '/owcs/season2',
		disabledTeams: [],
	},
	'owcs-s3': {
		formattedName: 'OWCS S3 (2026)',
		name: 'OWCS S3',
		year: '2026',
		shorthand: 'S3',
		league: 'owcs',
		href: 'owcs?season=s3',
		prettyHref: '/owcs/season3',
		disabledTeams: ['Cheeseburger', 'PokerFace', 'NewEra', 'DEG', 'HomieE', 'MilkTea', 'NaivePiggy'],
	},
};
