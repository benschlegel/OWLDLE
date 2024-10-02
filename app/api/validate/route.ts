import { type Dataset, DATASETS, datasetSchema } from '@/data/datasets';
import { getCurrentAnswer } from '@/lib/databaseAccess';
import type { DbAnswer } from '@/types/database';
import type { ValidateResponse } from '@/types/server';
import type { NextRequest } from 'next/server';
import { RateLimiterMemory } from 'rate-limiter-flexible';

export const dynamicParams = true;

type DatasetAnswer = { dataset: Dataset; answer?: DbAnswer };

// TODO: every time reset date resets, add a few seconds of padding to ensure server has time to reset
const currentAnswers: DatasetAnswer[] = [];
for (const dataset of DATASETS) {
	currentAnswers.push({ dataset });
}

// Configure rate limiter
const postLimiter = new RateLimiterMemory({
	points: 5, // Number of requests
	duration: 60, // Per 60 seconds
});

const getLimiter = new RateLimiterMemory({
	points: 100, // Number of requests
	duration: 1, // Per second
});

/**
 * Get current answer
 * @returns ({nextReset: Date, correctPlayer: Player, iteration: number})
 */
export async function GET(req: NextRequest) {
	try {
		await getLimiter.consume(req.ip ?? 'anonymous');
		const searchParams = req.nextUrl.searchParams;
		const dataset = searchParams.get('dataset') ?? 'season1';
		// Get query parameter
		const datasetParsed = datasetSchema.safeParse(dataset);

		// Error handling
		if (!datasetParsed.success) {
			const errMessage = datasetParsed.error.errors.map((err) => `${err.path}: ${err.message},`);
			return new Response(`Invalid input. Errors: {\n${errMessage.join('\n')}\n}`, { status: 400 });
		}
		const currentAnswer = getLocalCurrentAnswer(datasetParsed.data);

		if (!currentAnswer || currentAnswer === undefined) {
			// fetch current data
			console.log('Writing to cache...');
			const res = await updateLocalAnswer(datasetParsed.data);
			if (res) {
				// Update failed, return error response
				return res;
			}
		}
		const validatedCurrAnswer = getLocalCurrentAnswer(datasetParsed.data);
		// Will always be valid, answers were initialized + dataset was validated
		if (!validatedCurrAnswer) {
			return;
		}

		if (new Date() >= validatedCurrAnswer.nextReset) {
			// fetch updated data
			const res = await updateLocalAnswer(datasetParsed.data);
			if (res) {
				// Update failed, return error response
				return res;
			}
		}

		const res: ValidateResponse = {
			nextReset: validatedCurrAnswer.nextReset,
			correctPlayer: validatedCurrAnswer.player,
			iteration: validatedCurrAnswer.iteration,
		};
		return Response.json(res);
	} catch (error) {
		return new Response(JSON.stringify({ message: `Too Many Requests: ${error}` }), { status: 429 });
	}
}

export async function PATCH(req: NextRequest) {
	// Return forbidden if token was not passed (route should not be publicly accessible)
	if (req.headers.get('Authorization') !== `Bearer ${process.env.ADMIN_API_TOKEN}`) {
		return new Response('Unauthorized', { status: 401, statusText: 'Unauthorized' });
	}

	const searchParams = req.nextUrl.searchParams;
	const dataset = searchParams.get('dataset') ?? 'season1';
	// Get query parameter
	const datasetParsed = datasetSchema.safeParse(dataset);

	// Error handling
	if (!datasetParsed.success) {
		const errMessage = datasetParsed.error.errors.map((err) => `${err.path}: ${err.message},`);
		return new Response(`Invalid dataset. Errors: {\n${errMessage.join('\n')}\n}`, { status: 400 });
	}

	// TODO: use dataset query parameter
	const res = await updateLocalAnswer(datasetParsed.data);
	if (!res) {
		// Unintuitive, but this is the happy path (function only returns error response)
		return new Response(JSON.stringify(getLocalCurrentAnswer(datasetParsed.data)), { status: 200 });
	}
	return res;
}

// TODO: throw error instead of response
async function updateLocalAnswer(dataset: Dataset) {
	try {
		const answer = await getCurrentAnswer(dataset);
		if (answer) {
			const answerIndex = currentAnswers.findIndex((a) => a.dataset === dataset);
			if (answerIndex !== -1) {
				currentAnswers[answerIndex].answer = answer;
			} else {
				throw new Error('Could not find dataset');
			}
		} else {
			throw new Error('Could not get answer from database');
		}
	} catch (e) {
		return new Response('Failed to override local answer or failed to get answer from database.', { status: 500 });
	}
}

/**
 * Verifies a guess
 * @param req a valid player id
 * @returns what fields are correct and what fields are incorrect
 */
export async function POST(req: NextRequest) {
	// TODO: temporarily disabled, rework using player id/name as input
	// try {
	// 	await postLimiter.consume(req.ip ?? 'anonymous');
	// 	// Try to parse request
	// 	const parsedBody = await req.json();
	// 	const season1Schema = playerSchema('season1');
	// 	const playerRes = season1Schema.safeParse(parsedBody);
	// 	// Error handling
	// 	if (!playerRes.success) {
	// 		const errMessage = playerRes.error.errors.map((err) => `${err.path}: ${err.message},`);
	// 		return new Response(`Invalid input. Errors: {\n${errMessage.join('\n')}\n}`, { status: 400 });
	// 	}
	// 	// Raw data
	// 	const player = playerRes.data as Player;
	// 	const resResponse = validateGuess(player, currentAnswer.player);
	// 	return Response.json(resResponse);
	// } catch (error) {
	// 	return new Response(JSON.stringify({ message: 'Too Many Requests' }), { status: 429 });
	// }
}

function getLocalCurrentAnswer(dataset: Dataset) {
	return currentAnswers.find((a) => a.dataset === dataset)?.answer;
}
