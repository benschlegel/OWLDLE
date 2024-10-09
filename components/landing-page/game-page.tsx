import Game from '@/components/landing-page/game';
import React from 'react';

type Props = {
	slug: string;
};

export default function GamePage({ slug }: Props) {
	return <Game slug={slug} />;
}
