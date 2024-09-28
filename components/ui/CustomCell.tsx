import type { DemoCell } from '@/components/game-container/HelpContent';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

type Props = {
	cellData: Partial<DemoCell>;
	ignoreTabIndex?: boolean;
	id?: string;
	isSmall?: boolean;
};

export default function CustomCell({ cellData, id, ignoreTabIndex, isSmall }: Props) {
	const tooltip = cellData.description;
	return (
		<TooltipProvider delayDuration={0}>
			<Tooltip>
				<TooltipTrigger asChild tabIndex={!ignoreTabIndex ? 0 : -1}>
					{!isSmall ? (
						<div
							id={id}
							className={`sm:w-[3.7rem] w-[3rem] sm:h-[3.7rem] h-[3rem] rounded-sm flex items-center justify-center p-2 ${cellData.isLarge && 'flex-1'} text-opacity-85 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-1`}
							style={{ backgroundColor: cellData.bgColor, color: cellData.color }}>
							<p className="text-opacity-100 leading-4 text-sm">{cellData.text}</p>
						</div>
					) : (
						<div
							id={id}
							className={`w-[2.5rem] h-[2.5rem] sm:w-[3rem] sm:h-[3rem] rounded-sm flex items-center justify-center p-2 ${cellData.isLarge && 'flex-1'} text-opacity-85`}
							style={{ backgroundColor: cellData.bgColor, color: cellData.color }}>
							<p className="text-opacity-100 leading-4 text-sm">{cellData.text}</p>
						</div>
					)}
				</TooltipTrigger>
				<TooltipContent className={`${ignoreTabIndex ? '!hidden' : ''}`} style={{ backgroundColor: cellData.bgColor, color: cellData.color }}>
					<p>{tooltip}</p>
				</TooltipContent>
			</Tooltip>
		</TooltipProvider>
	);
}
