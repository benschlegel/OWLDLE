import { RateLimiterMemory } from 'rate-limiter-flexible';
import type { NextRequest } from 'next/server';
import { addFeedback } from '@/lib/databaseAccess';
import type { DbFeedback } from '@/types/database';
import { feedbackSchema } from '@/types/server';

const rateLimiter = new RateLimiterMemory({
	points: 4, // Number of requests
	duration: 60, // Per 60 second
});

export async function POST(request: NextRequest) {
	// Apply rate limiter
	try {
		await rateLimiter.consume(request.ip ?? 'anonymous');

		// Try to parse request
		const parsedBody = await request.json();
		const parsedFeedback = feedbackSchema.safeParse(parsedBody);

		// Error handling
		if (!parsedFeedback.success) {
			const errMessage = parsedFeedback.error.errors.map((err) => `${err.path}: ${err.message},`);
			return new Response(`Invalid input. Errors: {\n${errMessage.join('\n')}\n}`, { status: 400 });
		}

		try {
			// Try to log game, return with success code if so
			const timestamp = new Date();
			const feedback: DbFeedback = { ...parsedFeedback.data, timestamp: timestamp };
			const res = await addFeedback(feedback);
			if (res?.acknowledged) {
				return new Response(undefined, { status: 200 });
			}
		} catch (e) {
			return new Response(JSON.stringify({ message: "Couldn't add feedback." }), { status: 500 });
		}

		return new Response(JSON.stringify({ message: "Couldn't add feedback." }), { status: 500 });
	} catch (error) {
		return new Response(JSON.stringify({ message: 'Too Many Requests' }), { status: 429 });
	}
}
