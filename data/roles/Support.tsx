interface Props extends React.HTMLAttributes<HTMLOrSVGElement> {
	width?: number;
	height?: number;
}

export default function SupportIcon({ className, width = 32, height = 32 }: Props) {
	return (
		<svg width={width} className={className} height={height} viewBox="0 0 60.325 60.325" xmlns="http://www.w3.org/2000/svg">
			<title>Support</title>
			<path d="m40.777 54.38c0 1.8962-1.6187 4.3473-3.6536 4.3473h-13.922c-2.0349 0-3.6536-2.4511-3.6536-4.3473v-13.597h-13.597c-1.8962 0-4.3473-1.6187-4.3473-3.6536v-13.922c0-2.0349 2.4511-3.6536 4.3473-3.6536h13.597v-13.597c0-1.8962 1.6187-4.3473 3.6536-4.3473h13.922c2.0349 0 3.6536 2.4511 3.6536 4.3473v13.597h13.597c1.8962 0 4.3473 1.6187 4.3473 3.6536v13.922c0 2.0349-2.4511 3.6536-4.3473 3.6536h-13.597z" />
		</svg>
	);
}
