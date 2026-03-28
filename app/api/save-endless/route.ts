import type { NextRequest } from 'next/server';
import { logEndlessSession } from '@/lib/databaseAccess';
import { endlessSaveValidator } from '@/types/database';
import { datasetSchema } from '@/data/datasets';
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
	const parsedBody = await request.json();
	const saveRes = endlessSaveValidator.safeParse(parsedBody);

	if (!saveRes.success) {
		const errMessage = saveRes.error.errors.map((err) => `${err.path}: ${err.message},`);
		return new Response(`Invalid input. Errors: {\n${errMessage.join('\n')}\n}`, { status: 400 });
	}

	const searchParams = request.nextUrl.searchParams;
	const dataset = searchParams.get('dataset') ?? 'season1';
	const datasetParsed = datasetSchema.safeParse(dataset);

	if (!datasetParsed.success) {
		const errMessage = datasetParsed.error.errors.map((err) => `${err.path}: ${err.message},`);
		return new Response(`Invalid dataset. Errors: {\n${errMessage.join('\n')}\n}`, { status: 400 });
	}

	try {
		const res = await logEndlessSession(datasetParsed.data, saveRes.data.streakLength, saveRes.data.games);
		if (res.acknowledged) {
			return new Response(undefined, { status: 200 });
		}
	} catch (e) {
		return new Response(JSON.stringify({ message: "Couldn't save endless session." }), { status: 500 });
	}

	return new Response(JSON.stringify({ message: "Couldn't save endless session." }), { status: 500 });
}
