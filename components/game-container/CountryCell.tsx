import Image from 'next/image';

type Props = {
	imgSrc?: string;
};

export default function CountryCell({ imgSrc }: Props) {
	if (!imgSrc) return <></>;

	return (
		<div className="rounded-md flex justify-center items-center m-[0.28rem] aspect-square">
			<Image
				src={imgSrc}
				alt={`Country logo`}
				unoptimized={false}
				quality={100}
				width={64}
				height={64}
				className="rounded-md h-auto w-auto max-h-full max-w-full"
			/>
		</div>
	);
}
