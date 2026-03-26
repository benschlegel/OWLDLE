/// <reference no-default-lib="true" />
/// <reference lib="esnext" />
/// <reference lib="webworker" />
import { defaultCache } from '@serwist/turbopack/worker';
import type { PrecacheEntry, SerwistGlobalConfig } from 'serwist';
import { Serwist, StaleWhileRevalidate, ExpirationPlugin } from 'serwist';

declare global {
	interface WorkerGlobalScope extends SerwistGlobalConfig {
		__SW_MANIFEST: (PrecacheEntry | string)[] | undefined;
	}
}

declare const self: ServiceWorkerGlobalScope;

const serwist = new Serwist({
	precacheEntries: self.__SW_MANIFEST,
	skipWaiting: true,
	clientsClaim: true,
	navigationPreload: true,
	runtimeCaching: [
		// Cache AVIF images (not included in defaultCache)
		{
			matcher: /\.avif$/i,
			handler: new StaleWhileRevalidate({
				cacheName: 'static-avif-assets',
				plugins: [new ExpirationPlugin({ maxEntries: 256, maxAgeSeconds: 30 * 24 * 60 * 60, maxAgeFrom: 'last-used' })],
			}),
		},
		...defaultCache,
	],
	fallbacks: {
		entries: [
			{
				url: '/~offline',
				matcher({ request }) {
					return request.destination === 'document';
				},
			},
		],
	},
});

serwist.addEventListeners();
