import { getCurrentAnswer } from '@/lib/databaseAccess';
import { validateGuess } from '@/lib/server';
import type { DbAnswer } from '@/types/database';
import { type Player, playerSchema } from '@/types/players';
import type { ValidateResponse } from '@/types/server';
import type { NextRequest } from 'next/server';
import { RateLimiterMemory } from 'rate-limiter-flexible';

export const dynamicParams = true;

let currentAnswer: DbAnswer;

// Configure rate limiter
const postLimiter = new RateLimiterMemory({
	points: 5, // Number of requests
	duration: 60, // Per 60 seconds
});

const getLimiter = new RateLimiterMemory({
	points: 2, // Number of requests
	duration: 1, // Per second
});

/**
 * Verifies a guess
 * @param req a valid player id
 * @returns what fields are correct and what fields are incorrect
 */
export async function POST(req: NextRequest) {
	try {
		await postLimiter.consume(req.ip ?? 'anonymous');

		// Try to parse request
		const parsedBody = await req.json();
		const playerRes = playerSchema.safeParse(parsedBody);

		// Error handling
		if (!playerRes.success) {
			const errMessage = playerRes.error.errors.map((err) => `${err.path}: ${err.message},`);
			return new Response(`Invalid input. Errors: {\n${errMessage.join('\n')}\n}`, { status: 400 });
		}

		// Raw data
		const player = playerRes.data as Player;
		const resResponse = validateGuess(player, currentAnswer.player);

		return Response.json(resResponse);
	} catch (error) {
		return new Response(JSON.stringify({ message: 'Too Many Requests' }), { status: 429 });
	}
}

/**
 * Get current answer
 * @returns ({nextReset: Date, correctPlayer: Player, iteration: number})
 */
export async function GET(req: NextRequest) {
	try {
		await getLimiter.consume(req.ip ?? 'anonymous');

		if (!currentAnswer || currentAnswer === undefined) {
			// fetch current data
			try {
				const answer = await getCurrentAnswer();
				// TODO: extract in function (passes response)
				if (answer) {
					currentAnswer = answer;
				} else {
					throw new Error('Could not get answer from database');
				}
			} catch (e) {
				return new Response('Failed to set get initial answer', { status: 500, statusText: 'Unauthorized' });
			}
		}

		if (new Date() >= currentAnswer.nextReset) {
			// fetch updated data
			try {
				const answer = await getCurrentAnswer();
				if (answer) {
					currentAnswer = answer;
				} else {
					throw new Error('Could not get answer from database');
				}
			} catch (e) {
				return new Response('Failed to set get initial answer', { status: 500, statusText: 'Unauthorized' });
			}
		}

		const res: ValidateResponse = { nextReset: currentAnswer.nextReset, correctPlayer: currentAnswer.player, iteration: 1 };
		return Response.json(res);
	} catch (error) {
		return new Response(JSON.stringify({ message: 'Too Many Requests' }), { status: 429 });
	}
}

export async function PATCH(req: NextRequest) {
	// Return forbidden if token was not passed (route should not be publicly accessible)
	if (req.headers.get('Authorization') !== `Bearer ${process.env.ADMIN_API_TOKEN}`) {
		return new Response('Unauthorized', { status: 401, statusText: 'Unauthorized' });
	}
	return new Response('Success');
}
