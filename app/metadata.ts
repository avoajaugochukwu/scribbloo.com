import { Metadata } from "next";

export const baseUrl = 'https://scribbloo.com';

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: {
    template: '%s | Scribbloo',
    default: 'Scribbloo - Fun Coloring Pages for Kids & Adults',
  },
  description: 'Free printable coloring pages for kids and adults — animals, unicorns, mandalas, and more. Download, print, and color. New pages added every week.',
  alternates: {
    canonical: baseUrl,
    languages: {
      'en-US': baseUrl,
      'x-default': baseUrl
    },
  },
  openGraph: {
    title: "Scribbloo - Fun Coloring Pages for Kids & Adults",
    description: "Free printable coloring pages for kids and adults — animals, unicorns, mandalas, and more. Download, print, and color. New pages added every week.",
    url: "https://scribbloo.com",
    siteName: "Scribbloo",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Scribbloo - Fun Coloring Pages for Kids & Adults",
    description: "Free printable coloring pages for kids and adults — animals, unicorns, mandalas, and more. Download, print, and color. New pages added every week.",
    images: ["/og-image.png"],
  },
  robots: {
    index: true, // Allow indexing
    follow: true, // Allow following links
  },
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png",
    shortcut: "/favicon.ico",
  }
};

export const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'Scribbloo',
  description: 'Free printable coloring pages for kids and adults — animals, unicorns, mandalas, and more. Download, print, and color. New pages added every week.',
  url: baseUrl,
  potentialAction: {
    '@type': 'SearchAction',
    target: {
      '@type': 'EntryPoint',
      urlTemplate: `${baseUrl}/search?q={search_term_string}`,
    },
    'query-input': 'required name=search_term_string',
  },
  publisher: {
    '@type': 'Organization',
    name: 'Scribbloo',
    logo: {
      '@type': 'ImageObject',
      url: `${baseUrl}/logo.png`
    }
  }
};