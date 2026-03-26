'use client';

import GameConfetti from '@/components/game-container/game-confetti';
import FooterText from '@/components/footer-text';
import { Button } from '@/components/ui/button';
import type { CombinedFormattedPlayer } from '@/data/players/formattedPlayers';
import { RotateCcw, SkipForward } from 'lucide-react';
import HotkeyBadge from '@/components/ui/hotkey-badge';
import { useEffect } from 'react';

type Props = {
	state: 'won' | 'lost';
	correctPlayer: CombinedFormattedPlayer | null;
	stats: { currentStreak: number; highestStreak: number; wins: number; games: number };
	onRestart: () => void;
	onNextGame: () => void;
	isNewResult: boolean;
};

const NEXT_HOTKEY = 'x';
const RESTART_HOTKEY = '␣';

export default function EndlessResult({ state, correctPlayer, onRestart, onNextGame, isNewResult }: Props) {
	// go next hotkey
	useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			if (e.ctrlKey && e.key === NEXT_HOTKEY) {
				e.preventDefault();
				if (state === 'won') {
					onNextGame();
				}
			}
		};
		window.addEventListener('keydown', handleKeyDown);
		return () => window.removeEventListener('keydown', handleKeyDown);
	}, [onNextGame, state]);

	// restart hotkey
	useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			if (e.ctrlKey && e.code === 'Space') {
				e.preventDefault();
				onNextGame();
			}
		};
		window.addEventListener('keydown', handleKeyDown);
		return () => window.removeEventListener('keydown', handleKeyDown);
	}, [onNextGame]);

	if (state === 'won') {
		return (
			<div id="win" className="flex p-4 gap-1 justify-center items-center mt-4 w-full flex-col">
				<h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl">🎉 You won! 🎉</h1>
				<Button onClick={onNextGame} className="mt-3 gap-2.5 px-6 py-5 text-lg font-mono font-semibold">
					<SkipForward className="size-5" />
					Next Game
					<HotkeyBadge hotkey="x" />
				</Button>
				{isNewResult && <GameConfetti isOldState={false} />}
				<FooterText />
			</div>
		);
	}

	return (
		<div id="lost" className="flex p-4 gap-2 justify-center items-center mt-4 w-full flex-col">
			<h1 className="scroll-m-20 text-3xl font-extrabold tracking-tight lg:text-4xl">❌ You lost... ❌</h1>
			<h3 className="text-xl tracking-tight mt-1 text-center">
				The correct answer was:{' '}
				<code className="relative rounded bg-muted px-[0.3rem] py-[0.2rem] text-lg font-semibold" style={{ fontFamily: 'var(--font-geist-mono)' }}>
					{correctPlayer?.name ?? 'Unknown'}
				</code>
			</h3>
			<Button onClick={onRestart} variant="default" className="mt-3 gap-2.5 px-6 py-5 text-lg font-mono font-semibold">
				<RotateCcw className="size-5" />
				Play Again
				<HotkeyBadge hotkey={RESTART_HOTKEY} />
			</Button>
		</div>
	);
}
