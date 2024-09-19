import { useCallback, useEffect, useMemo } from 'react';
import type { Player } from '@/types/players';
import { TEAM_LOGOS_S1 } from '@/data/teams/logos';
import Image from 'next/image';

type Props = {
	teamName?: Player['team'];
	disableBorder?: boolean;
};

export default function TeamLogo({ teamName, disableBorder = false }: Props) {
	const team = TEAM_LOGOS_S1.find((t) => t.teamName === teamName);

	if (!teamName || !team) return <></>;

	return (
		<div
			className={`rounded-md flex justify-center items-center m-1 aspect-square ${disableBorder === true ? '' : 'border-[0.5px] border-secondary/50'}`}
			style={{ backgroundColor: team.backgroundColor }}>
			<Image src={team.imgUrl} alt={`Logo for ${team.displayName}`} width={64} height={64} className="p-[0.35rem] h-auto w-auto max-h-full max-w-full" />
		</div>
	);
}
