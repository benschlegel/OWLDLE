'use client';

type Props = {
	shorthand: string;
};

export default function SeasonTitleBase({ shorthand }: Props) {
	const seasonNumber = shorthand.slice(1);
	return <>Season {seasonNumber}</>;
}
