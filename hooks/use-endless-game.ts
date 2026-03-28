'use client';

import type { RowData } from '@/components/game-container/GameContainer';
import { type Dataset, DEFAULT_DATASET, getDataset } from '@/data/datasets';
import type { CombinedFormattedPlayer } from '@/data/players/formattedPlayers';
import { GAME_CONFIG } from '@/lib/config';
import { validateGuess } from '@/lib/server';
import { type CompactGuess, useEndlessStore } from '@/store/endless-store';
import { useCallback, useEffect, useMemo } from 'react';

export function useEndlessGame(datasetName: Dataset) {
	const dataset = useMemo(() => getDataset(datasetName) ?? DEFAULT_DATASET, [datasetName]);
	const players = dataset.playerData;

	const { startGame, addGuess, winGame, loseGame, playAgain } = useEndlessStore();
	const stats = useEndlessStore((s) => s.getStats(datasetName));
	const currentGame = stats.current;

	// initialize game if none exists (in useEffect to avoid rendering errors)
	const hasGame = currentGame != null;
	useEffect(() => {
		if (!hasGame) {
			startGame(datasetName, players.length);
		}
	}, [hasGame, datasetName, players.length, startGame]);

	// find correct player from playerIndex
	const correctPlayer = useMemo(() => {
		if (currentGame == null) return null;
		return players[currentGame.playerIndex] ?? null;
	}, [currentGame, players]);

	// reconstruct full RowData from compact guesses by looking up player by ID
	const evaluatedGuesses: RowData[] = useMemo(() => {
		if (!currentGame) return [];
		return currentGame.guesses.reduce<RowData[]>((acc, g) => {
			const player = players.find((p) => p.id === g.id);
			if (player) acc.push({ guessResult: g.result, player });
			return acc;
		}, []);
	}, [currentGame, players]);

	// called by local GuessContext when new guess is submitted
	const submitGuess = useCallback(
		(player: CombinedFormattedPlayer) => {
			if (!currentGame || currentGame.state !== 'in-progress' || !correctPlayer) return;
			if (currentGame.guesses.length >= GAME_CONFIG.maxGuesses) return;

			const guessResult = validateGuess(player, correctPlayer as CombinedFormattedPlayer);
			const compact: CompactGuess = { id: player.id, result: guessResult };

			addGuess(datasetName, compact);

			if (guessResult.isNameCorrect) {
				winGame(datasetName);
			} else if (currentGame.guesses.length + 1 >= GAME_CONFIG.maxGuesses) {
				const prevStreak = useEndlessStore.getState().getStats(datasetName).currentStreak;
				loseGame(datasetName);
				if (prevStreak > 0) {
					const { sessionHistory } = useEndlessStore.getState().getStats(datasetName);
					fetch(`/api/save-endless?dataset=${datasetName}`, {
						method: 'POST',
						headers: { 'Content-Type': 'application/json' },
						body: JSON.stringify({ streakLength: prevStreak, games: sessionHistory }),
					});
				}
			}
		},
		[currentGame, correctPlayer, datasetName, addGuess, winGame, loseGame]
	);

	const handlePlayAgain = useCallback(() => {
		playAgain(datasetName, players.length);
	}, [datasetName, players.length, playAgain]);

	const handleNextGame = useCallback(() => {
		playAgain(datasetName, players.length);
	}, [datasetName, players.length, playAgain]);

	const gameState = currentGame?.state ?? 'in-progress';

	// already guessed players (for checking duplicates)
	const guessedPlayers: CombinedFormattedPlayer[] = useMemo(() => {
		return evaluatedGuesses.map((g) => g.player);
	}, [evaluatedGuesses]);

	return {
		evaluatedGuesses,
		guessedPlayers,
		gameState,
		correctPlayer,
		stats,
		dataset,
		submitGuess,
		handlePlayAgain,
		handleNextGame,
	};
}
