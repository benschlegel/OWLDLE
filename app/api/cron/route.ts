import { PATCH as RoutePatch } from '@/app/api/validate/route';
import { DATASETS } from '@/data/datasets';
import { GAME_CONFIG } from '@/lib/config';
import { goNextIteration } from '@/lib/databaseAccess';
import { NextURL } from 'next/dist/server/web/next-url';
import type { NextRequest } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const headers = new Headers({
	Authorization: `Bearer ${process.env.ADMIN_API_TOKEN}`,
	'Content-Type': 'application/json',
});

export async function GET(request: Request) {
	// Return forbidden if token was not passed (route should not be publicly accessible)
	if (request.headers.get('Authorization') !== `Bearer ${process.env.CRON_SECRET}`) {
		return new Response('Unauthorized', { status: 401, statusText: 'Unauthorized' });
	}

	// Request authorized, safely run code starting here
	// *
	try {
		for (const dataset of DATASETS) {
			await goNextIteration(GAME_CONFIG.nextResetHours, dataset, GAME_CONFIG.backlogMaxSize);
			await RoutePatch({
				method: 'PATCH',
				ip: 'fake.ip.abc.de',
				nextUrl: new NextURL(`https://www.owldle.com?dataset=${dataset}`),
				headers: headers,
			} as NextRequest);
		}
		return new Response('Successfully set next iteration and re-fetched on server', { status: 200 });
	} catch (e) {
		return new Response('Failed to set next iteration', { status: 500, statusText: 'Unauthorized' });
	}
}
