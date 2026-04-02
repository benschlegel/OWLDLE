import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
	return {
		rules: {
			userAgent: '*',
			allow: ['/', '/owl', '/owcs', '/endless', '/statistics', '/open-graph'],
			disallow: ['/teams/', '/regions/', '/api/'],
		},
		sitemap: 'https://www.owldle.com/sitemap.xml',
	};
}
