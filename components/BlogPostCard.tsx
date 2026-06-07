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
      <Card className="pressable shadow-pop h-full flex flex-col overflow-hidden gap-0 py-0">
          <div className="relative w-full aspect-video overflow-hidden border-b-2 border-ink">
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
          <CardHeader className="pt-5 px-6">
            <CardTitle className="line-clamp-2 text-xl transition-colors group-hover:text-terracotta">{post.title}</CardTitle>
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