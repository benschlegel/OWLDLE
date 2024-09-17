import { GET as RouteGet } from '@/app/api/validate/route';
import { deleteAllPlayers, insertPlayer } from '@/lib/databaseAccess';
import { trimDate } from '@/lib/utils';
import type { NextRequest } from 'next/server';
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
	// Return forbidden if token was not passed (route should not be publicly accessible)
	const currDate = new Date();
	let isProd = false;
	if (process.env.NODE_ENV !== 'production') {
		isProd = true;
	}

	const trimmedDate = trimDate(currDate, isProd);
	// await deleteAllPlayers();

	return new Response(JSON.stringify({ currDate: trimmedDate }));
}
