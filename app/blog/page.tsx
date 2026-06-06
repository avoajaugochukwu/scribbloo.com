import type { Metadata } from 'next';
import { format } from 'date-fns';

import { getAllPosts } from '@/lib/content/blog';
import { imageUrl } from '@/lib/images';
import { baseUrl } from '@/app/metadata';
import { BlogPostCard } from '@/components/BlogPostCard';

const FALLBACK_IMAGE = '/og-image.png';

export const metadata: Metadata = {
  title: 'Blog | Scribbloo',
  description:
    'Drawing ideas, beginner sketching tutorials, and printable coloring inspiration from the Scribbloo team.',
  alternates: {
    canonical: `${baseUrl}/blog`,
  },
  openGraph: {
    title: 'Blog | Scribbloo',
    description:
      'Drawing ideas, beginner sketching tutorials, and printable coloring inspiration from the Scribbloo team.',
    url: `${baseUrl}/blog`,
    type: 'website',
  },
};

export default async function BlogIndex() {
  const posts = await getAllPosts();

  if (posts.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold mb-8 text-center">Blog</h1>
        <div className="text-center text-muted-foreground">No posts found.</div>
      </div>
    );
  }

  const cards = posts.map((post) => ({
    id: post.slug,
    slug: post.slug,
    title: post.title,
    excerpt: post.excerpt ?? 'No excerpt available.',
    formattedDate: post.publishedAt
      ? format(new Date(post.publishedAt), 'MMMM d, yyyy')
      : '',
    featuredImageUrl: post.featuredImage
      ? imageUrl({ kind: 'blog-featured', slug: post.slug })
      : FALLBACK_IMAGE,
    author: post.author ?? 'Scribbloo',
  }));

  return (
    <div className="container mx-auto px-4 py-12">
      <header className="mb-12 text-center">
        <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl">Blog Posts</h1>
        <p className="mt-3 text-xl text-muted-foreground">
          All our latest articles and updates.
        </p>
      </header>

      <main>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {cards.map((post) => (
            <BlogPostCard key={post.id} post={post} />
          ))}
        </div>
      </main>
    </div>
  );
}
