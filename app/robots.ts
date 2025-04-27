import { MetadataRoute } from 'next'
import { baseUrl } from './metadata'

export default function robots(): MetadataRoute.Robots {

  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [
        '/private/',
        '/admin/',
        '/api/',
      ],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  }
} 