import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { getTags, type Tag } from './actions';
import { TagList } from './TagList'; // <-- Import the new TagList component
import { CreateTagForm } from './CreateTagForm';

// This page remains a Server Component
export default async function ManageTagsPage() {
  let initialTags: Tag[] = [];
  let fetchError: string | null = null;

  // Fetch initial data on the server
  try {
    initialTags = await getTags();
  } catch (error: any) {
    console.error("Failed to load tags for page:", error);
    fetchError = error.message || "Could not load tags.";
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Manage Tags</h1>
        <Button variant="outline" size="sm" asChild>
          <Link href="/admin">Back to Admin</Link>
        </Button>
      </div>

      {/* Render the Create Form (Client Component) */}
      <CreateTagForm />

      {/* Display Fetch Error if any */}
      {fetchError && (
        <p className="mt-8 text-center text-red-600 py-4">{fetchError}</p>
      )}

      {/* Render the Tag List (Client Component) and pass initial data */}
      {!fetchError && <TagList initialTags={initialTags} />}

    </div>
  );
}

// Optional: Add dynamic = 'force-dynamic' if data needs to be fresh on every load
// export const dynamic = 'force-dynamic'; 