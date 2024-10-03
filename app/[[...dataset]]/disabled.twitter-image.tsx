import { type Dataset, DATASETS } from '@/data/datasets';
import { ImageResponse } from 'next/og';
// App router includes @vercel/og.
// No need to install it.

export const runtime = 'edge';

export const alt = 'OWLDLE Logo';
export const size = {
	width: 1200,
	height: 630,
};
export const contentType = 'image/png';

interface SeasonPageProps {
	params: { dataset?: string[] };
}

export async function Image_disabled({ params }: SeasonPageProps) {
	const { dataset } = params;
	let formattedDataset = dataset ? dataset[0] : null;
	if (!DATASETS.includes(formattedDataset as Dataset) || formattedDataset === 'season1') {
		formattedDataset = null;
	}

	const seasonText = formattedDataset !== null ? ` (${formattedDataset.slice(0, -1)} ${formattedDataset.slice(-1)})` : '';
	const fontData = await fetch(new URL('../../fonts/OWLFontBold.woff', import.meta.url)).then((res) => res.arrayBuffer());
	return new ImageResponse(
		<div
			style={{
				height: '100%',
				// Full-size: 200
				fontSize: 200,
				color: '#f06216',
				background: '#1a1a1e',
				width: '100%',
				display: 'flex',
				flexDirection: 'column',
				alignItems: 'center',
				borderRadius: '10px',
				justifyContent: 'center',
			}}>
			<div style={{ display: 'flex', marginTop: -40 }}>
				<div style={{ display: 'flex' }}>OWL</div>
				<div style={{ display: 'flex', color: '#dfdfd6' }}>DLE</div>
			</div>
			{/* Default font size:  */}
			<div style={{ display: 'flex', fontSize: 36, marginTop: 20, color: '#dfdfd6' }}>Guess the overwatch league player{seasonText}</div>
		</div>,
		{
			...size,
			fonts: [
				{
					name: 'OWLFontBold',
					data: fontData,
					style: 'normal',
				},
			],
		}
	);
}
