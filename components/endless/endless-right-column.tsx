import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { MedalIcon } from 'lucide-react';

type EndlessStats = {
	wins: number;
	games: number;
};

export default function EndlessRightColumn({ stats }: { stats: EndlessStats }) {
	const winRate = stats.games > 0 ? Math.round((stats.wins / stats.games) * 100) : 0;

	return (
		<div className="hidden xl:block absolute left-full ml-layout-spacing top-endless-top w-layout-width">
			<Card className="transition-colors">
				<Accordion type="single" collapsible defaultValue="games">
					<AccordionItem value="games" className="border-b-0">
						<CardHeader className="p-4">
							<AccordionTrigger className="py-0 hover:no-underline">
								<span className="text-lg font-owl font-semibold leading-none  cursor-pointer tracking-tight">Games</span>
							</AccordionTrigger>
							{/* <Separator /> */}
						</CardHeader>
						<AccordionContent className="p-0">
							<CardContent className="p-4 pt-0">
								<div className="flex flex-row justify-around text-sm">
									<StatCell label="Played" value={stats.games} icon={<MedalIcon className="size-4 text-yellow-400" />} />
									{/* <StatCell label="Win Rate" value={`${winRate}%`} icon={<MedalIcon className="size-4 text-green-700" />} /> */}
									<StatCell label="Wins" value={stats.wins} icon={<MedalIcon className="size-4 text-yellow-400" />} />
								</div>
							</CardContent>
						</AccordionContent>
					</AccordionItem>
				</Accordion>
			</Card>
		</div>
	);
}

function StatCell({ label, value, icon }: { label: string; value: number | string; icon?: React.ReactNode }) {
	return (
		<div className="flex justify-between items-center flex-col">
			<div className="flex items-center gap-1.5 mb-0.5">
				{/* {icon} */}
				<span className="font-bold text-xl font-owl opacity-90">{value}</span>
			</div>
			<span className="text-muted-foreground tracking-wide">{label}</span>
		</div>
	);
}
