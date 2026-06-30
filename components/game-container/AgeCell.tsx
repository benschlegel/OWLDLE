'use client';

import { MoveDownIcon, MoveUpIcon } from 'lucide-react';
import GameCell from '@/components/game-container/GameCell';
import { cn, getAgeFromDate } from '@/lib/utils';

type AgeComparison = 'higher' | 'lower' | 'equal';

type Props = {
	/** Whether a guess has been made for this row (false => empty placeholder cell). */
	hasGuess: boolean;
	/** ISO (YYYY-MM-DD) birth date of the guessed player, if known. */
	dateBorn?: string;
	/** Answer's age relative to the guessed player's age (from the guess result). */
	ageComparison?: AgeComparison;
	/** Extra classes forwarded to the GameCell (e.g. the OWCS mobile size override). */
	className?: string;
};

export default function AgeCell({ hasGuess, dateBorn, ageComparison, className }: Props) {
	// No guess yet → empty gray cell, matching the other columns.
	if (!hasGuess) {
		return <GameCell tooltipDescription="Age" className={className} />;
	}

	// Guessed player has no birth-date data → neutral "?" cell.
	if (!dateBorn) {
		return (
			<GameCell tooltipDescription="Age (Unknown)" tooltipValue="Unknown" className={cn('flex justify-center items-center', className)}>
				<span className="font-owl text-xl sm:text-2xl opacity-70">?</span>
			</GameCell>
		);
	}

	const age = getAgeFromDate(dateBorn);

	// Map comparison to cell colour. undefined (answer lacks data) stays neutral gray.
	let cellState: 'correct' | 'partial' | undefined;
	if (ageComparison === 'equal') cellState = 'correct';
	else if (ageComparison === 'higher' || ageComparison === 'lower') cellState = 'partial';

	const tooltipGuess =
		ageComparison === 'equal'
			? `Same age (${age})`
			: ageComparison === 'higher'
				? `Older than ${age})`
				: ageComparison === 'lower'
					? `Younger than (${age})`
					: undefined;

	return (
		<GameCell
			cellState={cellState}
			tooltipDescription="Age"
			tooltipGuess={tooltipGuess}
			className={cn('flex flex-row gap-0.5 justify-center items-center', className)}>
			<span className="font-owl text-2xl sm:text-3xl">{age}</span>
			{ageComparison === 'higher' && <MoveUpIcon viewBox="6 0 12 24" width={12} className="-mr-1 text-[#3c3c44]" strokeWidth={2.75} />}
			{ageComparison === 'lower' && <MoveDownIcon viewBox="6 0 12 24" width={12} className="-mr-1 text-[#3c3c44]" strokeWidth={2.75} />}
		</GameCell>
	);
}
