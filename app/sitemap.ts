import type { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
	const yesterday = new Date();
	yesterday.setDate(yesterday.getDate() - 1);
	yesterday.setHours(2);
	yesterday.setMinutes(0);
	yesterday.setSeconds(0);
	return [
		{
			url: 'https://www.owldle.com/',
			lastModified: yesterday,
			changeFrequency: 'daily',
			priority: 1,
		},
		{
			url: 'https://www.owldle.com/season2',
			lastModified: yesterday,
			changeFrequency: 'daily',
			priority: 1,
		},
		{
			url: 'https://www.owldle.com/season3',
			lastModified: yesterday,
			changeFrequency: 'daily',
			priority: 1,
		},
		{
			url: 'https://www.owldle.com/season4',
			lastModified: yesterday,
			changeFrequency: 'daily',
			priority: 1,
		},
		{
			url: 'https://www.owldle.com/season5',
			lastModified: yesterday,
			changeFrequency: 'daily',
			priority: 1,
		},
		{
			url: 'https://www.owldle.com/season6',
			lastModified: yesterday,
			changeFrequency: 'daily',
			priority: 1,
		},
		{
			url: 'https://www.owldle.com/?feedback=true',
			lastModified: yesterday,
			changeFrequency: 'daily',
			priority: 0.5,
		},
	];
}
