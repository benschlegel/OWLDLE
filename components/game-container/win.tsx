type Props = {
	nextReset: Date;
};

export default function WinScreen({ nextReset }: Partial<Props>) {
	return (
		<div className="flex p-8 mt-4">
			<p>{nextReset?.toString()}</p>
		</div>
	);
}
