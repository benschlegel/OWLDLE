import type { PlayerFull } from '@/types/players';

export const dynamic = 'force-static';

// TODO: zod validation

/**
 * Verifies a guess
 * @param req a valid player id
 * @returns what fields are correct and what fields are incorrect
 */
export async function POST(req: Request) {
	const player = (await req.json()) as PlayerFull;

	return Response.json({ hello: 'world', player });
}
