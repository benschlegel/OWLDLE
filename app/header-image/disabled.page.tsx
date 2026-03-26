import { Button } from '@/components/ui/button';

export default function Page() {
	return (
		<div className="w-full h-[500px] border-b-2 border-border flex items-center justify-center">
			{/* <span className="text-7xl font-owl text-primary-foreground -mt-68">Play Now!</span> */}
			<div className="border-border border-2 size-[350px] -mt-20 bg-background flex items-center justify-center">
				{/* <div className="drop-shadow-lg">
					<div
						className="origin-top w-full bg-background px-1.5 scale-[100%] shadow-sm"
						style={{
							clipPath: 'polygon(6% 0%, 94% 0%, 100% 18%, 88% 100%, 12% 100%, 0% 18%)',
						}}>
						<Button
							variant={'ghost'}
							className="px-10 group relative flex h-full items-center justify-center gap-2 bg-secondary/90 font-bold text-lg tracking-wide hover:bg-secondary/60 transition-colors px-11 "
							style={{
								clipPath: 'polygon(6% 0%, 94% 0%, 100% 18%, 88% 100%, 12% 100%, 0% 18%)',
							}}>
							<h1 className="text-9xl font-bold text-center w-full font-owl flex flex-col">
								<span className="text-primary-foreground">OWL</span>
								<span className="text-foreground">DLE</span>
							</h1>
						</Button>
					</div> */}
				<div className="border-border scale-95">
					<h1 className="text-9xl font-bold text-center w-full font-owl flex flex-col p-4 leading-[0.9]">
						<span className="text-primary-foreground">OWL</span>
						<span className="text-foreground">DLE</span>
					</h1>
				</div>
			</div>
		</div>
	);
}
