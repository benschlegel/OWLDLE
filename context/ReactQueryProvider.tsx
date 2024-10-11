'use client';

import { type Persister, PersistQueryClientProvider } from '@tanstack/react-query-persist-client';
import { createSyncStoragePersister } from '@tanstack/query-sync-storage-persister';
import { QueryClient } from '@tanstack/react-query';
import { useState, useEffect } from 'react';

const ReactQueryProvider = ({ children }: { children: React.ReactNode }) => {
	// Create QueryClient with default options
	const [queryClient] = useState(
		() =>
			new QueryClient({
				defaultOptions: {
					queries: {
						gcTime: 1000 * 60 * 60 * 24, // 24 hours
					},
				},
			})
	);

	// Use state for the persister
	const [persister, setPersister] = useState<Persister | null>(null);

	// Only create the persister on the client (after first render)
	useEffect(() => {
		// Ensure we are in the browser
		if (typeof window !== 'undefined') {
			const storagePersister = createSyncStoragePersister({
				storage: window.localStorage,
			});
			setPersister(storagePersister);
		}
	}, []); // Runs once after the first render

	// Render only when the persister is available
	if (!persister) return null;

	return (
		<PersistQueryClientProvider persistOptions={{ persister }} client={queryClient}>
			{children}
		</PersistQueryClientProvider>
	);
};

export default ReactQueryProvider;
