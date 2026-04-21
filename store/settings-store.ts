import { create } from 'zustand';
import { persist, subscribeWithSelector } from 'zustand/middleware';

type SettingsStore = {
	isBackgroundEnabled: boolean;
	setIsBackgroundEnabled: (newState: boolean) => void;
	isDevAnswerVisible: boolean;
	setIsDevAnswerVisible: (newState: boolean) => void;
	areStatsVisible: boolean;
	setAreStatsVisible: (newState: boolean) => void;
	showConfetti: boolean;
	setShowConfetti: (newState: boolean) => void;
	areCreditsVisible: boolean;
	setAreCreditsVisible: (newState: boolean) => void;
	preferTeamsDialog: boolean;
	setPreferTeamsDialog: (newState: boolean) => void;
};

export const DEFAULT_IS_BACKGROUND_ENABLED = true;
export const DEFAULT_ARE_STATS_VISIBLE = true;
export const DEFAULT_SHOW_CONFETTI = true;
export const DEFAULT_ARE_CREDITS_VISIBLE = true;

export const SETTINGS_STORE_KEY = 'settings';

export const useSettings = create<SettingsStore>()(
	persist(
		subscribeWithSelector((set, _get) => ({
			isBackgroundEnabled: DEFAULT_IS_BACKGROUND_ENABLED,
			setIsBackgroundEnabled: (newState) => set({ isBackgroundEnabled: newState }),
			isDevAnswerVisible: false,
			setIsDevAnswerVisible: (newState) => set({ isDevAnswerVisible: newState }),
			areStatsVisible: DEFAULT_ARE_STATS_VISIBLE,
			setAreStatsVisible: (newState) => set({ areStatsVisible: newState }),
			showConfetti: DEFAULT_SHOW_CONFETTI,
			setShowConfetti: (newState) => set({ showConfetti: newState }),
			areCreditsVisible: DEFAULT_ARE_CREDITS_VISIBLE,
			setAreCreditsVisible: (newState) => set({ areCreditsVisible: newState }),
			preferTeamsDialog: false,
			setPreferTeamsDialog: (newState) => set({ preferTeamsDialog: newState }),
		})),
		{
			name: SETTINGS_STORE_KEY,
		}
	)
);
