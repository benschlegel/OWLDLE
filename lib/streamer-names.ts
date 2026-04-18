export const STREAMER_MODE_NAMES = [
	'0nMyB1kE',
	'1ntiW4rrior',
	'1SHOT1KILL',
	'2Spicy4U',
	'4TH3N4',
	'7ricky7racer',
	'ACC3L3RANDO',
	'B4NSH33',
	'C4LYPSO',
	'Capt1v35un',
	'FACECLANK',
	'FloorPulser',
	'GoldDeaths',
	'IMissCoinToss',
	'ISurfYourPeak',
	'jvnkerqveen',
	'PLAY2WIN',
	'Sl1pstr3am',
	'Str1keC0mmander',
	'VishkarCorpo0947',
	'xXAnonymityDiffXx',
] as const;

// Deterministically pick a streamer mode name from a clientId.
export function pickStreamerName(clientId: string | null | undefined): string {
	if (!clientId) return STREAMER_MODE_NAMES[0];
	let hash = 0;
	for (let i = 0; i < clientId.length; i++) {
		hash = Math.imul(31, hash) + clientId.charCodeAt(i);
	}
	return STREAMER_MODE_NAMES[Math.abs(hash) % STREAMER_MODE_NAMES.length];
}
