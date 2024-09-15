import type { Player } from '@/types/players';
import { cn } from '@/lib/utils';
import DamageIcon from '@/data/roles/Damage';
import TankIcon from '@/data/roles/Tank';
import SupportIcon from '@/data/roles/Support';

interface Props extends React.HTMLAttributes<HTMLDivElement> {
	role?: Player['role'];
}

export default function RoleCell({ role, className }: Props) {
	if (!role) return <></>;

	// Map role names (keys) to svgs (values) for image inputs
	const mappedImages = { Damage: DamageIcon, Tank: TankIcon, Support: SupportIcon };
	const RoleIcon = mappedImages[role];

	return (
		<div className={cn('p-2 flex justify-center items-center', className)}>
			{/* Apply same styling to all icons */}
			<RoleIcon className="text-purple-200 fill-foreground h-full w-full" />
		</div>
	);
}
