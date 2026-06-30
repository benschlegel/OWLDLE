import GameCell from '@/components/game-container/GameCell';
import GuessRow from '@/components/game-container/GuessRow';
import RoleCell from '@/components/game-container/RoleCell';
import { Card } from '@/components/ui/card';
import DamageIcon from '@/data/roles/Damage';
import FlexIcon from '@/data/roles/Flex';
import SupportIcon from '@/data/roles/Support';

export default function Rework() {
	return (
		<div className="justify-center flex flex-col">
			<Card className="p-2 gap-2 flex flex-col">
				<GuessRow data={undefined} isDismissing={false} dismissDelay={0} />
				<GuessRow data={undefined} isDismissing={false} dismissDelay={0} />
				<div className="flex gap-2">
					<GameCell isCorrect={false}>
						<NewRoleCell />
					</GameCell>
					<GameCell isCorrect={false} className="bg-[#fe640b]">
						<SupportFlexCell />
					</GameCell>
					<GameCell isCorrect={false}>
						<SupportFlexCell />
					</GameCell>
					<GameCell isCorrect={true}>
						<SupportFlexCell />
					</GameCell>
					<GameCell isCorrect={true}>
						<DamageFlexCell />
					</GameCell>
					<GameCell isCorrect={false}>
						{/** biome-ignore lint/a11y/useValidAriaRole: <explanation> */}
						<RoleCell role="Support" />
					</GameCell>
				</div>
			</Card>
			<Card className="p-2 gap-2 flex flex-col mt-4 w-sm">
				<div className="flex w-full gap-2">
					<GameCell />
					<GameCell isLarge />
					<GameCell />
				</div>
				<div className="flex w-full gap-2">
					<GameCell />
					<GameCell />
					<GameCell />
					<GameCell />
				</div>
			</Card>
			<Card className="p-2 gap-2 flex flex-col mt-4 w-2xl">
				<div className="flex w-full gap-2">
					<GameCell isLarge />
					<GameCell />
					<GameCell />
					<GameCell />
					<GameCell />
					<GameCell />
					<GameCell />
				</div>
			</Card>
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
