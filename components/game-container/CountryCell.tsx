import Image from 'next/image';

type Props = {
	imgSrc?: string;
};

export default function CountryCell({ imgSrc }: Props) {
	if (!imgSrc) return <></>;

	return (
		<div className="rounded-md flex justify-center items-center m-1 aspect-square">
			<Image src={imgSrc} alt={'Square country flag'} width={64} height={64} className="p-[0.35rem] h-auto w-auto max-h-full max-w-full" />
		</div>
	);
}
