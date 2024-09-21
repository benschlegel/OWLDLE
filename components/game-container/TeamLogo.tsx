import { useCallback, useEffect, useMemo } from 'react';
import type { Player } from '@/types/players';
import { TEAM_LOGOS_S1 } from '@/data/teams/logos';
import Image from 'next/image';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { splitCapitalization } from '@/lib/client';

type Props = {
	teamName?: string;
	disableBorder?: boolean;
	useTabIndex?: boolean;
};

export default function TeamLogo({ teamName, useTabIndex, disableBorder = false }: Props) {
	const team = TEAM_LOGOS_S1.find((t) => t.teamName === teamName);

	if (!teamName || !team) return <></>;

	return (
		<TooltipProvider delayDuration={0}>
			<Tooltip>
				<TooltipTrigger asChild>
					<div
						className={`rounded-md flex justify-center items-center m-1 aspect-square`}
						style={{ backgroundColor: team.backgroundColor }}
						tabIndex={useTabIndex ? 0 : -1}>
						<Image
							src={team.imgUrl}
							alt={`Logo for ${team.displayName}`}
							unoptimized={false}
							quality={100}
							width={64}
							height={64}
							className="p-[0.35rem] h-auto w-auto max-h-full max-w-full"
						/>
					</div>
				</TooltipTrigger>
				{useTabIndex && (
					<TooltipContent style={{ backgroundColor: team.backgroundColor, color: team.useDarkForeground ? '#1a1a1e' : '#dfdfd7' }}>
						<p>{splitCapitalization(teamName)}</p>
					</TooltipContent>
				)}
			</Tooltip>
		</TooltipProvider>
	);
}
