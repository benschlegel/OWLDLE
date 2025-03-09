import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
	return {
		name: 'OWLDLE - OWCS Edition',
		short_name: 'OWLDLE',
		description: 'Guess the correct Overwatch Champion Series player within 8 tries to win.',
		start_url: '/owcs',
		display: 'standalone',
		background_color: '#1a1a1e',
		theme_color: '#f06216',
		icons: [
			{
				src: '/icons/owldle-pwa-192x192.png',
				sizes: '192x192',
				type: 'image/png',
			},
			{
				src: '/icons/owldle-pwa-384x384.png',
				sizes: '384x384',
				type: 'image/png',
			},
			{
				src: '/icons/owldle-pwa--512x512.png',
				sizes: '512x512',
				type: 'image/png',
			},
		],
	};
}
