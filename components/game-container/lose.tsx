type Props = {
	nextReset: Date;
	correctPlayer: string;
};

export default function LossScreen({ correctPlayer, nextReset }: Partial<Props>) {
	return (
		<div className="flex p-8 mt-4">
			<p>{correctPlayer}</p>
		</div>
	);
}
