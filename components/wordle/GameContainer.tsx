import { Card, CardContent } from '@/components/ui/card';

export default function GameContainer() {
	return (
		<Card>
			<CardContent className="flex gap-2 px-4 py-2">
				<div className="h-8 w-8 bg-accent" />
				<div className="grid items-center gap-3">abc</div>
			</CardContent>
		</Card>
	);
}
