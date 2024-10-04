'use client';

import { parseAsBoolean, useQueryStates } from 'nuqs';

const dialogKeys = ['showHelp', 'showFeedback'] as const;
type DialogKey = (typeof dialogKeys)[number];

export function showDialog(dialog: DialogKey) {
	const dialogs = useQueryStates({
		showHelp: parseAsBoolean.withDefault(false),
		showFeedback: parseAsBoolean.withDefault(false),
	});

	const setters = dialogs[1];
	for (const dialogKey of dialogKeys) {
		if (dialogKey !== dialog) {
			setters({ [dialogKey]: null });
		} else {
			setTimeout(() => {
				setters({ [dialogKey]: true });
			}, 500);
		}
	}
}
