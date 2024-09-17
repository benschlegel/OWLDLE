import { ImageResponse } from 'next/og';
// App router includes @vercel/og.
// No need to install it.

export async function GET() {
	return new ImageResponse(
		<div
			style={{
				fontSize: 40,
				color: '#f06216',
				background: '#1a1a1e',
				width: '100%',
				height: '100%',
				padding: '50px 200px',
				textAlign: 'center',
				justifyContent: 'center',
				alignItems: 'center',
			}}>
			👋 Hello
		</div>,
		{
			width: 1200,
			height: 630,
		}
	);
}
