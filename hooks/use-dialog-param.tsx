'use client';

import { parseAsStringLiteral, useQueryState } from 'nuqs';

const KEY_NAME = 'dialog';

const dialogs = ['none', 'help', 'feedback'] as const;
export type DialogKey = (typeof dialogs)[number];
export const DEFAULT_DIALOG_VALUE = 'none' satisfies DialogKey;

export function useDialogParams() {
	return useQueryState(KEY_NAME, parseAsStringLiteral(dialogs).withDefault(DEFAULT_DIALOG_VALUE).withOptions({ history: 'push', clearOnDefault: true }));
}

/**
 * Wrapper to use query params for dialog state (e.g. converts ?dialog=help to getter/setter boolean functions for easier use with dialogs)
 * @param dialogKey What dialog this state should be used for
 * @returns an object containing "open" (wether the selected dialogKey is currently open) and "setOpen" to control wether that dialog is currently opened.
 */
export function useDialogState(dialogKey: DialogKey) {
	// Get query param state
	const [dialog, setDialog] = useDialogParams();

	// Derive boolean setter/getter from dialog string literal state
	const setOpen = (value: boolean) => {
		if (value === true) {
			setDialog(dialogKey);
		} else {
			setDialog(DEFAULT_DIALOG_VALUE);
		}
	};
	const open = dialog === dialogKey;

	return { open, setOpen } as const;
}
