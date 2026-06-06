import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { format } from 'date-fns';
import { MDXRemote } from 'next-mdx-remote/rsc';

import { getAllPostSlugs, getPostBySlug, getAllPosts } from '@/lib/content/blog';
import { imageUrl } from '@/lib/images';
import { baseUrl } from '@/app/metadata';
import { Badge } from '@/components/ui/badge';
import { mdxComponents } from '@/components/mdx/MdxComponents';

type BlogPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  const slugs = await getAllPostSlugs();
  return slugs.map((slug) => ({ slug }));
}

/**
 * Generate metadata for the blog post.
 */
export async function generateMetadata({ params }: BlogPageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug(slug);

  if (!post) {
    return {
      title: 'Post not found',
      robots: { index: false, follow: false },
    };
  }

  const description = post.metaDescription ?? post.excerpt ?? undefined;
  const ogImage = post.featuredImage
    ? imageUrl({ kind: 'blog-featured', slug })
    : undefined;

  return {
    title: post.title,
    description,
    openGraph: {
      title: post.title,
      description,
      type: 'article',
      url: `${baseUrl}/blog/${slug}`,
      ...(post.publishedAt ? { publishedTime: post.publishedAt } : {}),
      ...(ogImage ? { images: [{ url: ogImage }] } : {}),
    },
    robots: {
      index: true,
      follow: true,
    },
    alternates: {
      canonical: `${baseUrl}/blog/${slug}`,
      languages: {
        'en-US': `${baseUrl}/blog/${slug}`,
        'x-default': `${baseUrl}/blog/${slug}`,
      },
    },
  };
}

export default async function BlogPage({ params }: BlogPageProps) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);

  if (!post) {
    notFound();
  }

  const author = post.author ?? 'Scribbloo';
  const formattedDate = post.publishedAt
    ? format(new Date(post.publishedAt), 'MMMM d, yyyy')
    : null;
  const featuredImageUrl = post.featuredImage
    ? imageUrl({ kind: 'blog-featured', slug })
    : null;

  // Internal-link blocks. relatedCategories / relatedPages are currently empty
  // arrays, but the markup lights up automatically once they are populated.
  const allPosts = await getAllPosts();
  const moreFromBlog = allPosts.filter((p) => p.slug !== slug).slice(0, 3);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.metaDescription ?? post.excerpt ?? undefined,
    ...(featuredImageUrl ? { image: `${baseUrl}${featuredImageUrl}` } : {}),
    ...(post.publishedAt ? { datePublished: post.publishedAt } : {}),
    author: {
      '@type': 'Person',
      name: author,
    },
    publisher: {
      '@type': 'Organization',
      name: 'Scribbloo',
      logo: {
        '@type': 'ImageObject',
        url: `${baseUrl}/logo.png`,
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `${baseUrl}/blog/${slug}`,
    },
  };

  return (
    <article className="container mx-auto px-4 py-12 max-w-3xl">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <header className="mb-8">
        <h1 className="text-gradient-brand text-4xl md:text-5xl font-extrabold mb-4 leading-tight text-balance">{post.title}</h1>
        <div className="text-muted-foreground text-sm mb-4">
          {formattedDate && <span>{formattedDate}</span>}
          {formattedDate && <span> · </span>}
          <span>By {author}</span>
        </div>
        {post.tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {post.tags.map((tag) => (
              <Badge key={tag} variant="secondary">
                {tag}
              </Badge>
            ))}
          </div>
        )}
      </header>

      {featuredImageUrl && (
        <div className="mb-10 overflow-hidden rounded-2xl border-4 border-white shadow-xl ring-2 ring-pink-200">
          <Image
            src={featuredImageUrl}
            alt={`Featured image for ${post.title}`}
            width={1200}
            height={630}
            priority
            sizes="(max-width: 768px) 100vw, 768px"
            className="h-auto w-full object-cover"
          />
        </div>
      )}

      <div className="max-w-none">
        <MDXRemote source={post.content} components={mdxComponents} />
      </div>

      {(post.relatedCategories.length > 0 || post.relatedPages.length > 0) && (
        <section className="mt-16 border-t pt-8">
          <h2 className="mb-4 text-2xl font-bold">Related</h2>
          <ul className="flex flex-wrap gap-3">
            {post.relatedCategories.map((categorySlug) => (
              <li key={`cat-${categorySlug}`}>
                <Link
                  href={`/coloring-pages/${categorySlug}`}
                  className="text-primary underline underline-offset-4 hover:text-primary/80"
                >
                  {categorySlug}
                </Link>
              </li>
            ))}
            {post.relatedPages.map((pageSlug) => (
              <li key={`page-${pageSlug}`}>
                <Link
                  href={`/coloring-pages/${pageSlug}`}
                  className="text-primary underline underline-offset-4 hover:text-primary/80"
                >
                  {pageSlug}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      {moreFromBlog.length > 0 && (
        <section className="mt-16 border-t pt-8">
          <h2 className="mb-4 text-2xl font-bold">More from the blog</h2>
          <ul className="space-y-3">
            {moreFromBlog.map((p) => (
              <li key={p.slug}>
                <Link
                  href={`/blog/${p.slug}`}
                  className="font-medium text-primary underline underline-offset-4 hover:text-primary/80"
                >
                  {p.title}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </article>
  );
}
