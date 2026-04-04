'use client';

import { DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import type { Dataset } from '@/data/datasets';
import type { EndlessFilters } from '@/store/endless-store';
import { useEndlessStore } from '@/store/endless-store';
import { GAME_CONFIG } from '@/lib/config';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Pencil, Trophy, Check, X, Crosshair } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { keepPreviousData, useQuery, useQueryClient } from '@tanstack/react-query';

type LeaderboardEntry = {
	name?: string;
	streakLength: number;
	finishedAt: string;
	clientId: string;
	anonymous?: boolean;
};

type LeaderboardResponse = {
	entries: LeaderboardEntry[];
	total: number;
	page: number;
	limit: number;
	myRank?: number;
};

const OWCS_S3_REGION_BITS: Record<string, number> = { EMEA: 1, NA: 2, Korea: 4, CN: 8 };
const ALL_OWCS_S3_REGIONS = Object.keys(OWCS_S3_REGION_BITS);
const PAGE_SIZE = GAME_CONFIG.leaderboardPageSize;
// Fixed row height so the table doesn't shift between pages
const ROW_HEIGHT_CLASS = 'h-10';
const ROW_HEIGHT_PX = 40;

function encodeFiltersForQuery(filters: EndlessFilters): string {
	if (filters.regions.length === 0 && !filters.partnerOnly) return '';
	const activeRegions = filters.regions.length === 0 ? ALL_OWCS_S3_REGIONS : filters.regions;
	const region = activeRegions.reduce((acc, r) => acc | (OWCS_S3_REGION_BITS[r] ?? 0), 0);
	return `&region=${region}&partnerOnly=${filters.partnerOnly}`;
}

async function fetchLeaderboard(dataset: Dataset, page: number, filters: EndlessFilters, clientId?: string): Promise<LeaderboardResponse> {
	const filterQuery = dataset === 'owcs-s3' ? encodeFiltersForQuery(filters) : '';
	const clientQuery = clientId ? `&findClientId=${clientId}` : '';
	const res = await fetch(`/api/endless/leaderboard?dataset=${dataset}&page=${page}&limit=${PAGE_SIZE}${filterQuery}${clientQuery}`);
	if (!res.ok) throw new Error('Failed to fetch leaderboard');
	return res.json();
}

type Props = {
	open: boolean;
	dataset: Dataset;
	filters: EndlessFilters;
};

export default function LeaderboardContent({ open, dataset, filters }: Props) {
	const clientId = useEndlessStore((s) => s.leaderboard.clientId);
	const leaderboardName = useEndlessStore((s) => s.leaderboard.name);
	const setLeaderboardName = useEndlessStore((s) => s.setLeaderboardName);

	const [page, setPage] = useState(1);
	const [myRankCache, setMyRankCache] = useState<number | null>(null);
	const [editingName, setEditingName] = useState(false);
	const [editNameValue, setEditNameValue] = useState('');

	const queryClient = useQueryClient();

	const filterKey = dataset !== 'owcs-s3' ? 'none' : `${filters.regions.join(',')}-${filters.partnerOnly}`;

	// Only request rank on page 1 (first load), cache it locally
	const shouldFindRank = page === 1;

	const { data, isLoading, isPlaceholderData } = useQuery({
		queryKey: ['leaderboard', dataset, filterKey, page],
		queryFn: () => fetchLeaderboard(dataset, page, filters, shouldFindRank ? clientId : undefined),
		enabled: open,
		staleTime: 30_000,
		refetchOnWindowFocus: false,
		placeholderData: keepPreviousData,
	});

	// Cache myRank from page 1 response
	useEffect(() => {
		if (data?.myRank != null) setMyRankCache(data.myRank);
	}, [data?.myRank]);

	const entries = data?.entries ?? [];
	const total = data?.total ?? 0;
	const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

	// Reset page when dialog opens
	useEffect(() => {
		if (open) {
			setPage(1);
			setMyRankCache(null);
		}
	}, [open]);

	const jumpToMyEntry = useCallback(() => {
		if (myRankCache) {
			setPage(Math.ceil(myRankCache / PAGE_SIZE));
		}
	}, [myRankCache]);

	// Keyboard pagination (arrow keys), disabled while editing name
	useEffect(() => {
		if (!open) return;
		const handleKey = (e: KeyboardEvent) => {
			if (editingName) return;
			if (e.key === 'ArrowLeft') setPage((p) => Math.max(1, p - 1));
			else if (e.key === 'ArrowRight') setPage((p) => Math.min(totalPages, p + 1));
		};
		window.addEventListener('keydown', handleKey);
		return () => window.removeEventListener('keydown', handleKey);
	}, [open, editingName, totalPages]);

	// Edit name handlers
	const startEditName = () => {
		setEditNameValue(leaderboardName ?? '');
		setEditingName(true);
	};

	const confirmEditName = async () => {
		const trimmed = editNameValue.trim();
		if (trimmed.length < 2 || trimmed.length > 20) return;

		setLeaderboardName(trimmed);
		setEditingName(false);

		await fetch('/api/endless/leaderboard', {
			method: 'PATCH',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ clientId, name: trimmed }),
		});

		queryClient.invalidateQueries({ queryKey: ['leaderboard', dataset, filterKey, page] });
	};

	const cancelEditName = () => setEditingName(false);

	const formatDate = (dateStr: string) => {
		try {
			return new Date(dateStr).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
		} catch {
			return '';
		}
	};

	const showLoading = isLoading && entries.length === 0;

	return (
		<DialogContent className="max-w-md">
			<DialogHeader>
				<DialogTitle className="flex items-center gap-2">
					<Trophy className="size-5 text-yellow-500" />
					Leaderboard
				</DialogTitle>
			</DialogHeader>

			{/* Your name + edit */}
			<div className="flex items-center gap-2 text-sm border rounded-md px-3 py-2">
				<span className="text-muted-foreground shrink-0">Your name:</span>
				{editingName ? (
					<>
						<Input
							value={editNameValue}
							onChange={(e) => setEditNameValue(e.target.value)}
							className="h-7 text-sm"
							maxLength={20}
							autoFocus
							onKeyDown={(e) => {
								if (e.key === 'Enter') confirmEditName();
								if (e.key === 'Escape') cancelEditName();
							}}
						/>
						<Button variant="ghost" size="icon" className="size-7 shrink-0" onClick={confirmEditName}>
							<Check className="size-3.5" />
						</Button>
						<Button variant="ghost" size="icon" className="size-7 shrink-0" onClick={cancelEditName}>
							<X className="size-3.5" />
						</Button>
					</>
				) : (
					<>
						<span className="font-medium truncate">{leaderboardName ?? 'Not set'}</span>
						<Button variant="ghost" size="icon" className="size-7 shrink-0 ml-auto" onClick={startEditName}>
							<Pencil className="size-3.5" />
						</Button>
					</>
				)}
			</div>

			<div className="flex flex-col">
				{showLoading ? (
					<div className="flex items-center justify-center text-muted-foreground text-sm" style={{ height: `${(PAGE_SIZE + 1) * ROW_HEIGHT_PX}px` }}>
						Loading...
					</div>
				) : entries.length === 0 ? (
					<div className="flex items-center justify-center text-muted-foreground text-sm" style={{ height: `${(PAGE_SIZE + 1) * ROW_HEIGHT_PX}px` }}>
						No leaderboard entries yet. Be the first!
					</div>
				) : (
					<div style={{ opacity: isPlaceholderData ? 0.6 : 1, transition: 'opacity 150ms' }}>
						{/* Header */}
						<div
							className={`grid grid-cols-[2.5rem_1fr_3.5rem_5.5rem] gap-2 px-2 items-center text-xs text-muted-foreground font-medium border-b ${ROW_HEIGHT_CLASS}`}>
							<span>#</span>
							<span>Name</span>
							<span className="text-right">Streak</span>
							<span className="text-right">Date</span>
						</div>
						{/* Rows, always render PAGE_SIZE slots for stable height */}
						<div className="divide-y">
							{Array.from({ length: PAGE_SIZE }, (_, i) => {
								const entry = entries[i];
								const rank = (page - 1) * PAGE_SIZE + i + 1;
								if (!entry) {
									return <div key={rank} className={ROW_HEIGHT_CLASS} />;
								}
								const isOwn = entry.clientId === clientId;
								return (
									<div
										key={rank}
										className={`grid grid-cols-[2.5rem_1fr_3.5rem_5.5rem] gap-2 px-2 items-center text-sm ${ROW_HEIGHT_CLASS} ${isOwn ? 'bg-primary/10 font-semibold' : ''}`}>
										<span className="text-muted-foreground tabular-nums">{rank <= 3 ? ['\ud83e\udd47', '\ud83e\udd48', '\ud83e\udd49'][rank - 1] : rank}</span>
										<span className={`truncate ${entry.anonymous ? 'text-muted-foreground italic' : ''}`}>{entry.name ?? 'Anonymous'}</span>
										<span className="text-right tabular-nums font-mono">{entry.streakLength}</span>
										<span className="text-right text-xs text-muted-foreground tabular-nums">{formatDate(entry.finishedAt)}</span>
									</div>
								);
							})}
						</div>
					</div>
				)}

				{/* Pagination + go to me */}
				<div className="flex items-center justify-between pt-3 mt-2 gap-1">
					<div className="flex items-center gap-1">
						{myRankCache !== null && (
							<Button variant="outline" size="sm" className="gap-1 text-xs shrink-0 select-none" onClick={jumpToMyEntry}>
								Go to me
							</Button>
						)}
					</div>
					<div className="flex items-center gap-1 ml-auto">
						<Button variant="outline" size="icon" className="size-7" onClick={() => setPage(1)} disabled={page <= 1}>
							<ChevronsLeft className="size-4" />
						</Button>
						<Button variant="outline" size="icon" className="size-7" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page <= 1}>
							<ChevronLeft className="size-4" />
						</Button>
						<span className="w-16 text-center text-xs tabular-nums text-muted-foreground select-none">
							{page} / {totalPages}
						</span>
						<Button variant="outline" size="icon" className="size-7" onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page >= totalPages}>
							<ChevronRight className="size-4" />
						</Button>
						<Button variant="outline" size="icon" className="size-7" onClick={() => setPage(totalPages)} disabled={page >= totalPages}>
							<ChevronsRight className="size-4" />
						</Button>
					</div>
				</div>
			</div>
		</DialogContent>
	);
}
