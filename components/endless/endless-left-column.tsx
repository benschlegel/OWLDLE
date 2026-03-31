import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Flame, Trophy } from 'lucide-react';

type EndlessStats = {
	currentStreak: number;
	highestStreak: number;
};

export default function EndlessLeftColumn({ stats }: { stats: EndlessStats }) {
	return (
		<div className="hidden xl:block absolute right-full top-layout-top mr-layout-spacing w-layout-width">
			<Card className="transition-colors">
				<CardHeader className="p-4 pb-2">
					<CardTitle className="text-lg font-owl">Streak</CardTitle>
					<Separator />
				</CardHeader>
				<CardContent className="p-4 pt-0">
					<div className="grid grid-cols-2 gap-x-4 gap-y-2.5 text-sm">
						<StatCell label="Current" value={stats.currentStreak} icon={<Flame className="size-4 text-primary-foreground" />} />
						<StatCell label="Best" value={stats.highestStreak} icon={<Trophy className="size-4 text-yellow-500" />} />
					</div>
				</CardContent>
			</Card>
		</div>
	);
}

function StatCell({ label, value, icon }: { label: string; value: number; icon: React.ReactNode }) {
	return (
		<div className="flex justify-between items-center flex-col">
			<div className="flex items-center gap-1.5 mb-0.5">
				{icon}
				<span className="font-bold text-xl font-owl opacity-90">{value}</span>
			</div>
			<span className="text-muted-foreground tracking-wide">{label}</span>
		</div>
	);
}
