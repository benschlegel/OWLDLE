'use client';

import type { RowData } from '@/components/game-container/GameContainer';
import { type Dataset, DEFAULT_DATASET, getDataset } from '@/data/datasets';
import type { CombinedFormattedPlayer } from '@/data/players/formattedPlayers';
import { PARTNERED_TEAMS_OWCS_S3 } from '@/data/teams/teams';
import { GAME_CONFIG } from '@/lib/config';
import { validateGuess } from '@/lib/server';
import { type CompactGuess, type EndlessFilters, useEndlessStore } from '@/store/endless-store';
import { useCallback, useEffect, useMemo } from 'react';

const DEFAULT_FILTERS: EndlessFilters = { regions: [], partnerOnly: false };
const OWCS_S3_REGION_BITS: Record<string, number> = { EMEA: 1, NA: 2, Korea: 4, CN: 8 };
const ALL_OWCS_S3_REGIONS = Object.keys(OWCS_S3_REGION_BITS);

function encodeFiltersForDb(filters: EndlessFilters): { region: number; isPartnerOnly: boolean } | undefined {
	if (filters.regions.length === 0 && !filters.partnerOnly) return undefined;
	const activeRegions = filters.regions.length === 0 ? ALL_OWCS_S3_REGIONS : filters.regions;
	const region = activeRegions.reduce((acc, r) => acc | (OWCS_S3_REGION_BITS[r] ?? 0), 0);
	return { region, isPartnerOnly: filters.partnerOnly };
}

export function useEndlessGame(datasetName: Dataset) {
	const dataset = useMemo(() => getDataset(datasetName) ?? DEFAULT_DATASET, [datasetName]);
	const players = dataset.playerData;

	const { startGame, addGuess, winGame, loseGame, playAgain, updateFilters } = useEndlessStore();
	const stats = useEndlessStore((s) => s.getStats(datasetName));
	const currentGame = stats.current;

	const filters = stats.filters ?? DEFAULT_FILTERS;

	const filteredPlayers = useMemo(() => {
		let result = players;
		if (filters.regions.length > 0) {
			result = result.filter((p) => filters.regions.includes(p.region ?? ''));
		}
		if (filters.partnerOnly) {
			result = result.filter((p) => (PARTNERED_TEAMS_OWCS_S3 as readonly string[]).includes(p.team as string));
		}
		return result.length > 0 ? result : players;
	}, [players, filters.regions, filters.partnerOnly]);

	const validIndices = useMemo(
		() => filteredPlayers.map((fp) => players.findIndex((p) => p.id === fp.id)),
		[filteredPlayers, players]
	);

	// initialize game if none exists (in useEffect to avoid rendering errors)
	const hasGame = currentGame != null;
	useEffect(() => {
		if (!hasGame) {
			startGame(datasetName, validIndices);
		}
	}, [hasGame, datasetName, validIndices, startGame]);

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
					const { sessionHistory, filters: sessionFilters } = useEndlessStore.getState().getStats(datasetName);
					const filterPayload = encodeFiltersForDb(sessionFilters ?? DEFAULT_FILTERS);
					fetch(`/api/save-endless?dataset=${datasetName}`, {
						method: 'POST',
						headers: { 'Content-Type': 'application/json' },
						body: JSON.stringify({
							streakLength: prevStreak,
							games: sessionHistory,
							...(filterPayload !== undefined && { filters: filterPayload }),
						}),
					});
				}
			}
		},
		[currentGame, correctPlayer, datasetName, addGuess, winGame, loseGame]
	);

	const handlePlayAgain = useCallback(() => {
		playAgain(datasetName, validIndices);
	}, [datasetName, validIndices, playAgain]);

	const handleNextGame = useCallback(() => {
		playAgain(datasetName, validIndices);
	}, [datasetName, validIndices, playAgain]);

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
		filteredPlayers,
		filters,
		updateFilters,
		submitGuess,
		handlePlayAgain,
		handleNextGame,
	};
}
