import { ImageResponse } from 'next/og';
// App router includes @vercel/og.
// No need to install it.

export const runtime = 'edge';

export async function GET() {
	const fontData = await fetch(new URL('/public/assets/OWLFontBold.woff', import.meta.url)).then((res) => res.arrayBuffer());
	return new ImageResponse(
		<div
			style={{
				fontSize: 140,
				color: '#f06216',
				background: '#1a1a1e',
				width: '100%',
				height: '100%',
				padding: '50px 200px',
				textAlign: 'center',
				justifyContent: 'center',
				fontFamily: 'OWLFontBold',
				alignItems: 'center',
			}}>
			OWLDLE
		</div>,
		{
			width: 1200,
			height: 630,
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
