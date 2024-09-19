export type PlausibleEvents = {
	finishGame: { didSucceed: boolean; state: GameResult };
	clickConfetti: { state: GameResult };
	copyResult: { state: GameResult };
};

type GameResult = 'won' | 'lost';
