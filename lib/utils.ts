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
export function trimDate(date: Date, isProd = false) {
	if (!isProd) {
		date.setHours(date.getHours() + 2);
	}
	date.setMinutes(0);
	date.setSeconds(0);
	date.setMilliseconds(0);
	return new Date(date);
}
