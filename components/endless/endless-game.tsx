'use client';

import React, { lazy, Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import GameContainer, { FLIP_OUT_DURATION, ROW_DISMISS_STAGGER } from '@/components/game-container/GameContainer';
import PlayerSearch from '@/components/game-container/search';
import EndlessResult from '@/components/endless/endless-result';
import EndlessLeftColumn from '@/components/endless/endless-left-column';
import EndlessRightColumn from '@/components/endless/endless-right-column';
import { StreakDisplay } from '@/components/endless/streak-display';
import { useEndlessGame } from '@/hooks/use-endless-game';
import type { Dataset } from '@/data/datasets';
import { GuessContext } from '@/context/GuessContext';
import { DatasetContext } from '@/context/DatasetContext';
import type { CombinedFormattedPlayer } from '@/data/players/formattedPlayers';
import { useSettings } from '@/store/settings-store';
import { useReducedMotion } from 'motion/react';
import { useDialogState } from '@/hooks/use-dialog-param';
import LeaderboardNameDialog from '@/components/endless/leaderboard-name-dialog';
import LeaderboardDialog from '@/components/endless/leaderboard-dialog';

const SearchDialog = lazy(() => import('@/components/game-container/search-dialog'));
const MemoizedPlayerSearch = React.memo(PlayerSearch);

const defaultStats = { currentStreak: 0, highestStreak: 0, wins: 0, games: 0 };

type Props = {
	dataset: Dataset;
};

export default function EndlessGame({ dataset: datasetName }: Props) {
	const {
		evaluatedGuesses, guessedPlayers, gameState, correctPlayer, stats, dataset, filteredPlayers, filters,
		submitGuess, handlePlayAgain, handleNextGame, pendingSave, submitWithName, submitAnonymous,
	} = useEndlessGame(datasetName);

	const prefersReducedMotion = useReducedMotion();
	const [isDismissing, setIsDismissing] = useState(false);
	const { open: leaderboardOpen, setOpen: setLeaderboardOpen } = useDialogState('leaderboard');

	const handleDismissAndReset = useCallback(
		(resetFn: () => void) => {
			if (prefersReducedMotion || evaluatedGuesses.length === 0) {
				resetFn();
				return;
			}
			setIsDismissing(true);
			const duration = (evaluatedGuesses.length - 1) * ROW_DISMISS_STAGGER * 1000 + FLIP_OUT_DURATION;
			setTimeout(() => {
				setIsDismissing(false);
				resetFn();
			}, duration);
		},
		[evaluatedGuesses.length, prefersReducedMotion]
	);

	const dismissAndPlayAgain = useCallback(() => {
		handleDismissAndReset(handlePlayAgain);
	}, [handleDismissAndReset, handlePlayAgain]);

	const dismissAndNextGame = useCallback(() => {
		handleDismissAndReset(handleNextGame);
	}, [handleDismissAndReset, handleNextGame]);

	const playerSearchClassName = useMemo(() => 'mt-6', []);

	// used to fix hydration warnings
	const [mounted, setMounted] = useState(false);
	useEffect(() => setMounted(true), []);

	// track whether a win/loss just happened (vs loaded from storage).
	const prevStateRef = useRef<string | null>(null);
	const isNewResult = gameState !== 'in-progress' && prevStateRef.current === 'in-progress';
	useEffect(() => {
		if (mounted) {
			prevStateRef.current = gameState;
		}
	}, [gameState, mounted]);

	// reset tracking when dataset changes (should reset state)
	const prevDatasetRef = useRef(datasetName);
	if (prevDatasetRef.current !== datasetName) {
		prevDatasetRef.current = datasetName;
		prevStateRef.current = null;
	}

	// local GuessContext that intercepts setGuesses to process guesses directly.
	// PlayerSearch calls setGuesses([...guesses, player]), new player gets detected and submitted here
	const setGuessesInterceptor = useCallback(
		(action: React.SetStateAction<CombinedFormattedPlayer[]>) => {
			const newGuesses = typeof action === 'function' ? action(guessedPlayers) : action;
			if (newGuesses.length > guessedPlayers.length) {
				const newPlayer = newGuesses[newGuesses.length - 1];
				submitGuess(newPlayer);
			}
		},
		[guessedPlayers, submitGuess]
	);

	const guessContextValue = useMemo(
		(): [CombinedFormattedPlayer[], React.Dispatch<React.SetStateAction<CombinedFormattedPlayer[]>>] => [guessedPlayers, setGuessesInterceptor],
		[guessedPlayers, setGuessesInterceptor]
	);

	const filteredDataset = useMemo(() => ({ ...dataset, playerData: filteredPlayers }), [dataset, filteredPlayers]);
	const datasetContextValue = useMemo((): [typeof dataset, React.Dispatch<React.SetStateAction<typeof dataset>>] => [filteredDataset, () => {}], [filteredDataset]);

	if (!mounted) {
		return (
			<div className="pb-2">
				<EndlessLeftColumn stats={defaultStats} dataset={datasetName} />
				<EndlessRightColumn stats={defaultStats} dataset={datasetName} filters={filters} onOpenLeaderboard={() => {}} />
				<div className="xl:hidden">
					<StreakDisplay stats={defaultStats} />
				</div>
				<GameContainer guesses={[]} />
			</div>
		);
	}

	return (
		<DatasetContext.Provider value={datasetContextValue}>
			<GuessContext.Provider value={guessContextValue}>
				<div className="pb-2">
					<EndlessLeftColumn stats={stats} dataset={datasetName} />
					<EndlessRightColumn stats={stats} dataset={datasetName} filters={filters} onOpenLeaderboard={() => setLeaderboardOpen(true)} />
					<div className="xl:hidden">
						<StreakDisplay stats={stats} onOpenLeaderboard={() => setLeaderboardOpen(true)} />
					</div>
					{process.env.NODE_ENV === 'development' && <DevAnswer correctPlayer={correctPlayer} />}
					<GameContainer guesses={evaluatedGuesses} isDismissing={isDismissing} />
					{gameState === 'in-progress' || isDismissing ? (
						<>
							<MemoizedPlayerSearch className={playerSearchClassName} />
							<Suspense fallback={<div className="aria-hidden hidden" />}>
								<SearchDialog />
							</Suspense>
						</>
					) : (
						<EndlessResult
							state={gameState}
							correctPlayer={correctPlayer}
							stats={stats}
							onRestart={dismissAndPlayAgain}
							onNextGame={dismissAndNextGame}
							isNewResult={isNewResult}
						/>
					)}
					<LeaderboardNameDialog
						open={pendingSave !== null}
						streakLength={pendingSave?.streakLength ?? 0}
						onSubmitWithName={submitWithName}
						onSubmitAnonymous={submitAnonymous}
					/>
					<LeaderboardDialog
						open={leaderboardOpen}
						onOpenChange={setLeaderboardOpen}
						dataset={datasetName}
						filters={filters}
					/>
				</div>
			</GuessContext.Provider>
		</DatasetContext.Provider>
	);
}

function DevAnswer({ correctPlayer }: { correctPlayer: CombinedFormattedPlayer | null }) {
	const isVisible = useSettings((s) => s.isDevAnswerVisible);
	if (!isVisible || !correctPlayer) return null;
	return <p className="text-center text-xs text-muted-foreground/50 mb-1 font-mono">[dev] answer: {correctPlayer.name}</p>;
}
