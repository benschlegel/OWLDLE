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
			url: 'https://www.owldle.com/owcs',
			lastModified: yesterday,
			changeFrequency: 'daily',
			priority: 1,
		},
		{
			url: 'https://www.owldle.com/play',
			lastModified: yesterday,
			changeFrequency: 'daily',
			priority: 0.9,
		},
		{
			url: 'https://www.owldle.com/play?season=6',
			lastModified: yesterday,
			changeFrequency: 'daily',
			priority: 0.95,
		},
		{
			url: 'https://www.owldle.com/play?season=5',
			lastModified: yesterday,
			changeFrequency: 'daily',
			priority: 0.95,
		},
		{
			url: 'https://www.owldle.com/play?season=4',
			lastModified: yesterday,
			changeFrequency: 'daily',
			priority: 0.95,
		},
		{
			url: 'https://www.owldle.com/play?season=3',
			lastModified: yesterday,
			changeFrequency: 'daily',
			priority: 0.95,
		},
		{
			url: 'https://www.owldle.com/play?season=2',
			lastModified: yesterday,
			changeFrequency: 'daily',
			priority: 0.95,
		},
		{
			url: 'https://www.owldle.com/play?season=1',
			lastModified: yesterday,
			changeFrequency: 'daily',
			priority: 0.95,
		},
		{
			url: 'https://www.owldle.com/play?dialog=help',
			lastModified: yesterday,
			changeFrequency: 'daily',
			priority: 0.8,
		},
		{
			url: 'https://www.owldle.com/owcs?dialog=help',
			lastModified: yesterday,
			changeFrequency: 'daily',
			priority: 0.85,
		},
		{
			url: 'https://www.owldle.com/play?dialog=feedback',
			lastModified: yesterday,
			changeFrequency: 'daily',
			priority: 0.5,
		},
	];
}
