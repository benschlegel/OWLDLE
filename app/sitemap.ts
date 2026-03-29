import { datasetInfo } from '@/data/datasets';
import type { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
	const lastModified = new Date();
	lastModified.setDate(lastModified.getDate() - 1);
	lastModified.setHours(2, 0, 0, 0);

	const baseUrl = 'https://www.owldle.com';

	const staticRoutes: MetadataRoute.Sitemap = [
		{
			url: `${baseUrl}/`,
			lastModified,
			changeFrequency: 'daily',
			priority: 1,
		},
		{
			url: `${baseUrl}/owcs?season=s3`,
			lastModified,
			changeFrequency: 'daily',
			priority: 0.98,
		},
		{
			url: `${baseUrl}/owl?season=6`,
			lastModified,
			changeFrequency: 'daily',
			priority: 0.95,
		},
		{
			url: `${baseUrl}/endless`,
			lastModified,
			changeFrequency: 'weekly',
			priority: 0.9,
		},
		{
			url: `${baseUrl}/statistics`,
			lastModified,
			changeFrequency: 'weekly',
			priority: 0.8,
		},
	];

	const datasetRoutes: MetadataRoute.Sitemap = datasetInfo.map((d) => ({
		url: `${baseUrl}/${d.href}`,
		lastModified,
		changeFrequency: 'daily',
		priority: d.league === 'owcs' ? 0.9 : 0.85,
	}));

	return [...staticRoutes, ...datasetRoutes];
}
