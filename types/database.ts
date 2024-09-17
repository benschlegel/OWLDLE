import type { FormattedPlayer } from '@/data/players/formattedPlayers';

export interface DbFormattedPlayers {
	/**
	 * which season players are from
	 */
	_id: string;
	players: FormattedPlayer[];
}

export interface DbAnswer {
	/**
	 * Should always be hard coded
	 */
	_id: string;
	/**
	 * The correct player
	 */
	player: FormattedPlayer;
	/**
	 * Time of next reset
	 */
	nextReset: Date;
	/**
	 * What iteration of the game this answer is for
	 */
	iteration: number;
}
