'use client';
import { Kbd } from '@/components/ui/kbd';
import { cn, isMacDevice } from '@/lib/utils';

type Props = {
	hotkey: string;
	usesControl?: boolean;
	className?: string;
};
export default function HotkeyBadge({ hotkey, usesControl = true, className }: Props) {
	return <Kbd className={cn('font-mono sm:flex hidden opacity-95', className)}>{usesControl ? convertPlattformKey(hotkey) : hotkey}</Kbd>;
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
