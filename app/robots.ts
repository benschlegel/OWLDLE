import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
	return {
		rules: {
			userAgent: '*',
			allow: '/',
			disallow: '/teams/',
		},
		sitemap: 'https://owldle.bschlegel.com/sitemap.xml',
	};
}
