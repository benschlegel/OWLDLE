import GlobalStats from '@/components/game-container/global-stats';
import PersonalStats from '@/components/game-container/personal-stats';
import { DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ChartBarIcon, ChartColumnIcon, SettingsIcon } from 'lucide-react';

type Props = {
	setOpen: (value: boolean) => void;
};

export default function StatsContent({ setOpen }: Props) {
	return (
		<DialogContent className="sm:max-w-xl sm:py-6 sm:px-7 px-4 max-h-[70vh] flex flex-col" aria-describedby="Game stats.">
			<DialogHeader>
				<DialogTitle className="flex flex-row gap-2 items-center text-left">
					<ChartColumnIcon className="h-[1.3rem] w-[1.3rem] opacity-80" />
					<span>Stats</span>
				</DialogTitle>
			</DialogHeader>
			<div className="flex flex-col gap-2 min-w-0 overflow-y-auto">
				<div className="w-full flex flex-col gap-8">
					<PersonalStats />
					<GlobalStats />
				</div>
			</div>
		</DialogContent>
	);
}
