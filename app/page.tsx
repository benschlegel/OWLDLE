'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { OWCS_PATHNAME, OWL_PATHNAME } from '@/data/datasets';

export const LAST_GAME_COOKIE = 'last-game';
export const ALLOWED_PATHS: readonly string[] = [OWL_PATHNAME, OWCS_PATHNAME];
export default function Home() {
	const router = useRouter();

	useEffect(() => {
		const cookie = document.cookie.split('; ').find((row) => row.startsWith(`${LAST_GAME_COOKIE}=`));

		if (cookie) {
			const value = decodeURIComponent(cookie.split('=')[1]);
			router.replace(value);
		} else {
			router.replace(OWCS_PATHNAME);
		}
	}, [router]);

	return null;
}
