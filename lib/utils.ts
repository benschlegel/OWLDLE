import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

/**
 * Trims a date to only contain year, day and hour information
 * @param date the date to trim
 * @returns new date with trimmed data
 */
export function trimDate(date: Date) {
	date.setMinutes(0);
	date.setSeconds(0);
	date.setMilliseconds(0);
	return new Date(date);
}

/**
 * Trims a date to only contain year, day and hour information
 * @param date the date to trim
 * @returns new date with trimmed and added data
 */
export function trimAndAddHours(date: Date, hours: number) {
	date.setMinutes(0);
	date.setSeconds(0);
	date.setMilliseconds(0);
	date.setHours(date.getHours() + hours);
	return new Date(date);
}

export function isMacDevice() {
	return typeof window !== 'undefined' ? navigator.platform.toUpperCase().indexOf('MAC') >= 0 : false;
}

/**
 * Computes a player's current integer age from an ISO "YYYY-MM-DD" birth date.
 * Recomputed at read time so the displayed age rolls over on the player's birthday.
 * Returns undefined for an unparseable input.
 */
export function getAgeFromDate(dateBorn: string): number | undefined {
	const parts = dateBorn.split('-').map(Number);
	if (parts.length !== 3 || parts.some((n) => Number.isNaN(n))) return undefined;
	const [year, month, day] = parts;
	const now = new Date();
	let age = now.getFullYear() - year;
	const monthNow = now.getMonth() + 1;
	const hasHadBirthday = monthNow > month || (monthNow === month && now.getDate() >= day);
	if (!hasHadBirthday) age -= 1;
	return age;
}
