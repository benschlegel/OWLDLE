import React from 'react';

export default function Page() {
	return (
		<div className="flex items-center justify-center w-full h-screen">
			<div className="flex items-center absolute top-90 justify-center h-[630px] w-[630px] mb-100 border-border">
				<div className="flex flex-col justify-center items-center gap-4 scale-30">
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
