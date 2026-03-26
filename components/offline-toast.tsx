'use client';

import { useEffect, useRef } from 'react';
import { usePWA } from '@/components/pwa-provider';
import { useToast } from '@/hooks/use-toast';

export function OfflineToast() {
	const { isOnline } = usePWA();
	const { toast } = useToast();
	const wasOffline = useRef(false);

	useEffect(() => {
		if (!isOnline) {
			wasOffline.current = true;
			toast({
				title: 'You are offline',
				description: 'Some features may not be available until you reconnect.',
				variant: 'destructive',
			});
		} else if (wasOffline.current) {
			wasOffline.current = false;
			toast({
				title: 'Back online',
				description: 'Connection restored.',
			});
		}
	}, [isOnline, toast]);

	return null;
}
