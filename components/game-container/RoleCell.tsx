import DamageIcon from '@/data/roles/Damage';
import FlexIcon from '@/data/roles/Flex';
import SupportIcon from '@/data/roles/Support';
import TankIcon from '@/data/roles/Tank';
import { cn } from '@/lib/utils';
import type { Player, SubRole } from '@/types/players';

interface Props extends React.HTMLAttributes<HTMLDivElement> {
	role?: Player['role'];
	subRole?: SubRole;
}

export default function RoleCell({ role, subRole, className }: Props) {
	if (!role) return null;

	const isFlexVariant = subRole === 'FlexSupport' || subRole === 'FlexDPS';

	if (isFlexVariant) {
		const BaseIcon = subRole === 'FlexSupport' ? SupportIcon : DamageIcon;
		return (
			<div className={cn('p-2 flex justify-center items-center relative', className)}>
				<BaseIcon className="fill-white opacity-85 h-full w-full" />
				<FlexIcon className="fill-[#3c3c44] drop-shadow-lg h-[45%] w-[45%] absolute top-0.5 right-0.5" />
			</div>
		);
	}

	const mappedImages = { Damage: DamageIcon, Tank: TankIcon, Support: SupportIcon };
	const RoleIcon = mappedImages[role];
	return (
		<div className={cn('p-2 flex justify-center items-center', className)}>
			<RoleIcon className="fill-white opacity-90 h-full w-full" />
		</div>
	);
}
