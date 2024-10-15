'use client';
import { useSeasonParams } from '@/hooks/use-season-params';
import PlausibleProvider from 'next-plausible';

export default function PlausibleWrapper() {
	const [season, _setSeason] = useSeasonParams();

	return (
		<PlausibleProvider
			domain="www.owldle.com"
			pageviewProps={{
				season: season,
			}}
			customDomain="https://plausible.global.bschlegel.com"
			selfHosted={true}
			trackOutboundLinks
		/>
	);
}
