'use client';

import ImageCell from '@/components/game-container/CountryCell';
import GameCell from '@/components/game-container/GameCell';
import type { RowData } from '@/components/game-container/GameContainer';
import RoleCell from '@/components/game-container/RoleCell';
import TeamLogo from '@/components/game-container/TeamLogo';
import { DatasetContext } from '@/context/DatasetContext';
import { isOwcsDataset } from '@/data/datasets';
import { atlanticPacificTeams } from '@/data/teams/teams';
import { regionNames } from '@/lib/client';
import { cn } from '@/lib/utils';
import { motion, useReducedMotion } from 'motion/react';
import { useContext, useEffect, useRef, useState } from 'react';

type Props = {
	data?: RowData;
	isDismissing?: boolean;
	dismissDelay?: number;
};

type AnimationMode = 'none' | 'flip-in' | 'flip-out';

const containerVariants = {
	hidden: {},
	visible: {
		transition: {
			staggerChildren: 0.15,
		},
	},
};

const flipVariants = {
	hidden: { rotateX: 0 },
	visible: { rotateX: 180 },
};

function FlipCard({
	children,
	animationMode,
	dismissDelay = 0,
	className,
}: { children: React.ReactNode; animationMode: AnimationMode; dismissDelay?: number; className?: string }) {
	if (animationMode === 'none') {
		return <>{children}</>;
	}

	return (
		<div className={cn(className)} style={{ perspective: '1000px' }}>
			<motion.div
				variants={flipVariants}
				{...(animationMode === 'flip-out' ? { initial: 'visible' } : {})}
				className="grid w-full h-full"
				style={{ transformStyle: 'preserve-3d' }}
				transition={
					animationMode === 'flip-in' ? { type: 'spring', stiffness: 100, damping: 15 } : { type: 'tween', duration: 0.4, ease: 'easeIn', delay: dismissDelay }
				}>
				{/* Front (empty placeholder), stacked behind back via grid */}
				<div aria-hidden className="[grid-area:1/1] bg-secondary rounded-sm" style={{ backfaceVisibility: 'hidden' }} />
				{/* Back (content), visible after 180deg flip */}
				<div className="[grid-area:1/1] flex" style={{ backfaceVisibility: 'hidden', transform: 'rotateX(180deg)' }}>
					{children}
				</div>
			</motion.div>
		</div>
	);
}

const cellSize = '3.75rem';

// How many characters until smaller font gets used
const fontBreakpoint = 7;
export default function GuessRow({ data, isDismissing, dismissDelay = 0 }: Props) {
	const useSmallerFont = data && data.player.name.length > 7;
	const [dataset, _] = useContext(DatasetContext);
	let useAtlanticPacificImage = false;
	if (atlanticPacificTeams.includes(dataset.dataset)) {
		useAtlanticPacificImage = true;
	}

	let region = undefined;
	let regionTooltip = undefined;
	if (data) {
		if (data.player.region === 'AtlanticDivison') {
			region = 'E';
			regionTooltip = 'East';
		} else if (data.player.region === 'PacificDivision') {
			region = 'W';
			regionTooltip = 'West';
		} else if (data.player.region === 'EMEA') {
			region = 'EMEA';
			regionTooltip = 'EMEA';
		} else if (data.player.region === 'NA') {
			region = 'NA';
			regionTooltip = 'North America';
		} else if (data.player.region === 'Korea') {
			region = 'KR';
			regionTooltip = 'Korea';
		}
	}

	// track if this row was empty at mount (for detecting fresh guesses vs reloads)
	const mountedWithoutData = useRef(data === undefined);
	const [flippedIn, setFlippedIn] = useState(false);
	const prefersReducedMotion = useReducedMotion();

	useEffect(() => {
		if (mountedWithoutData.current && data !== undefined && !prefersReducedMotion) {
			setFlippedIn(true);
		}
		// reset animation state when data is cleared (e.g. after endless dismiss), to allow animation when next game starts
		if (data === undefined) {
			mountedWithoutData.current = true;
			setFlippedIn(false);
		}
	}, [data, prefersReducedMotion]);

	// set animation mode to "flip-out" for guess submit, flip-in for reset
	let animationMode: AnimationMode = 'none';
	if (isDismissing && data !== undefined && !prefersReducedMotion) {
		animationMode = 'flip-out';
	} else if (flippedIn) {
		animationMode = 'flip-in';
	}

	const useMotion = animationMode !== 'none';
	const RowComponent = useMotion ? motion.div : 'div';

	// set correct motion props depending on mode
	const rowMotionProps = useMotion
		? animationMode === 'flip-in'
			? { variants: containerVariants, initial: 'hidden' as const, animate: 'visible' as const }
			: {
					variants: containerVariants,
					...(flippedIn ? {} : { initial: 'visible' as const }),
					animate: 'hidden' as const,
				}
		: {};

	return (
		<RowComponent className={`flex flex-row sm:gap-2 gap-1 w-full sm:h-[3.7rem] h-12 transition-colors`} {...rowMotionProps}>
			{/* Player name */}
			<FlipCard animationMode={animationMode} dismissDelay={dismissDelay} className="flex-1">
				<GameCell isLarge isCorrect={data?.guessResult.isNameCorrect} tooltipDescription="Player" tooltipValue={data?.player.name}>
					<div className="rounded-md h-full flex justify-center sm:px-4 px-2 items-center">
						<p className={`text-white opacity-90 font-extrabold text-center tracking-tight ${useSmallerFont ? 'text-sm' : 'text-xl'} md:text-2xl`}>
							{data?.player.name}
						</p>
					</div>
				</GameCell>
			</FlipCard>
			{/* Country */}
			<FlipCard animationMode={animationMode} dismissDelay={dismissDelay}>
				<GameCell
					isCorrect={data?.guessResult.isCountryCorrect}
					tooltipDescription="Country"
					// Special case for wales, otherwise use INT regionNames or undefined if no data exists
					tooltipValue={data ? (data.player.country === 'GB-WLS' ? 'Wales' : regionNames.of(data.player.country)) : undefined}>
					<ImageCell imgSrc={data?.player.countryImg} />
				</GameCell>
			</FlipCard>
			{/* Role */}
			<FlipCard animationMode={animationMode} dismissDelay={dismissDelay}>
				<GameCell isCorrect={data?.guessResult.isRoleCorrect} tooltipDescription="Role" tooltipValue={data?.player.role}>
					<RoleCell role={data?.player.role} />
				</GameCell>
			</FlipCard>
			{/* Region */}
			{!isOwcsDataset(dataset.dataset) ? (
				<FlipCard animationMode={animationMode} dismissDelay={dismissDelay}>
					<GameCell isCorrect={data?.guessResult.isRegionCorrect} tooltipDescription="Region" tooltipValue={regionTooltip}>
						{useAtlanticPacificImage ? (
							<ImageCell imgSrc={data?.player.regionImg} />
						) : (
							<p className="text-3xl sm:text-4xl font-bold tracking-tight text-white opacity-90">{region}</p>
						)}
					</GameCell>
				</FlipCard>
			) : (
				<FlipCard animationMode={animationMode} dismissDelay={dismissDelay}>
					<GameCell isCorrect={data?.guessResult.isRegionCorrect} tooltipDescription="Region" tooltipValue={regionTooltip}>
						{region === 'EMEA' ? (
							<p className="text-sm sm:text-xl font-bold sm:tracking-tighter text-white opacity-90">{region}</p>
						) : (
							<p className="text-xl sm:text-2xl font-bold tracking-tight text-white opacity-90">{region}</p>
						)}
					</GameCell>
				</FlipCard>
			)}
			{/* Team */}
			<FlipCard animationMode={animationMode} dismissDelay={dismissDelay}>
				<GameCell isCorrect={data?.guessResult.isTeamCorrect} tooltipDescription="Team" tooltipValue={data?.player.team}>
					<TeamLogo teamName={data?.player.team} />
				</GameCell>
			</FlipCard>
		</RowComponent>
	);
}
