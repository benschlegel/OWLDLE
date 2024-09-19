export type PlausibleEvents = {
	finishGame: { didSucceed: boolean; state: 'won' | 'lost' };
};
