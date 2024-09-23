import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
	return {
		rules: {
			userAgent: '*',
			allow: '/',
			disallow: ['/teams/', '/regions/'],
		},
		sitemap: 'https://www.owldle.com/sitemap.xml',
	};
}
