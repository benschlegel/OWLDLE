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
