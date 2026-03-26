import type { MetadataRoute } from 'next';
import { DEFAULT_DESCRIPTION, DEFAULT_TITLE } from './layout';

export default function manifest(): MetadataRoute.Manifest {
	return {
		name: DEFAULT_TITLE,
		short_name: DEFAULT_TITLE,
		description: DEFAULT_DESCRIPTION,
		start_url: '/play',
		display: 'standalone',
		background_color: '#ffffff',
		theme_color: '#3c3c44',
		orientation: 'portrait',
		icons: [
			{
				src: '/icons/pwa-favicon.svg',
				sizes: 'any',
				type: 'image/svg+xml',
				purpose: 'any',
			},
			{
				src: '/icons/pwa-favicon.svg',
				sizes: 'any',
				type: 'image/svg+xml',
				purpose: 'maskable',
			},
			{
				src: '/icons/pwa-favicon_512x512.png',
				sizes: '512x512',
				type: 'image/png',
				purpose: 'any',
			},
			{
				src: '/icons/pwa-favicon_512x512.png',
				sizes: '512x512',
				type: 'image/png',
				purpose: 'maskable',
			},
			{
				src: '/icons/pwa-favicon_192x192.png',
				sizes: '192x192',
				type: 'image/png',
			},
		],
	};
}
