import type { FormattedPlayer } from '@/data/players/formattedPlayers';

export type DbSeasons = 'season1' | 'season2' | 'season3';
export type DbAnswerPrefix = 'current' | 'next';

export type AnswerKey = `${DbAnswerPrefix}_${DbSeasons}`;

export interface DbFormattedPlayers {
	/**
	 * which season players are from
	 */
	_id: DbSeasons;
	players: DbPlayer[];
}

export interface DbAnswerFull {
	/**
	 * Should always be hard coded
	 */
	_id: AnswerKey;
	/**
	 * The correct player
	 */
	player: DbPlayer;
	/**
	 * Time of next reset
	 */
	nextReset: Date;
	/**
	 * What iteration of the game this answer is for
	 */
	iteration: number;
}

export type DbAnswer = Omit<DbAnswerFull, '_id'>;
export type DbPlayer = Omit<FormattedPlayer, 'countryImg'>;
