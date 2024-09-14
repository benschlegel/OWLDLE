import { validateGuess } from '@/lib/server';
import { type Player, playerSchema } from '@/types/players';

export const dynamic = 'force-static';

// TODO: reset current round if server curr player resets
const CURR_PLAYER: Player = { country: 'US', team: 'DallasFuel', role: 'Damage', name: 'Seagull', isEastern: true, id: 9 };

/**
 * Verifies a guess
 * @param req a valid player id
 * @returns what fields are correct and what fields are incorrect
 */
export async function POST(req: Request) {
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
	const resResponse = validateGuess(player, CURR_PLAYER);

	return Response.json(resResponse);
}
