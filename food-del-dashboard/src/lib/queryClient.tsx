import { QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import { queryClient } from './query-client-config';

/**
 * React Query Providerコンポーネント
 */
export const QueryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
	return (
		<QueryClientProvider client={queryClient}>
			{children}
		</QueryClientProvider>
	);
};
