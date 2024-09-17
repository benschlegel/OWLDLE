import { GET as RouteGet } from '@/app/api/validate/route';
import type { NextRequest } from 'next/server';
export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
	// Return forbidden if token was not passed (route should not be publicly accessible)
	if (request.headers.get('Authorization') !== `Bearer ${process.env.CRON_SECRET}`) {
		return new Response('Unauthorized', { status: 401, statusText: 'Unauthorized' });
	}

	// TODO: Do db stuff
	const reset = (await (await RouteGet({ ip: 'fake.ip.abc.de' } as unknown as NextRequest)).json()) as Date;
	return new Response(`Next reset: ${JSON.stringify(reset)}`);
}
