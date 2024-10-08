import Game from '@/components/landing-page/game';
import Header from '@/components/landing-page/header';
import Socials from '@/components/landing-page/socials';
import { Toaster } from '@/components/ui/toaster';
import React from 'react';

type Props = {
	slug: string;
};

const MemoizedHeader = React.memo(Header);
export default function GamePage({ slug }: Props) {
	return (
		<>
			<div className="px-2 pt-8 sm:px-4 lg:px-8 w-full h-full flex justify-center items-center">
				<main className="w-[32rem]">
					<Socials />
					<MemoizedHeader slug={slug} />
					<Game slug={slug} />
				</main>
			</div>
			<Toaster />
		</>
	);
}
