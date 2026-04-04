import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import type { Dataset } from '@/data/datasets';
import type { EndlessFilters } from '@/store/endless-store';
import { MedalIcon, Trophy } from 'lucide-react';

type EndlessStats = {
	wins: number;
	games: number;
};

type Props = {
	stats: EndlessStats;
	dataset: Dataset;
	filters: EndlessFilters;
	onOpenLeaderboard: () => void;
};

export default function EndlessRightColumn({ stats, onOpenLeaderboard }: Props) {
	return (
		<div className="hidden xl:block absolute left-full ml-layout-spacing top-endless-top w-layout-width">
			<Card className="transition-colors">
				<Accordion type="single" collapsible defaultValue="games">
					<AccordionItem value="games" className="border-b-0">
						<CardHeader className="p-4">
							<AccordionTrigger className="py-0 hover:no-underline">
								<span className="text-lg font-owl font-semibold leading-none  cursor-pointer tracking-tight">Games</span>
							</AccordionTrigger>
						</CardHeader>
						<AccordionContent className="p-0">
							<CardContent className="p-4 pt-0 space-y-3">
								<div className="flex flex-row justify-around text-sm">
									<StatCell label="Played" value={stats.games} />
									<StatCell label="Wins" value={stats.wins} />
								</div>
								<Separator />
								<Button variant="outline" className="w-full gap-2" onClick={onOpenLeaderboard}>
									<Trophy className="size-4 text-yellow-500" />
									Leaderboard
								</Button>
								<p className="text-xs text-muted-foreground pt-0.5 text-center">Leaderboard shows data for your currently selected filters.</p>
							</CardContent>
						</AccordionContent>
					</AccordionItem>
				</Accordion>
			</Card>
		</div>
	);
}

function StatCell({ label, value }: { label: string; value: number | string }) {
	return (
		<div className="flex justify-between items-center flex-col">
			<div className="flex items-center gap-1.5 mb-0.5">
				<span className="font-bold text-xl font-owl opacity-90">{value}</span>
			</div>
			<span className="text-muted-foreground tracking-wide">{label}</span>
		</div>
	);
}
