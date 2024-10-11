'use client';

import dynamic from 'next/dynamic';
import { type Persister, PersistQueryClientProvider } from '@tanstack/react-query-persist-client';
import { createSyncStoragePersister } from '@tanstack/query-sync-storage-persister';
import { QueryClient } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

const createPersister = (): Persister => {
	return createSyncStoragePersister({
		storage: window.localStorage,
	});
};

const queryClient = new QueryClient({
	defaultOptions: {
		queries: {
			gcTime: 1000 * 60 * 60 * 24, // 24 hours
		},
	},
});

function ReactQueryProviderComponent({ children }: { children: React.ReactNode }) {
	const persister = createPersister();

	return (
		<PersistQueryClientProvider persistOptions={{ persister }} client={queryClient}>
			{children}
			<ReactQueryDevtools initialIsOpen={false} />
		</PersistQueryClientProvider>
	);
}

const ReactQueryProvider = dynamic(() => Promise.resolve(ReactQueryProviderComponent), {
	ssr: false,
});

export default ReactQueryProvider;
