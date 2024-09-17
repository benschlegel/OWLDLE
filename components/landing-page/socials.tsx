import { Button } from '@/components/ui/button';

export default function Socials() {
	return (
		<div className="flex justify-center items-center opacity-60 mb-[0.1rem]">
			<div className="text-sm font-medium leading-none">
				Made with ❤️ by{' '}
				<Button variant="link" className="p-0">
					<code className="relative rounded bg-muted px-[0.3rem] py-[0.2rem] text-sm font-semibold" style={{ fontFamily: 'var(--font-geist-mono)' }}>
						@scorer5
					</code>
				</Button>
			</div>
		</div>
	);
}
