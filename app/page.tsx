import Game from '@/components/landing-page/game';
import Header from '@/components/landing-page/header';
import { Toaster } from '@/components/ui/toaster';

export default function Home() {
	return (
		<div className="px-4 py-8 sm:px-8 w-full h-full flex justify-center items-center">
			<main className="w-[32rem]">
				<Header />
				<Game />
			</main>
			<Toaster />
		</div>
	);
}
