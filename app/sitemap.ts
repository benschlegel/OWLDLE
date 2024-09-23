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
		// {
		// 	url: 'https://acme.com/help',
		// 	lastModified: new Date(),
		// 	changeFrequency: 'monthly',
		// 	priority: 0.8,
		// },
	];
}
