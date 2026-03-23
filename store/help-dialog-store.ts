import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type HelpDialogStore = {
	tutorialOpen: boolean;
	setTutorialOpen: (open: boolean) => void;
};

export const useHelpDialogStore = create<HelpDialogStore>()(
	persist(
		(set) => ({
			tutorialOpen: true,
			setTutorialOpen: (open) => set({ tutorialOpen: open }),
		}),
		{ name: 'owldle-help-tutorial' }
	)
);
