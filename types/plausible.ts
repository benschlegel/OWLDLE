import type { Dataset } from '@/data/datasets';

export type PlausibleEvents = {
	finishGame: { didSucceed: boolean; state: GameResult; dataset: Dataset };
	clickConfetti: { state: GameResult };
	copyResult: { state: GameResult; dataset: Dataset };
	openSocials: never;
	followSocial: { social: string };
};

type GameResult = 'won' | 'lost';
