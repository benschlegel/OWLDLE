'use client';

import { parseAsStringLiteral, useQueryState } from 'nuqs';

const KEY_NAME = 'dialog';

const dialogs = ['none', 'help', 'feedback'] as const;
export type DialogKey = (typeof dialogs)[number];
export const DEFAULT_DIALOG_VALUE = 'none' satisfies DialogKey;

export function useDialogParams() {
	return useQueryState(KEY_NAME, parseAsStringLiteral(dialogs).withDefault(DEFAULT_DIALOG_VALUE).withOptions({ history: 'push', clearOnDefault: true }));
}
