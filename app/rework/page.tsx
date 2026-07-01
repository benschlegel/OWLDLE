import { ArrowDown, ArrowDownIcon, ChevronDownIcon, MoveDownIcon, MoveUpIcon } from 'lucide-react';
import GameCell from '@/components/game-container/GameCell';
import GuessRow from '@/components/game-container/GuessRow';
import RoleCell from '@/components/game-container/RoleCell';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import DamageIcon from '@/data/roles/Damage';
import FlexIcon from '@/data/roles/Flex';
import SupportIcon from '@/data/roles/Support';

export default function Rework() {
	return (
		<div className="justify-center flex flex-col gap-4">
			<Card className="p-2 gap-2 flex flex-col">
				<GuessRow data={undefined} isDismissing={false} dismissDelay={0} />
				<div className="flex gap-2">
					<GameCell cellState="incorrect">
						<NewRoleCell />
					</GameCell>
					<GameCell cellState="partial">
						<SupportFlexCell />
					</GameCell>
					<GameCell cellState="incorrect">
						<SupportFlexCell />
					</GameCell>
					<GameCell cellState="correct">
						<SupportFlexCell />
					</GameCell>
					<GameCell cellState="correct">
						<DamageFlexCell />
					</GameCell>
					<GameCell cellState="incorrect">
						{/** biome-ignore lint/a11y/useValidAriaRole: <explanation> */}
						<RoleCell role="Support" />
					</GameCell>
				</div>
			</Card>
			{/* Age cell */}
			<Card className="p-2 gap-2 flex flex-row">
				<GameCell className="flex flex-row gap-1 justify-center items-center" cellState="partial">
					<span className="font-owl text-3xl">19</span>
					<MoveDownIcon viewBox="6 0 12 24" width={12} className="-mr-1 text-[#3c3c44]" strokeWidth={2.75} />
				</GameCell>
				<GameCell className="flex flex-row gap-1 justify-center items-center" cellState="partial">
					<span className="font-owl text-3xl">19</span>
					<MoveUpIcon viewBox="6 0 12 24" width={12} className="-mr-1 text-[#3c3c44]" strokeWidth={2.75} />
				</GameCell>
				<GameCell className="flex flex-row gap-1 justify-center items-center" cellState="correct">
					<span className="font-owl text-4xl">19</span>
				</GameCell>
				<GameCell className="flex flex-row justify-center items-center" cellState="partial">
					<span className="font-owl text-xl">19</span>
					<ArrowDownIcon />
				</GameCell>
				<GameCell className="flex flex-col gap-0 justify-center items-center" cellState="partial">
					<span className="font-owl text-3xl">19</span>
					<ChevronDownIcon />
				</GameCell>
				<GameCell className="flex flex-row justify-center items-center relative" cellState="partial">
					<span className="font-owl text-4xl z-20">19</span>
					<ArrowDown className="absolute top-1/2 left-1/2 size-16 -translate-x-1/2 -translate-y-1/2 opacity-80 text-[#3c3c44]" strokeWidth={3.5} />
				</GameCell>
			</Card>

			<Card className="p-2 gap-2 flex flex-row">
				<GameCell cellState="incorrect" isLarge>
					<div className="rounded-md h-full flex justify-center sm:px-4 px-2 items-center">
						<p className={`text-white opacity-90 font-extrabold text-center tracking-tight 'text-xl' md:text-2xl font-owl`}>FunnyAstro</p>
					</div>
				</GameCell>
				<GameCell className="flex flex-row gap-1 justify-center items-center" cellState="partial">
					<span className="font-owl text-3xl">19</span>
					<MoveDownIcon viewBox="6 0 12 24" width={12} className="-mr-1 text-[#3c3c44]" strokeWidth={2.75} />
				</GameCell>
				<GameCell />
				<GameCell />
				<GameCell />
				<GameCell />
			</Card>
			<Card className="p-2 gap-2 flex flex-col w-sm">
				<div className="w-full flex flex-row gap-2">
					<GameCell />
					<GameCell isLarge className="font-owl">
						Player Name
					</GameCell>
					<GameCell />
				</div>
				<div className="w-full flex flex-row gap-2">
					<GameCell />
					<GameCell />
					<GameCell />
					<GameCell />
				</div>
			</Card>
			<Card className="p-2 gap-2 flex flex-col w-sm">
				<div className="w-full flex flex-row gap-2">
					<GameCell />
					<GameCell isLarge className="font-owl">
						Player Name
					</GameCell>
					<GameCell />
				</div>
				<div className="w-full flex flex-row gap-2 justify-center">
					<GameCell />
					<GameCell />
					<GameCell />
					<GameCell />
				</div>
			</Card>
			<Card className="p-2 gap-2 flex flex-col w-sm">
				<NewRowTest />
				<Separator className="my-1" />
				<NewRowTest />
				<Separator className="my-1" />
				<NewRowTest />
				<Separator className="my-1" />
				<NewRowTest />
				<Separator className="my-1" />
				<NewRowTest />
				<Separator className="my-1" />
				<NewRowTest />
				<Separator className="my-1" />
				<NewRowTest />
				<Separator className="my-1" />
			</Card>
			{/* <Card className="p-2 gap-2 flex flex-col mt-4 w-2xl">
				<div className="flex w-full gap-2">
					<GameCell isLarge />
					<GameCell />
					<GameCell />
					<GameCell />
					<GameCell />
					<GameCell />
					<GameCell />
				</div>
			</Card> */}
		</div>
	);
}

function NewRoleCell() {
	return (
		<div className={'p-0.5 flex justify-center items-center relative'}>
			{/* Apply same styling to all icons */}
			<FlexIcon className="fill-white opacity-85 h-full w-full " />
			<SupportIcon
				className="fill-primary-foreground drop-shadow-lg h-[55%] w-[55%] absolute top-1/2 left-1/2
    -translate-x-1/2 -translate-y-1/2"
			/>
		</div>
	);
}
function SupportFlexCell() {
	return (
		<div className={'p-2 flex justify-center items-center relative'}>
			<SupportIcon className="fill-white opacity-85 h-full w-full " />
			<FlexIcon className="fill-[#3c3c44] drop-shadow-lg h-[45%] w-[45%] absolute top-0.5 right-0.5" />
		</div>
	);
}
function DamageFlexCell() {
	return (
		<div className={'p-2 flex justify-center items-center relative'}>
			{/* Apply same styling to all icons */}
			<DamageIcon className="fill-white opacity-85 h-full w-full " />
			<FlexIcon className="fill-[#3c3c44] drop-shadow-lg h-[45%] w-[45%] absolute top-0.5 right-0.5" />
		</div>
	);
}

function NewRowTest() {
	return (
		<div className="flex flex-col gap-3">
			<div className="flex w-full gap-2">
				<GameCell isLarge>PlayerName</GameCell>
			</div>
			<div className="flex w-full gap-2 justify-center">
				<GameCell cellState="correct" className="size-[3.6rem]" />
				<GameCell cellState="partial" className="size-[3.6rem]" />
				<GameCell cellState="correct" className="size-[3.6rem]" />
				<GameCell cellState="incorrect" className="size-[3.6rem]" />
				<GameCell cellState="incorrect" className="size-[3.6rem]" />
				<GameCell cellState="incorrect" className="size-[3.6rem]" />
			</div>
		</div>
	);
}
