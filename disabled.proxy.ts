import { OWL_PATHNAME, OWCS_PATHNAME } from '@/data/datasets';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export const LAST_GAME_COOKIE = 'last-game';
export const ALLOWED_PATHS: readonly string[] = [OWL_PATHNAME, OWCS_PATHNAME];

// export function proxy(request: NextRequest) {
// 	const raw = request.cookies.get(LAST_GAME_COOKIE)?.value;

// 	if (raw) {
// 		try {
// 			const destination = new URL(raw, request.url);
// 			if (ALLOWED_PATHS.includes(destination.pathname)) {
// 				return NextResponse.redirect(destination);
// 			}
// 		} catch {
// 			// fall through to default (e.g. if cookie data is invalid)
// 		}
// 	}

// 	// default redirect
// 	return NextResponse.redirect(new URL(OWCS_PATHNAME, request.url));
// }

// export const config = {
// 	matcher: ['/'],
// };
