import type { FormattedPlayer } from '@/data/players/formattedPlayers';

export type DbDatasetID = 'OWL_season1' | 'OWL_season2';
export type DbAnswerPrefix = 'current' | 'next';

export type AnswerKey = `${DbAnswerPrefix}_${DbDatasetID}`;

export interface DbFormattedPlayers {
	/**
	 * which season players are from
	 */
	_id: DbDatasetID;
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
