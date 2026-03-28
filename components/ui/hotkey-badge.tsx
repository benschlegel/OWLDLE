'use client';
import { CommandItem, CommandShortcut } from '@/components/ui/command';
import { Kbd } from '@/components/ui/kbd';
import { isMacDevice } from '@/lib/utils';

type Props = {
	hotkey: string;
	usesControl?: boolean;
};
export default function HotkeyBadge({ hotkey, usesControl = true }: Props) {
	return <Kbd className="font-mono sm:flex hidden opacity-95">{usesControl ? convertPlattformKey(hotkey) : hotkey}</Kbd>;
}

/**
 * Adds prefix to hotkey
 * @param key what key to convert
 * @returns converted hotkey, e.g. "k" to "⌘K" on mac and "ctrl+k" on windows
 */
export function convertPlattformKey(key: string) {
	const isMac = isMacDevice();
	return isMac ? `⌘${key.toUpperCase()}` : `ctrl+${key.toLowerCase()}`;
}
