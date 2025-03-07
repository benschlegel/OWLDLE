import LinkButtonMuted from '@/components/link-button-muted';

export default function FooterText() {
	return (
		<div className="p-2 mt-4 px-2 opacity-60 w-full flex items-center justify-center">
			<p className="text-sm text-muted-foreground text-center">
				If you enjoy this and want to contribute to server costs or support me, you can help by{' '}
				<LinkButtonMuted href={'https://ko-fi.com/scorer5'}>donating</LinkButtonMuted>
			</p>
		</div>
	);
}
