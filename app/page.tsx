import Game from '@/components/landing-page/game';
import Header from '@/components/landing-page/header';
import Socials from '@/components/landing-page/socials';
import { Toaster } from '@/components/ui/toaster';

export default function Home() {
	return (
		<div className="px-4 pt-8 sm:px-8 w-full h-full flex justify-center items-center">
			<main className="w-[32rem]">
				<div className="overflow-y-auto flex-1">
					<Socials />
					<Header />
					<Game />
				</div>
			</main>
			<Toaster />
		</div>
	);
}
