import { GET as RouteGet } from '@/app/api/validate/route';
import { GAME_CONFIG } from '@/lib/config';
import { goNextIteration } from '@/lib/databaseAccess';
import type { NextRequest } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
	// Return forbidden if token was not passed (route should not be publicly accessible)
	if (request.headers.get('Authorization') !== `Bearer ${process.env.CRON_SECRET}`) {
		return new Response('Unauthorized', { status: 401, statusText: 'Unauthorized' });
	}

	// Request authorized, safely run code starting here
	// *
	try {
		await goNextIteration(GAME_CONFIG.nextResetHours, 'season1', GAME_CONFIG.backlogMaxSize);
		const reset = (await (await RouteGet({ ip: 'fake.ip.abc.de' } as unknown as NextRequest)).json()) as Date;
		return new Response('Successfully set next iteration and re-fetched on server', { status: 200 });
	} catch (e) {
		return new Response('Failed to set next iteration', { status: 500, statusText: 'Unauthorized' });
	}
}
