'use client';

import { DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useEndlessStore } from '@/store/endless-store';
import { useState, useEffect } from 'react';

type Props = {
	open: boolean;
	streakLength: number;
	onSubmitWithName: (name: string) => void;
	onSubmitAnonymous: () => void;
};

export default function LeaderboardNameContent({ open, streakLength, onSubmitWithName, onSubmitAnonymous }: Props) {
	const existingName = useEndlessStore((s) => s.leaderboard.name);
	const setLeaderboardName = useEndlessStore((s) => s.setLeaderboardName);

	const [name, setName] = useState(existingName ?? '');
	const [touched, setTouched] = useState(false);

	useEffect(() => {
		if (open) { setName(existingName ?? ''); setTouched(false); }
	}, [open, existingName]);

	const isValid = name.trim().length >= 2 && name.trim().length <= 20;

	const handleSubmit = () => {
		if (!isValid) return;
		setLeaderboardName(name.trim());
		onSubmitWithName(name.trim());
	};

	return (
		<DialogContent disableCloseButton>
			<DialogHeader>
				<DialogTitle>Submit to Leaderboard?</DialogTitle>
				<DialogDescription>
					Your streak of <span className="font-bold">{streakLength}</span> qualifies for the leaderboard!
				</DialogDescription>
			</DialogHeader>

			<div className="space-y-1.5 py-2">
				<Label htmlFor="leaderboard-name">Display Name</Label>
				<Input
					id="leaderboard-name"
					value={name}
					onChange={(e) => setName(e.target.value)}
					placeholder="2-20 characters"
					maxLength={20}
					autoFocus
					onBlur={() => setTouched(true)}
					onKeyDown={(e) => { if (e.key === 'Enter' && isValid) handleSubmit(); }}
				/>
				{touched && name.length > 0 && !isValid && (
					<p className="text-xs text-destructive">At least 2 characters.</p>
				)}
			</div>

			<DialogFooter className="flex-col sm:flex-row gap-2">
				<Button variant="outline" onClick={onSubmitAnonymous} className="sm:order-1">
					Skip
				</Button>
				<Button onClick={handleSubmit} disabled={!isValid} className="sm:order-2">
					Submit
				</Button>
			</DialogFooter>
		</DialogContent>
	);
}
