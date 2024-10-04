import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
	return {
		rules: {
			userAgent: '*',
			allow: ['/', '/open-graph', '/opengraph-image.png'],
			disallow: ['/teams/', '/regions/'],
		},
		sitemap: 'https://www.owldle.com/sitemap.xml',
	};
}
