import type { CountryCode } from '@/types/countries';

/**
 * Relaxed roster type for superseded stages that are retained but not wired into
 * the typed dataset pipeline. `team` is a plain string (not a per-dataset
 * `TeamName` union) so archived rosters survive future team-list changes without
 * breaking typecheck. Promote an entry to a real `Player<...>[]` only when/if the
 * old stage becomes a displayable dataset.
 */
export type ArchivedPlayer = {
	name: string;
	country: CountryCode;
	role: 'Damage' | 'Tank' | 'Support';
	team: string;
	isFlex?: boolean;
};

/**
 * Frozen rosters of stages that have been superseded in the repo. Keyed by the
 * `<dataset>-stage<N>` archive name. Empty for now, the
 * first entry is added the first time a stage is superseded. Kept so a future
 * feature can promote an old stage to a displayable dataset.
 */
export const ARCHIVED_STAGE_ROSTERS: Record<string, readonly ArchivedPlayer[]> = {};
