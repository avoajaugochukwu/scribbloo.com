/* eslint-disable @typescript-eslint/no-explicit-any */
import { fetchPages } from '@/lib/notion';
import { format } from 'date-fns'; // For formatting dates
import { BlogPostCard } from "@/components/BlogPostCard"; // Import the card component

// Define a type for better structure (adjust based on your actual properties)
type Post = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  date: string; // Keep as string initially
  formattedDate: string;
  readingTime: string;
  tags: string[];
  author: string;
  featuredImageUrl: string;
};

// Optional: Add metadata for the blog page
export const metadata = {
  title: 'Blog | My Site',
  description: 'Read the latest articles on our blog.',
};

export default async function BlogIndex() {
  const pages = await fetchPages();

  if (!pages || pages.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold mb-8 text-center">Blog</h1>
        <div className="text-center text-muted-foreground">No posts found.</div>
      </div>
    );
  }

  // Map Notion pages to our Post type
  const posts: Post[] = pages.map((page: any) => {
    const dateStr = page.properties.Created?.created_time || new Date().toISOString();

    let featuredImageUrl = '/placeholder-image.jpg'; // Default placeholder
    const featuredImageProp = page.properties["Featured Image"]?.files;
    if (featuredImageProp && featuredImageProp.length > 0) {
      if (featuredImageProp[0].type === 'external') {
        featuredImageUrl = featuredImageProp[0].external.url;
      } else if (featuredImageProp[0].type === 'file') {
        featuredImageUrl = featuredImageProp[0].file.url; // Use the file URL (might be temporary)
      }
    }

    // Extract author names from multi-select
    const authorMultiSelect = page.properties.Author?.multi_select;
    let authorNames = 'InvoicePDF Team'; // Default author
    if (authorMultiSelect && authorMultiSelect.length > 0) {
      // Map over the array and get the name of each selected author
      authorNames = authorMultiSelect.map((author: any) => author.name).join(', ');
    }

    return {
      id: page.id,
      slug: page.properties.Slug?.rich_text[0]?.plain_text || page.id,
      title: page.properties.Title?.title[0]?.plain_text || 'Untitled Post',
      excerpt: page.properties.Excerpt?.rich_text[0]?.plain_text || 'No excerpt available.',
      date: dateStr,
      formattedDate: format(new Date(dateStr), 'MMMM d, yyyy'),
      readingTime: `${page.properties.ReadingTime?.number || 5} min read`,
      tags: page.properties.Tags?.multi_select?.map((tag: any) => tag.name) || [],
      author: authorNames,
      featuredImageUrl: featuredImageUrl,
    };
  }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <div className="container mx-auto px-4 py-12">
      <header className="mb-12 text-center">
        <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl">
          Blog Posts
        </h1>
        <p className="mt-3 text-xl text-muted-foreground">
          All our latest articles and updates.
        </p>
        {/* Optional: Breadcrumbs or link back home */}
        {/* <nav className="mt-4 text-sm">
          <Link href="/" className="text-muted-foreground hover:text-primary">Home</Link>
          <span className="mx-2 text-muted-foreground">/</span>
          <span>Blog</span>
        </nav> */}
      </header>

      <main>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {posts.map((post) => (
            <BlogPostCard key={post.id} post={post} />
          ))}
        </div>
      </main>
    </div>
  );
}

// Optional: Add revalidation if needed
// export const revalidate = 60; // Revalidate every 60 seconds 