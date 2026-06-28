'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useReducedMotion } from 'motion/react';
import { Card, CardContent } from '@/components/ui/card';
import GuessRow from '@/components/game-container/GuessRow';
import { FLIP_OUT_DURATION, ROW_DISMISS_STAGGER, type RowData } from '@/components/game-container/GameContainer';
import { DatasetContext } from '@/context/DatasetContext';
import { type Dataset, DEFAULT_DATASET, getDataset } from '@/data/datasets';
import { getCountryImg, getRegionImg } from '@/data/players/formattedPlayers';
import { GAME_CONFIG } from '@/lib/config';
import type { CountryCode } from '@/types/countries';
import type { HistoryRandomGame } from '@/types/history';

/** Brief pause between the clear (bottom-to-top) and fill (top-to-bottom) phases. */
const PHASE_GAP_MS = 260;

/** Strip `-stageN` suffix to get the base dataset key. */
function baseDataset(key: string): string {
	return key.replace(/-stage\d+$/, '');
}

/** Build renderable rows from a game's already-resolved guesses (+ derived images). */
function toRows(game: HistoryRandomGame): RowData[] {
	return game.guesses.map((g) => ({
		guessResult: g.guessResult,
		player: {
			...g.player,
			id: 0,
			countryImg: g.player.country ? getCountryImg(g.player.country as CountryCode) : '',
			regionImg: getRegionImg(g.player.region),
			// biome-ignore lint/suspicious/noExplicitAny: synthetic player
		} as any,
	}));
}

type Props = {
	/** The game to display, or null before the first game has loaded (empty board). */
	game: HistoryRandomGame | null;
};

/**
 * Renders a logged game's playthrough in the main game grid. When a new game arrives while one is
 * shown, the board clears bottom-to-top (filled → empty), pauses, then fills top-to-bottom
 * (empty → filled). The first game just fills top-to-bottom from an empty board.
 *
 * The currently displayed game (rows AND its dataset context) is kept until the clear animation
 * finishes to never see the wrong data.
 */
export default function GameLogGrid({ game }: Props) {
	const [displayed, setDisplayed] = useState<HistoryRandomGame | null>(null);
	const [isDismissing, setIsDismissing] = useState(false);
	const prefersReducedMotion = useReducedMotion();

	const processedRef = useRef<HistoryRandomGame | null>(null);
	const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);

	useEffect(() => {
		// Ignore null (no game yet) and already-processed games.
		if (game == null || game === processedRef.current) return;
		processedRef.current = game;

		// clear any in-flight phase timers
		for (const t of timersRef.current) clearTimeout(t);
		timersRef.current = [];

		const hasCurrent = displayed != null && displayed.guesses.length > 0;
		if (!hasCurrent || prefersReducedMotion) {
			// First load (or reduced motion): show directly. Filled rows flip in top-to-bottom.
			setIsDismissing(false);
			setDisplayed(game);
			return;
		}

		// Step 1: clear the old game bottom-to-top.
		setIsDismissing(true);
		const visibleRows = Math.min(displayed.guesses.length, GAME_CONFIG.maxGuesses);
		const clearDuration = (visibleRows - 1) * ROW_DISMISS_STAGGER * 1000 + FLIP_OUT_DURATION;

		const t1 = setTimeout(() => {
			// Empty the board so rows reset to empty state.
			setIsDismissing(false);
			setDisplayed(null);
			// Phase 2 (after PHASE_GAP delay): swap in new game and fill.
			const t2 = setTimeout(() => setDisplayed(game), PHASE_GAP_MS);
			timersRef.current.push(t2);
		}, clearDuration);
		timersRef.current.push(t1);
	}, [game, displayed, prefersReducedMotion]);

	useEffect(() => () => timersRef.current.forEach(clearTimeout), []);

	// Dataset context follows the displayed game (lags the incoming one through the clear animation).
	const meta = useMemo(() => (displayed ? getDataset(baseDataset(displayed.datasetKey) as Dataset) ?? DEFAULT_DATASET : DEFAULT_DATASET), [displayed]);
	const guesses = useMemo(() => (displayed ? toRows(displayed) : []), [displayed]);

	// Old logs may have more guesses than the current maxGuesses; cap to the grid's row count.
	const shown = guesses.slice(0, GAME_CONFIG.maxGuesses);
	const filledCount = shown.length;
	const rows = shown.concat(new Array(Math.max(0, GAME_CONFIG.maxGuesses - filledCount)).fill(undefined));

	return (
		<DatasetContext.Provider value={[meta, () => {}]}>
			<Card className="transition-colors">
				<CardContent className="flex flex-col sm:gap-2 gap-1 sm:p-4 p-2 transition-colors">
					{rows.map((guess, index) => {
						// Clear: bottom-to-top (bottom row first). Fill: top-to-bottom (top row first).
						const dismissDelay = guess ? (filledCount - 1 - index) * ROW_DISMISS_STAGGER : 0;
						const flipInDelay = index * ROW_DISMISS_STAGGER;
						return (
							<GuessRow
								data={guess}
								isDismissing={isDismissing}
								dismissDelay={dismissDelay}
								flipInDelay={flipInDelay}
								key={`${
									// biome-ignore lint/suspicious/noArrayIndexKey: rows may be undefined, index helps
									index
								}`}
							/>
						);
					})}
				</CardContent>
			</Card>
		</DatasetContext.Provider>
	);
}
