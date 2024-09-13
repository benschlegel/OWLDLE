import { s1Players } from '@/data/players/players';
import { isEastern, type Player } from '@/types/players';

export const PLAYERS = s1Players.map((player: Player, index) => {
	const countryImg = `https://vectorflags.s3.amazonaws.com/flags/${player.country.toLowerCase()}-square-01.png`;
	const isEasternTeam = isEastern(player.team);

	return { ...player, countryImg, id: index, isEastern: isEasternTeam };
});

export type FormattedPlayer = (typeof PLAYERS)[number];
