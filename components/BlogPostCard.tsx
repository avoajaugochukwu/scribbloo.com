"use client"; // Mark this as a Client Component

import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

// Define the expected props for the card
type BlogPostCardProps = {
  post: {
    id: string;
    slug: string;
    title: string;
    excerpt: string;
    formattedDate: string;
    featuredImageUrl: string;
    author: string;
  };
};

export function BlogPostCard({ post }: BlogPostCardProps) {
  return (
    <Link
      href={`/blog/${post.slug}`}
      key={post.id} // Key can stay here or move to the map in page.tsx
      className="block group"
    >
      <Card className="h-full flex flex-col overflow-hidden border-pink-100 transition-all duration-200 hover:-translate-y-1 hover:border-pink-300 hover:shadow-xl">
          <div className="relative w-full aspect-video overflow-hidden">
            <Image
              src={post.featuredImageUrl}
              alt={`Featured image for ${post.title}`}
              width={640}
              height={360}
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
              // onError is now allowed because this is a Client Component
              onError={(e) => {
                  e.currentTarget.src = '/og-image.png';
              }}
            />
          </div>
          <CardHeader className="pt-4 px-6">
            <CardTitle className="line-clamp-2 text-xl font-bold transition-colors group-hover:text-fuchsia-600">{post.title}</CardTitle>
            <CardDescription>
              {post.formattedDate} · by{' '}
              <span className="font-medium text-foreground">{post.author}</span>
            </CardDescription>
          </CardHeader>
          <CardContent className="flex-grow pb-4 px-6">
            <p className="text-sm text-muted-foreground line-clamp-3">{post.excerpt}</p>
          </CardContent>
      </Card>
    </Link>
  );
} 