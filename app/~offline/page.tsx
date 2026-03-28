export default function OfflinePage() {
	return (
		<div className="flex min-h-screen items-center justify-center bg-background">
			<div className="text-center px-6">
				<div className="text-6xl mb-6">📡</div>
				<h1 className="text-2xl font-bold text-foreground mb-2">You&apos;re offline</h1>
				<p className="text-muted-foreground max-w-sm">Check your internet connection and try again. Some features may still be available offline.</p>
			</div>
		</div>
	);
}
