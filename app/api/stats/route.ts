import type { NextRequest } from 'next/server';
import { getCurrentIteration, getGameStats } from '@/lib/databaseAccess';
import { datasetSchema } from '@/data/datasets';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
	const searchParams = request.nextUrl.searchParams;
	const dataset = searchParams.get('dataset') ?? 'season1';

	const datasetParsed = datasetSchema.safeParse(dataset);
	if (!datasetParsed.success) {
		return new Response('Invalid dataset', { status: 400 });
	}

	try {
		const iteration = await getCurrentIteration(datasetParsed.data);
		if (!iteration) {
			return Response.json({ stats: null });
		}

		const stats = await getGameStats(datasetParsed.data, iteration);
		if (!stats) {
			return Response.json({ stats: null });
		}

		const { _id, ...rest } = stats;
		return Response.json({ stats: rest });
	} catch (e) {
		return new Response(JSON.stringify({ message: "Couldn't fetch stats." }), { status: 500 });
	}
}
