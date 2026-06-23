import type { Dataset } from '@/data/datasets';
import { pickStreamerName } from '@/lib/streamer-names';
import { GAME_CONFIG } from '@/lib/config';
import type {
	DbLeaderboardEntry,
	DbLoggedEndlessSession,
} from '@/types/database';
import type { Filter, FilterOperators } from 'mongodb';
import { endlessLogCollection } from './client';

/**
 * Log an endless session to db (called when a streak ends via a loss).
 * When a clientId + name is provided and meets the leaderboard threshold,
 * this upserts (keeps only the best streak per clientId per dataset+filters).
 */
export async function logEndlessSession(
	dataset: Dataset,
	streakLength: number,
	games: DbLoggedEndlessSession['games'],
	filters?: DbLoggedEndlessSession['filters'],
	name?: string,
	clientId?: string,
	anonymous?: boolean
) {
	const resolvedName = name ?? (anonymous && clientId ? pickStreamerName(clientId) : undefined);
	const doc: Omit<DbLoggedEndlessSession, '_id'> = {
		dataset,
		streakLength,
		games,
		finishedAt: new Date(),
		...(filters !== undefined && { filters }),
		...(resolvedName !== undefined && { name: resolvedName }),
		...(clientId != null && { clientId }),
		...(anonymous && { anonymous: true }),
	};

	// If clientId is provided, keep only the best streak per clientId.
	// If a name is provided for a lower/equal streak, update the name on the existing entry.
	if (clientId) {
		const filter: Record<string, unknown> = { dataset, clientId };
		if (filters !== undefined) {
			filter['filters.region'] = filters.region;
			filter['filters.isPartnerOnly'] = filters.isPartnerOnly;
		} else {
			filter.filters = { $exists: false };
		}

		const existing = await endlessLogCollection.findOne(filter as any, { projection: { streakLength: 1 } });

		if (!existing) {
			// First submission for this clientId: insert new doc
			return endlessLogCollection.insertOne(doc as any);
		}

		if (streakLength > existing.streakLength) {
			// New streak is better: replace entire entry
			return endlessLogCollection.updateOne(filter as any, { $set: doc as any });
		}

		// Existing entry has equal or higher streak
		if (name) {
			// User is providing a name: apply it to their existing entry and clear anonymous flag
			return endlessLogCollection.updateOne(filter as any, { $set: { name }, $unset: { anonymous: '' } });
		}

		if (resolvedName) {
			// Anonymous submission: ensure the existing entry has the generated streamer name
			return endlessLogCollection.updateOne(filter as any, { $set: { name: resolvedName, anonymous: true } });
		}

		// No name and no clientId-based name: insert a plain log entry without clientId (for record-keeping only)
		return endlessLogCollection.insertOne({ ...doc, clientId: undefined, name: undefined } as any);
	}

	return endlessLogCollection.insertOne(doc as any);
}

/**
 * Get paginated leaderboard for a dataset (best streak per clientId, named entries only).
 * For owcs-s3, optionally filter by region bitmask and partnerOnly.
 */
export async function getLeaderboard(
	dataset: Dataset,
	page: number,
	limit: number,
	maxEntries: number,
	filters?: { region: number; isPartnerOnly: boolean }
): Promise<{ entries: DbLeaderboardEntry[]; total: number }> {
	const match: Record<string, any> = {
		dataset,
		streakLength: { $gte: GAME_CONFIG.minLeaderboardStreak },
		// Include named, anonymous (skip), and legacy entries
		$or: [{ name: { $exists: true }, clientId: { $exists: true, $ne: null } }, { anonymous: true, clientId: { $exists: true, $ne: null } }, { legacy: true }],
	};

	if (filters !== undefined) {
		match['filters.region'] = filters.region;
		match['filters.isPartnerOnly'] = filters.isPartnerOnly;
	}

	const pipeline = [
		{ $match: match },
		// Use clientId for dedup when available, otherwise fall back to _id (legacy entries)
		{ $addFields: { _groupKey: { $ifNull: ['$clientId', '$_id'] } } },
		// Best streak per identity
		{ $sort: { streakLength: -1 as const, finishedAt: 1 as const } },
		{
			$group: {
				_id: '$_groupKey',
				name: { $first: '$name' },
				streakLength: { $first: '$streakLength' },
				finishedAt: { $first: '$finishedAt' },
				clientId: { $first: '$clientId' },
				anonymous: { $first: '$anonymous' },
			},
		},
		{ $sort: { streakLength: -1 as const, finishedAt: 1 as const } },
		{ $limit: maxEntries },
	];

	// Run count + page in parallel
	const countPipeline = [...pipeline, { $count: 'total' }];
	const dataPipeline = [...pipeline, { $skip: (page - 1) * limit }, { $limit: limit }];

	const projection = { $project: { _id: 0, name: 1, streakLength: 1, finishedAt: 1, clientId: 1, anonymous: 1 } };
	const [countResult, entries] = await Promise.all([
		endlessLogCollection.aggregate(countPipeline).toArray(),
		endlessLogCollection.aggregate<DbLeaderboardEntry>([...dataPipeline, projection]).toArray(),
	]);

	const total = countResult[0]?.total ?? 0;
	return { entries, total };
}

/**
 * Find the rank (1-indexed) of a specific clientId on the leaderboard.
 * Returns null if the client has no leaderboard entry.
 */
export async function getLeaderboardRank(
	dataset: Dataset,
	clientId: string,
	maxEntries: number,
	filters?: { region: number; isPartnerOnly: boolean }
): Promise<number | null> {
	const match: Record<string, any> = {
		dataset,
		streakLength: { $gte: GAME_CONFIG.minLeaderboardStreak },
		$or: [{ name: { $exists: true }, clientId: { $exists: true, $ne: null } }, { legacy: true }],
	};

	if (filters !== undefined) {
		match['filters.region'] = filters.region;
		match['filters.isPartnerOnly'] = filters.isPartnerOnly;
	}

	const pipeline = [
		{ $match: match },
		{ $addFields: { _groupKey: { $ifNull: ['$clientId', '$_id'] } } },
		{ $sort: { streakLength: -1 as const, finishedAt: 1 as const } },
		{
			$group: {
				_id: '$_groupKey',
				name: { $first: '$name' },
				streakLength: { $first: '$streakLength' },
				finishedAt: { $first: '$finishedAt' },
				clientId: { $first: '$clientId' },
			},
		},
		{ $sort: { streakLength: -1 as const, finishedAt: 1 as const } },
		{ $limit: maxEntries },
		{ $group: { _id: null, entries: { $push: '$clientId' } } },
		{ $project: { _id: 0, rank: { $add: [{ $indexOfArray: ['$entries', clientId] }, 1] } } },
	];

	const result = await endlessLogCollection.aggregate<{ rank: number }>(pipeline).toArray();
	const rank = result[0]?.rank;
	return rank && rank > 0 ? rank : null;
}

/**
 * Update the display name on all leaderboard entries for a given clientId.
 */
export async function updateLeaderboardName(clientId: string, newName: string) {
	return endlessLogCollection.updateMany({ clientId } as any, { $set: { name: newName }, $unset: { anonymous: '' } });
}

/**
 * Backfill streamer-mode names onto anonymous entries that were saved before
 * name assignment was added to logEndlessSession. Processes in batches.
 */
export async function backfillAnonymousStreamerNames(dataset?: Dataset) {
	const match: Record<string, unknown> = { anonymous: true, clientId: { $exists: true }, name: { $exists: false } };
	if (dataset) match.dataset = dataset;

	const cursor = endlessLogCollection.find(match as Partial<DbLoggedEndlessSession>);
	let updated = 0;
	for await (const doc of cursor) {
		const streamerName = pickStreamerName(doc.clientId as string);
		await endlessLogCollection.updateOne({ _id: doc._id }, { $set: { name: streamerName } });
		updated++;
	}
	return updated;
}

/**
 * Convert legacy leaderboard entries (name='Anonymous', legacy=true) to the new anonymous format.
 * Since these entries have no clientId, uses the document _id as the name seed.
 */
export async function convertLegacyToAnonymousFormat(dataset?: Dataset) {
	const match: Record<string, unknown> = { legacy: true, name: 'Anonymous' };
	if (dataset) match.dataset = dataset;

	const cursor = endlessLogCollection.find(match as Partial<DbLoggedEndlessSession>);
	let updated = 0;
	for await (const doc of cursor) {
		const streamerName = pickStreamerName(doc._id.toString());
		await endlessLogCollection.updateOne({ _id: doc._id }, { $set: { name: streamerName, anonymous: true } });
		updated++;
	}
	return updated;
}

/**
 * Clear the `anonymous` flag from entries that have a user-provided name
 * (i.e. name exists and does NOT match the deterministic streamer name for that clientId).
 */
export async function clearStaleAnonymousFlags(dataset?: Dataset) {
	const match: Record<string, unknown> = { anonymous: true, clientId: { $exists: true, $ne: null }, name: { $exists: true } };
	if (dataset) match.dataset = dataset;

	const cursor = endlessLogCollection.find(match as Partial<DbLoggedEndlessSession>);
	let updated = 0;
	for await (const doc of cursor) {
		const streamerName = pickStreamerName(doc.clientId as string);
		if (doc.name !== streamerName) {
			await endlessLogCollection.updateOne({ _id: doc._id }, { $unset: { anonymous: '' } });
			updated++;
		}
	}
	return updated;
}

/**
 * Mark existing anonymous endless logs as legacy leaderboard entries.
 * Assigns a name and marks them with legacy: true so they appear on the leaderboard
 * without a clientId-based dedup (one entry per document).
 */
export async function markLegacyLeaderboardEntries(dataset: Dataset, minStreak: number, legacyName: string) {
	return endlessLogCollection.updateMany(
		{
			dataset,
			streakLength: { $gte: minStreak },
			clientId: { $exists: false },
			legacy: { $ne: true },
		} as any,
		{
			$set: { name: legacyName, legacy: true },
		} as any
	);
}

/**
 * Delete all endless_game_logs entries where clientId is explicitly null (polluting leaderboard)
 */
export async function deleteNullClientIdEntries(dataset?: Dataset): Promise<number> {
	// $type: 'null' matches only BSON null, not missing fields (avoids deleting legacy entries)
	const clientIdFilter: FilterOperators<string> = { $type: 'null' };
	const filter: Filter<DbLoggedEndlessSession> = { clientId: clientIdFilter, ...(dataset !== undefined && { dataset }) };
	const result = await endlessLogCollection.deleteMany(filter);
	return result.deletedCount;
}
