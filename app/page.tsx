import Game from '@/components/landing-page/game';
import Header from '@/components/landing-page/header';
import { Toaster } from '@/components/ui/toaster';

export default function Home() {
	return (
		<div className="px-4 pt-8 sm:px-8 w-full h-full flex flex-col justify-center items-center">
			<main className="w-[32rem]">
				<div className="flex justify-center items-center opacity-60 mb-[0.1rem]">
					<p className="text-sm font-medium leading-none">
						Made @with ❤️ by{' '}
						<code className="relative rounded bg-muted px-[0.3rem] py-[0.2rem] text-sm font-semibold" style={{ fontFamily: 'var(--font-geist-mono)' }}>
							@scorer5
						</code>
					</p>
				</div>
				<Header />
				<Game />
			</main>
			<Toaster />
		</div>
	);
}
