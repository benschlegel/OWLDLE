interface Props extends React.HTMLAttributes<HTMLOrSVGElement> {
	width?: number;
	height?: number;
}

export default function DamageIcon({ className, width = 32, height = 32 }: Props) {
	return (
		<svg width={width} className={className} height={height} viewBox="0 0 60.325 60.325" xmlns="http://www.w3.org/2000/svg">
			<title>Damage</title>
			<path d="m36.451 58.73v-9.6006h-12.577v9.6006zm0-12.997v-34.224c0-5.2977-5.0459-9.8967-6.2886-9.8967s-6.2886 4.599-6.2886 9.8967v34.224zm18.777 12.997v-9.6006h-12.577v9.6006zm0-12.997v-34.224c0-5.2977-5.0459-9.8967-6.2886-9.8967s-6.2886 4.599-6.2886 9.8967v34.224zm-37.553 12.997v-9.6006h-12.577v9.6006zm0-12.997v-34.224c0-5.2977-5.0459-9.8967-6.2886-9.8967s-6.2886 4.599-6.2886 9.8967v34.224z" />
		</svg>
	);
}
