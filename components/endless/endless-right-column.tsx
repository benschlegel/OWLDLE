import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { MedalIcon } from 'lucide-react';

type EndlessStats = {
	wins: number;
	games: number;
};

export default function EndlessRightColumn({ stats }: { stats: EndlessStats }) {
	const winRate = stats.games > 0 ? Math.round((stats.wins / stats.games) * 100) : 0;

	return (
		<div className="hidden xl:block absolute left-full ml-layout-spacing top-layout-top w-layout-width">
			<Card className="transition-colors">
				<CardHeader className="p-4 pb-2">
					<CardTitle className="text-lg font-owl">Wins</CardTitle>
					<Separator />
				</CardHeader>
				<CardContent className="p-4 pt-0">
					<div className="grid grid-cols-3 gap-x-4 gap-y-2.5 text-sm">
						<StatCell label="Played" value={stats.games} />
						<StatCell label="Win Rate" value={`${winRate}%`} icon={<MedalIcon className="size-4 text-green-700" />} />
						<StatCell label="Wins" value={stats.wins} />
					</div>
				</CardContent>
			</Card>
		</div>
	);
}

function StatCell({ label, value, icon }: { label: string; value: number | string; icon?: React.ReactNode }) {
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
