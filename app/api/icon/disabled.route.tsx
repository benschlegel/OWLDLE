import { ImageResponse } from 'next/og';
// App router includes @vercel/og.
// No need to install it.

const correctColor = '#2dab5b';
const incorrectColor = '#df3d3d';
const emptyColor = '#e6e5e5';

const cubeSize = '52px';
export async function GET() {
	return new ImageResponse(
		// Maybe add white background back
		<div tw="flex flex-col w-full h-full items-center justify-center">
			{/* size-[98%] for almost fullscreen */}
			<div tw="flex w-full w-[400px] h-[400px]" style={{ backgroundColor: 'transparent' }}>
				<div
					tw="flex w-full rounded-sm p-[20px] flex-col"
					style={{
						borderRadius: '8px',
						backgroundColor: '#f7f7f8',
						boxShadow: '0 0px 20px 3px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
						borderWidth: '1px',
						borderColor: '#e5e5e5',
						gap: '10px',
					}}>
					<div tw="flex w-full flex-row" style={{ gap: '10px' }}>
						<div tw="flex rounded-sm bg-red-500 flex-1" style={{ backgroundColor: incorrectColor, width: cubeSize, height: cubeSize }}>
							{/* Placeholder */}
						</div>
						<div tw="flex rounded-sm" style={{ backgroundColor: incorrectColor, width: cubeSize, height: cubeSize }}>
							{/* Placeholder */}
						</div>
						<div tw="flex rounded-sm" style={{ backgroundColor: incorrectColor, width: cubeSize, height: cubeSize }}>
							{/* Placeholder */}
						</div>
						<div tw="flex rounded-sm" style={{ backgroundColor: correctColor, width: cubeSize, height: cubeSize }}>
							{/* Placeholder */}
						</div>
					</div>
					<div tw="flex w-full flex-row" style={{ gap: '10px' }}>
						<div tw="flex rounded-sm bg-red-500 flex-1" style={{ backgroundColor: incorrectColor, width: cubeSize, height: cubeSize }}>
							{/* Placeholder */}
						</div>
						<div tw="flex rounded-sm" style={{ backgroundColor: correctColor, width: cubeSize, height: cubeSize }}>
							{/* Placeholder */}
						</div>
						<div tw="flex rounded-sm" style={{ backgroundColor: incorrectColor, width: cubeSize, height: cubeSize }}>
							{/* Placeholder */}
						</div>
						<div tw="flex rounded-sm" style={{ backgroundColor: correctColor, width: cubeSize, height: cubeSize }}>
							{/* Placeholder */}
						</div>
					</div>
					<div tw="flex w-full flex-row" style={{ gap: '10px' }}>
						<div tw="flex rounded-sm bg-red-500 flex-1" style={{ backgroundColor: incorrectColor, width: cubeSize, height: cubeSize }}>
							{/* Placeholder */}
						</div>
						<div tw="flex rounded-sm" style={{ backgroundColor: correctColor, width: cubeSize, height: cubeSize }}>
							{/* Placeholder */}
						</div>
						<div tw="flex rounded-sm" style={{ backgroundColor: correctColor, width: cubeSize, height: cubeSize }}>
							{/* Placeholder */}
						</div>
						<div tw="flex rounded-sm" style={{ backgroundColor: correctColor, width: cubeSize, height: cubeSize }}>
							{/* Placeholder */}
						</div>
					</div>
					<div tw="flex w-full flex-row" style={{ gap: '10px' }}>
						<div tw="flex rounded-sm bg-red-500 flex-1" style={{ backgroundColor: correctColor, width: cubeSize, height: cubeSize }}>
							{/* Placeholder */}
						</div>
						<div tw="flex rounded-sm" style={{ backgroundColor: correctColor, width: cubeSize, height: cubeSize }}>
							{/* Placeholder */}
						</div>
						<div tw="flex rounded-sm" style={{ backgroundColor: correctColor, width: cubeSize, height: cubeSize }}>
							{/* Placeholder */}
						</div>
						<div tw="flex rounded-sm" style={{ backgroundColor: correctColor, width: cubeSize, height: cubeSize }}>
							{/* Placeholder */}
						</div>
					</div>
					<div tw="flex w-full flex-row" style={{ gap: '10px' }}>
						<div tw="flex rounded-sm bg-red-500 flex-1" style={{ backgroundColor: emptyColor, width: cubeSize, height: cubeSize }}>
							{/* Placeholder */}
						</div>
						<div tw="flex rounded-sm" style={{ backgroundColor: emptyColor, width: cubeSize, height: cubeSize }}>
							{/* Placeholder */}
						</div>
						<div tw="flex rounded-sm" style={{ backgroundColor: emptyColor, width: cubeSize, height: cubeSize }}>
							{/* Placeholder */}
						</div>
						<div tw="flex rounded-sm" style={{ backgroundColor: emptyColor, width: cubeSize, height: cubeSize }}>
							{/* Placeholder */}
						</div>
					</div>
					<div tw="flex w-full flex-row" style={{ gap: '10px' }}>
						<div tw="flex rounded-sm bg-red-500 flex-1" style={{ backgroundColor: emptyColor, width: cubeSize, height: cubeSize }}>
							{/* Placeholder */}
						</div>
						<div tw="flex rounded-sm" style={{ backgroundColor: emptyColor, width: cubeSize, height: cubeSize }}>
							{/* Placeholder */}
						</div>
						<div tw="flex rounded-sm" style={{ backgroundColor: emptyColor, width: cubeSize, height: cubeSize }}>
							{/* Placeholder */}
						</div>
						<div tw="flex rounded-sm" style={{ backgroundColor: emptyColor, width: cubeSize, height: cubeSize }}>
							{/* Placeholder */}
						</div>
					</div>
				</div>
				{/* <div tw="flex flex-col md:flex-row w-full py-12 px-4 md:items-center justify-between p-8" /> */}
			</div>
		</div>,
		{
			width: 512,
			height: 512,
			// debug: true,
		}
	);
}
