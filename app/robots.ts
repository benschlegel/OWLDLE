import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
	return {
		rules: {
			userAgent: '*',
			allow: '/',
			disallow: '/teams/',
		},
		sitemap: 'https://owls1le.bschlegel.com/sitemap.xml',
	};
}
