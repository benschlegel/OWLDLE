import Game from '@/components/landing-page/game';
import Header from '@/components/landing-page/header';
import Socials from '@/components/landing-page/socials';
import { Toaster } from '@/components/ui/toaster';

type Props = {
	slug: string;
};

export default function GamePage({ slug }: Props) {
	return (
		<>
			<div className="px-2 pt-8 sm:px-4 lg:px-8 w-full h-full flex justify-center items-center">
				<main className="w-[32rem]">
					<Socials />
					<Header slug={slug} />
					<Game slug={slug} />
				</main>
			</div>
			<Toaster />
		</>
	);
}
