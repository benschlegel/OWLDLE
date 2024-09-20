import { ImageResponse } from 'next/og';
// App router includes @vercel/og.
// No need to install it.

export const runtime = 'edge';

export async function GET() {
	const fontData = await fetch(new URL('../../fonts/OWLFontBold.woff', import.meta.url)).then((res) => res.arrayBuffer());
	return new ImageResponse(
		<div
			style={{
				height: '100%',
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
			<div style={{ display: 'flex', fontSize: 38, marginTop: 20, color: '#dfdfd6' }}>Guess the overwatch league player (season 1)</div>
		</div>,
		{
			width: 1200,
			height: 400,
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
