import { Separator } from '@/components/ui/separator';

export default function Footer() {
	return (
		<>
			<Separator />
			<div className="px-10 py-4 flex justify-between items-center">
				<h1
					className="sm:text-4xl text-3xl font-bold text-center sm:ml-[-1rem]"
					style={{
						fontFamily: 'var(--font-owl-bold), ui-sans-serif, system-ui, sans-serif, Apple Color Emoji, Segoe UI Emoji, Segoe UI Symbol, Noto Color Emoji',
					}}>
					<span className="text-primary-foreground">OWL</span>
					DLE
				</h1>
				<p className="scroll-m-20 text-lg tracking-normal opacity-80 font-mono">www.owldle.com</p>
			</div>
		</>
	);
}
