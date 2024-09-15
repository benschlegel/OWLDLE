interface Props extends React.HTMLAttributes<HTMLOrSVGElement> {
	width?: number;
	height?: number;
}

export default function TankIcon({ className, width = 32, height = 32 }: Props) {
	return (
		<svg width={width} className={className} height={height} viewBox="0 0 60.325 60.325" xmlns="http://www.w3.org/2000/svg">
			<title>Tank</title>
			<path d="m5.4398 34.59v-24.069c0-3.8588 8.0447-8.9157 24.723-8.9157 16.678 0 24.723 5.0568 24.723 8.9157v24.069c0 5.821-19.817 24.133-24.723 24.133-4.9053 0-24.723-18.312-24.723-24.133z" />
		</svg>
	);
}
