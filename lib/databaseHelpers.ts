import type { FormattedPlayer } from '@/data/players/formattedPlayers';
import type { DbPlayer } from '@/types/database';

export function formattedToDbPlayer(player: FormattedPlayer): DbPlayer {
	return deleteProperty(player, 'countryImg');
}
function deleteProperty<T, K extends keyof T>(obj: T, key: K): Omit<T, K> {
	// Destructuring to remove the key
	const { [key]: _, ...newObj } = obj;
	return newObj as Omit<T, K>;
}
