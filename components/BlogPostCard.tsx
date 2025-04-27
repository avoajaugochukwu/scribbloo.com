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
      <Card className="h-full flex flex-col overflow-hidden transition-shadow hover:shadow-lg dark:hover:shadow-slate-700 rounded-lg">
          <div className="relative w-full aspect-video overflow-hidden">
            <Image
              src={post.featuredImageUrl}
              alt={`Featured image for ${post.title}`}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              style={{ objectFit: 'cover' }}
              className="transition-transform duration-300 group-hover:scale-105"
              // onError is now allowed because this is a Client Component
              onError={(e) => {
                  e.currentTarget.src = '/placeholder-image.jpg'; // Ensure this placeholder exists
              }}
            />
          </div>
          <CardHeader className="pt-4 px-6">
            <CardTitle className="line-clamp-2">{post.title}</CardTitle>
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