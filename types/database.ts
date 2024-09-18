import type { FormattedPlayer } from '@/data/players/formattedPlayers';

export type DbSeasons = 'season1' | 'season2';

export interface DbFormattedPlayers {
	/**
	 * which season players are from
	 */
	_id: string;
	players: DbPlayer[];
}

export interface DbAnswerFull {
	/**
	 * Should always be hard coded
	 */
	_id: string;
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
