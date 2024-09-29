'use client';
import { type DatasetMetadata, DEFAULT_DATASET } from '@/data/datasets';
import { createContext, type Dispatch, type SetStateAction, useState, type PropsWithChildren } from 'react';

type DataseContextType = [DatasetMetadata, Dispatch<SetStateAction<DatasetMetadata>>];

export const DatasetContext = createContext<DataseContextType>([DEFAULT_DATASET, () => {}] as unknown as DataseContextType);

export default function DatasetContexttProvider({ children }: PropsWithChildren) {
	const dataset = useState<DatasetMetadata>(DEFAULT_DATASET);
	return <DatasetContext.Provider value={dataset}>{children}</DatasetContext.Provider>;
}
