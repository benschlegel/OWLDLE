'use client';

import type { RowData } from '@/components/game-container/GameContainer';
import { type Dataset, DEFAULT_DATASET, getDataset } from '@/data/datasets';
import type { CombinedFormattedPlayer } from '@/data/players/formattedPlayers';
import { getDatasetFilterConfig } from '@/data/endless-filter-config';
import { GAME_CONFIG } from '@/lib/config';
import { validateGuess } from '@/lib/server';
import { type CompactGuess, type EndlessFilters, useEndlessStore } from '@/store/endless-store';
import { useQueryClient } from '@tanstack/react-query';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

export const ENDLESS_BACKEND_DISABLED = false;

const DEFAULT_FILTERS: EndlessFilters = { regions: [], topTeamsOnly: false };
const OWCS_S3_REGION_BITS: Record<string, number> = { EMEA: 1, NA: 2, Korea: 4, CN: 8 };
const ALL_OWCS_S3_REGIONS = Object.keys(OWCS_S3_REGION_BITS);

function encodeFiltersForDb(filters: EndlessFilters): { region: number; isPartnerOnly: boolean } | undefined {
	const regions = filters.regions ?? [];
	if (regions.length === 0 && !filters.topTeamsOnly) return undefined;
	const activeRegions = regions.length === 0 ? ALL_OWCS_S3_REGIONS : regions;
	const region = activeRegions.reduce((acc, r) => acc | (OWCS_S3_REGION_BITS[r] ?? 0), 0);
	return { region, isPartnerOnly: filters.topTeamsOnly };
}

export type PendingSave = {
	dataset: Dataset;
	streakLength: number;
	games: { guessCount: number; result: 'won' | 'lost'; completedAt: number }[];
	filters?: { region: number; isPartnerOnly: boolean };
};

export function useEndlessGame(datasetName: Dataset) {
	const dataset = useMemo(() => getDataset(datasetName) ?? DEFAULT_DATASET, [datasetName]);
	const players = dataset.playerData;

	const queryClient = useQueryClient();
	const { startGame, addGuess, winGame, loseGame, playAgain, updateFilters } = useEndlessStore();
	const stats = useEndlessStore((s) => s.getStats(datasetName));
	const leaderboard = useEndlessStore((s) => s.leaderboard);
	const currentGame = stats.current;

	const filters = stats.filters ?? DEFAULT_FILTERS;

	const filteredPlayers = useMemo(() => {
		const config = getDatasetFilterConfig(datasetName);
		let result = players;
		const regions = filters.regions ?? [];
		if (regions.length > 0) {
			result = result.filter((p) => regions.includes(p.region ?? ''));
		}
		if (filters.topTeamsOnly && config?.topTeamsFilter) {
			const topTeams = config.topTeamsFilter.teams as readonly string[];
			result = result.filter((p) => topTeams.includes(p.team as string));
		}
		return result.length > 0 ? result : players;
	}, [players, filters.regions, filters.topTeamsOnly, datasetName]);

	const validIndices = useMemo(() => filteredPlayers.map((fp) => players.findIndex((p) => p.id === fp.id)), [filteredPlayers, players]);

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

	// When a qualifying streak ends, defer the save so the name dialog can attach a name.
	const [pendingSave, setPendingSave] = useState<PendingSave | null>(null);
	const pendingSaveRef = useRef<PendingSave | null>(null);

	// Actually send the save request (called after name dialog resolves or immediately for non qualifying runs)
	const executeSave = useCallback(
		(save: PendingSave, name?: string) => {
			if (ENDLESS_BACKEND_DISABLED) {
				setPendingSave(null);
				pendingSaveRef.current = null;
				return;
			}
			const { clientId } = leaderboard;
			fetch(`/api/save-endless?dataset=${save.dataset}`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					streakLength: save.streakLength,
					games: save.games,
					...(save.filters !== undefined && { filters: save.filters }),
					...(name !== undefined ? { name, clientId } : { anonymous: true, clientId }),
				}),
			}).then((res) => {
				if (res.ok) {
					queryClient.invalidateQueries({ queryKey: ['leaderboard', save.dataset] });
					queryClient.invalidateQueries({ queryKey: ['leaderboard-top5', save.dataset] });
				}
			});
			setPendingSave(null);
			pendingSaveRef.current = null;
		},
		[leaderboard, queryClient]
	);

	const submitWithName = useCallback(
		(name: string) => {
			if (pendingSaveRef.current) executeSave(pendingSaveRef.current, name);
		},
		[executeSave]
	);

	const submitAnonymous = useCallback(() => {
		if (pendingSaveRef.current) executeSave(pendingSaveRef.current);
	}, [executeSave]);

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

					// Add completedAt to final (loss) game, wins already have it from winGame flow
					const gamesWithTimestamps = sessionHistory.map((g) => ({
						...g,
						completedAt: g.completedAt ?? Date.now(),
					}));

					const save: PendingSave = {
						dataset: datasetName,
						streakLength: prevStreak,
						games: gamesWithTimestamps,
						filters: filterPayload,
					};

					const { name } = useEndlessStore.getState().leaderboard;
					const qualifies = prevStreak >= GAME_CONFIG.minLeaderboardStreak;

					if (qualifies && name) {
						// Has name set already: auto-submit with name
						executeSave(save, name);
					} else if (qualifies) {
						// Qualifying run, no name yet: show dialog
						setPendingSave(save);
						pendingSaveRef.current = save;
					} else {
						// Non-qualifying: save anonymously
						executeSave(save);
					}
				}
			}
		},
		[currentGame, correctPlayer, datasetName, addGuess, winGame, loseGame, executeSave]
	);

	const handlePlayAgain = useCallback(() => {
		// If there's a pending save that wasn't resolved, send it anonymously
		if (pendingSaveRef.current) {
			executeSave(pendingSaveRef.current);
		}
		playAgain(datasetName, validIndices);
	}, [datasetName, validIndices, playAgain, executeSave]);

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
		pendingSave,
		submitWithName,
		submitAnonymous,
	};
}
