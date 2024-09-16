import { addDays, validateGuess } from '@/lib/server';
import { type Player, playerSchema } from '@/types/players';
import type { ValidateResponse } from '@/types/server';
import type { NextRequest } from 'next/server';

// export const dynamic = 'force-static';
export const dynamicParams = true;

// TODO: reset current round if server curr player resets
const DEFAULT_PLAYER: Player = { country: 'RU', team: 'BostonUprising', role: 'Damage', name: 'Mistakes', isEastern: true, id: 0 };
const DEFAULT_DATE = new Date('2024-09-15T11:40:00.000+02:00');

let currPlayer: Player = DEFAULT_PLAYER;
let nextReset: Date = DEFAULT_DATE;

// How many days per "round" of the game (e.g. 1 means the game resets once per day, 2 every two days, etc)
const DAY_INCREMENT = 1;

/**
 * Verifies a guess
 * @param req a valid player id
 * @returns what fields are correct and what fields are incorrect
 */
export async function POST(req: NextRequest) {
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
	const resResponse = validateGuess(player, currPlayer);

	return Response.json(resResponse);
}

export function GET(request: NextRequest | undefined) {
	const searchParams = request?.nextUrl.searchParams;
	const getPlayer = searchParams?.get('getplayer');

	if (new Date() >= nextReset) {
		// fetch from backend
		nextReset = addDays(nextReset, DAY_INCREMENT);
		// get new player from backend
		currPlayer = DEFAULT_PLAYER;
		// add day
		// set back to backend
	}

	const res: ValidateResponse = { nextReset: nextReset };
	if (getPlayer !== null) {
		res.correctPlayer = currPlayer.name;
	}

	return Response.json(res);
}
