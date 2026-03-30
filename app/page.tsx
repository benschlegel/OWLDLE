import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { OWCS_PATHNAME } from '@/data/datasets';
import type { Metadata } from 'next';
import { DEFAULT_DESCRIPTION, DEFAULT_TITLE, metadata as prevMetadata } from '@/app/layout';
import { ALLOWED_PATHS, LAST_GAME_COOKIE } from '@/lib/navigation';

export const metadata: Metadata = {
	...prevMetadata,
	title: DEFAULT_TITLE,
	description: DEFAULT_DESCRIPTION,
};

export default async function Home() {
	const cookieStore = await cookies();
	const raw = cookieStore.get(LAST_GAME_COOKIE)?.value;

	if (raw) {
		const decoded = decodeURIComponent(raw);
		const pathname = decoded.split('?')[0];
		if (ALLOWED_PATHS.includes(pathname)) {
			redirect(decoded);
		}
	}

	redirect(OWCS_PATHNAME);
}
