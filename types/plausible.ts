export type PlausibleEvents = {
	logGame: { duration?: string; didSucceed: boolean; state: 'won' | 'lost' };
};
