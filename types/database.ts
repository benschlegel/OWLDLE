import type { FormattedPlayer } from '@/data/players/formattedPlayers';

export interface DbFormattedPlayers {
	/**
	 * which season players are from
	 */
	_id: string;
	players: FormattedPlayer[];
}
