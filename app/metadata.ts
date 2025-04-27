import { Metadata } from "next";

export const baseUrl = 'https://scribbloo.com';

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: {
    template: '%s | Scribbloo',
    default: 'Scribbloo - Fun Coloring Pages for Kids & Adults',
  },
  description: 'Scribbloo is a fun coloring pages website for kids and adults. It is a place where you can find a wide range of coloring pages for kids and adults. You can also create your own coloring pages and share them with your friends.',
  alternates: {
    canonical: baseUrl,
    languages: {
      'en-US': baseUrl,
      'x-default': baseUrl
    },
  },
  openGraph: {
    title: "Scribbloo - Fun Coloring Pages for Kids & Adults",
    description: "Scribbloo is a fun coloring pages website for kids and adults. It is a place where you can find a wide range of coloring pages for kids and adults. You can also create your own coloring pages and share them with your friends.",
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
    description: "Scribbloo is a fun coloring pages website for kids and adults. It is a place where you can find a wide range of coloring pages for kids and adults. You can also create your own coloring pages and share them with your friends.",
    images: ["/og-image.png"],
  },
  robots: {
    index: true, // Allow indexing
    follow: true, // Allow following links
  },
  verification: {
    google: "google-site-verification: 63EE4WX9NK",
  },
  icons: {
    icon: "favicon_io/favicon.ico",
    apple: "favicon_io/apple-touch-icon.png",
    other: {
      rel: "icon",
      url: "favicon_io/favicon.ico",
    },
    shortcut: "favicon_io/favicon.ico",
  }
};

export const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'Scribbloo',
  description: 'Scribbloo is a fun coloring pages website for kids and adults. It is a place where you can find a wide range of coloring pages for kids and adults. You can also create your own coloring pages and share them with your friends.',
  url: baseUrl,
  // potentialAction: {
  //   '@type': 'SearchAction',
  //   target: {
  //     '@type': 'EntryPoint',
  //     urlTemplate: `${baseUrl}/blog?q={search_term_string}`
  //   },
  //   'query-input': 'required name=search_term_string'
  // },
  publisher: {
    '@type': 'Organization',
    name: 'Scribbloo',
    logo: {
      '@type': 'ImageObject',
      url: `${baseUrl}/logo.png`
    }
  }
};