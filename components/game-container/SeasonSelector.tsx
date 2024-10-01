'use client';
import { Button } from '@/components/ui/button';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuRadioGroup,
	DropdownMenuRadioItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Dataset, FORMATTED_DATASETS } from '@/data/datasets';
import { useRouter } from 'next/navigation';
import { useCallback } from 'react';

type Props = {
	slug: string;
};
export default function SeasonSelector({ slug }: Props) {
	const parsedSlug = slug === '/' ? 'season1' : slug;
	const router = useRouter();
	const shorthand = FORMATTED_DATASETS.find((dataset) => dataset.dataset === parsedSlug);

	const handleChange = useCallback(
		(value: string) => {
			if (value === 'season1') {
				router.replace('/');
			} else {
				router.replace(`/${value}`);
			}
		},
		[router.replace]
	);
	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button variant="ghost" size="icon" className="p-0" aria-label="Help">
					<p className="text-2xl font-mono tracking-wide">{shorthand?.shorthand ?? 'S1'}</p>
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent className="px-1">
				<DropdownMenuLabel>Select season</DropdownMenuLabel>
				<DropdownMenuSeparator />
				<DropdownMenuRadioGroup value={parsedSlug} onValueChange={handleChange}>
					{FORMATTED_DATASETS.map((dataset) => (
						<DropdownMenuRadioItem value={dataset.dataset} key={dataset.dataset}>
							{dataset.formattedName}
						</DropdownMenuRadioItem>
					))}
					<DropdownMenuItem disabled>More coming soon...</DropdownMenuItem>
				</DropdownMenuRadioGroup>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
