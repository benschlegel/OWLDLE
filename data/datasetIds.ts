export const DATASETS = ['season1', 'season2', 'season3', 'season4', 'season5', 'season6', 'owcs-s1', 'owcs-s2', 'owcs-s3'] as const;
export type Dataset = (typeof DATASETS)[number];
export type DatasetMode = 'owl' | 'owcs';
