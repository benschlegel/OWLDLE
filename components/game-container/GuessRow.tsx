'use client';

import { motion, useReducedMotion } from 'motion/react';
import { useContext, useEffect, useRef, useState } from 'react';
import AgeCell from '@/components/game-container/AgeCell';
import ImageCell from '@/components/game-container/CountryCell';
import GameCell, { toCellState } from '@/components/game-container/GameCell';
import type { RowData } from '@/components/game-container/GameContainer';
import RoleCell from '@/components/game-container/RoleCell';
import TeamLogo from '@/components/game-container/TeamLogo';
import { DatasetContext } from '@/context/DatasetContext';
import { isOwcsDataset } from '@/data/datasets';
import { getTeamLogo } from '@/data/teams/logos';
import { atlanticPacificTeams } from '@/data/teams/teams';
import { getCountryDisplayName, getRoleLabel } from '@/lib/client';
import { cn } from '@/lib/utils';

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
}: {
	children: React.ReactNode;
	animationMode: AnimationMode;
	dismissDelay?: number;
	className?: string;
}) {
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

const mobileOwcsCellSize = '44px';

// How many characters until smaller font gets used
const fontBreakpoint = 7;
export default function GuessRow({ data, isDismissing, dismissDelay = 0 }: Props) {
	const useSmallerFont = data && data.player.name.length > 7;
	const [dataset, _] = useContext(DatasetContext);
	let useAtlanticPacificImage = false;
	if (atlanticPacificTeams.includes(dataset.dataset)) {
		useAtlanticPacificImage = true;
	}

	const isOwcs = isOwcsDataset(dataset.dataset);
	// OWCS rows have one extra cell, shrink on mobile to fit
	// const owcsCellSize = isOwcs ? `size-[${mobileOwcsCellSize}]` : undefined;
	const owcsCellSize = isOwcs ? `size-[44px]` : undefined;
	// const owcsCellSize = isOwcs ? 'w-[2.5rem] h-[2.5rem]' : undefined;

	let region = '';
	let regionTooltip = '';
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
		} else if (data.player.region === 'CN') {
			region = 'CN';
			regionTooltip = 'China';
		}
	}

	const teamDisplayName = data ? getTeamLogo(dataset.dataset, data.player.team)?.displayName : undefined;

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
		<RowComponent className={`flex flex-row sm:gap-2 gap-1 w-full sm:h-[3.7rem] ${isOwcs ? `h-[44px]` : 'h-12'} transition-colors`} {...rowMotionProps}>
			{/* Player name */}
			<FlipCard animationMode={animationMode} dismissDelay={dismissDelay} className="flex-1">
				<GameCell
					isLarge
					cellState={toCellState(data?.guessResult.isNameCorrect)}
					tooltipDescription="Player"
					tooltipValue={data?.player.name}
					className={owcsCellSize}>
					<div className="rounded-md h-full flex justify-center sm:px-4 px-2 items-center">
						<p className={`text-white opacity-90 font-extrabold text-center tracking-tight font-owl ${useSmallerFont ? 'text-sm' : 'text-xl'} md:text-2xl`}>
							{data?.player.name}
						</p>
					</div>
				</GameCell>
			</FlipCard>
			{/* Country */}
			<FlipCard animationMode={animationMode} dismissDelay={dismissDelay}>
				<GameCell
					cellState={toCellState(data?.guessResult.isCountryCorrect)}
					tooltipDescription="Country"
					tooltipValue={getCountryDisplayName(data?.player.country)}
					className={cn(owcsCellSize)}>
					<ImageCell imgSrc={data?.player.countryImg} />
				</GameCell>
			</FlipCard>
			{/* Role */}
			<FlipCard animationMode={animationMode} dismissDelay={dismissDelay}>
				<GameCell
					cellState={data?.guessResult.roleMatch ?? toCellState(data?.guessResult.isRoleCorrect)}
					tooltipDescription="Role"
					tooltipValue={getRoleLabel(data?.player.role, data?.player.subRole)}
					className={owcsCellSize}>
					<RoleCell role={data?.player.role} subRole={data?.player.subRole} />
				</GameCell>
			</FlipCard>
			{/* Age (OWCS only) */}
			{isOwcs && (
				<FlipCard animationMode={animationMode} dismissDelay={dismissDelay}>
					<AgeCell hasGuess={data !== undefined} dateBorn={data?.player.dateBorn} ageComparison={data?.guessResult.ageComparison} className={owcsCellSize} />
				</FlipCard>
			)}
			{/* Region */}
			{!isOwcs ? (
				<FlipCard animationMode={animationMode} dismissDelay={dismissDelay}>
					<GameCell
						cellState={toCellState(data?.guessResult.isRegionCorrect)}
						tooltipDescription="Region"
						tooltipValue={regionTooltip}
						className={owcsCellSize}>
						{useAtlanticPacificImage ? (
							<ImageCell imgSrc={data?.player.regionImg} />
						) : (
							<p className="text-3xl sm:text-4xl font-bold tracking-tight text-white opacity-90 font-owl">{region}</p>
						)}
					</GameCell>
				</FlipCard>
			) : (
				<FlipCard animationMode={animationMode} dismissDelay={dismissDelay}>
					<GameCell
						cellState={toCellState(data?.guessResult.isRegionCorrect)}
						tooltipDescription="Region"
						tooltipValue={regionTooltip}
						className={owcsCellSize}>
						{region === 'EMEA' ? (
							<p className="text-sm sm:text-xl font-bold sm:tracking-tighter text-white opacity-90 font-owl">{region}</p>
						) : (
							<p className="text-xl sm:text-2xl font-bold tracking-tight text-white opacity-90 font-owl">{region}</p>
						)}
					</GameCell>
				</FlipCard>
			)}
			{/* Team */}
			<FlipCard animationMode={animationMode} dismissDelay={dismissDelay}>
				<GameCell cellState={toCellState(data?.guessResult.isTeamCorrect)} tooltipDescription="Team" tooltipValue={teamDisplayName} className={owcsCellSize}>
					<TeamLogo teamName={data?.player.team} />
				</GameCell>
			</FlipCard>
		</RowComponent>
	);
}
