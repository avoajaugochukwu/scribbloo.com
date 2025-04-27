import { Skeleton } from "@/components/ui/skeleton";

export function BlogPostSkeleton() {
  return (
    <article className="container relative max-w-3xl mx-auto py-6 lg:py-10">
      {/* Title Skeleton */}
      <Skeleton className="h-10 w-3/4 mb-4" />

      {/* Metadata Skeleton (Date, Author, Reading Time) */}
      <div className="flex items-center space-x-4 mb-8 text-sm">
        <Skeleton className="h-5 w-24" />
        <Skeleton className="h-5 w-20" />
        <Skeleton className="h-5 w-16" />
      </div>

      {/* Featured Image Skeleton - Uncommented and positioned */}
      <Skeleton className="w-full aspect-video mb-8 rounded-lg" />

      {/* Content Skeleton */}
      <div className="prose prose-stone dark:prose-invert max-w-none space-y-4">
        <Skeleton className="h-6 w-full" />
        <Skeleton className="h-6 w-11/12" />
        <Skeleton className="h-6 w-full" />
        <Skeleton className="h-6 w-5/6" />
        <Skeleton className="h-6 w-full" />
        <Skeleton className="h-6 w-full" />
        <Skeleton className="h-6 w-10/12" />
        <Skeleton className="h-6 w-full" />
        <Skeleton className="h-6 w-4/6" />
        <Skeleton className="h-6 w-full" />
        <Skeleton className="h-6 w-11/12" />
        <Skeleton className="h-6 w-full" />
        <Skeleton className="h-6 w-3/4" />
      </div>
    </article>
  );
} 