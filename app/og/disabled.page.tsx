import React from 'react';

// Check file saves for settings for each abdge
export default function Page() {
	return (
		<div className="flex items-center justify-center w-full h-screen">
			<div className="flex items-center absolute top-90 justify-center h-[630px] w-[1200px] mb-100 border-border">
				<div className="flex flex-col relative justify-center items-center gap-3 scale-140">
					<div className="absolute -right-40 -top-25 rotate-45 -mt-2 bg-[#ca9ee6]/40 py-1 px-20.5 scale-115">
						<span className="text-lg font-owl text-[#ca9ee6] -mr-7.5">Statistics</span>
					</div>
					{/* <span className="font-owl text-foreground/80 -my-3 text-3xl">Season 6 (2023)</span> */}
					<h1 className="text-9xl font-bold text-center w-full font-owl">
						<span className="text-primary-foreground">OWL</span>
						<span className="text-foreground">DLE</span>
					</h1>
					<span className="text-foreground text-4xl font-owl">Guess the overwatch pro player</span>
				</div>
			</div>
		</div>
	);
}
