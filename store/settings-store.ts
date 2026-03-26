import { create } from 'zustand';
import { persist, subscribeWithSelector } from 'zustand/middleware';

type SettingsStore = {
	isBackgroundEnabled: boolean;
	setIsBackgroundEnabled: (newState: boolean) => void;
	isDevAnswerVisible: boolean;
	setIsDevAnswerVisible: (newState: boolean) => void;
};

export const DEFAULT_IS_BACKGROUND_ENABLED = true;

export const SETTINGS_STORE_KEY = 'settings';

export const useSettings = create<SettingsStore>()(
	persist(
		subscribeWithSelector((set, _get) => ({
			isBackgroundEnabled: DEFAULT_IS_BACKGROUND_ENABLED,
			setIsBackgroundEnabled: (newState) => set({ isBackgroundEnabled: newState }),
			isDevAnswerVisible: false,
			setIsDevAnswerVisible: (newState) => set({ isDevAnswerVisible: newState }),
		})),
		{
			name: SETTINGS_STORE_KEY,
		}
	)
);
