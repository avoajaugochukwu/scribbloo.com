import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { getCategories, type Category } from './actions'; // Import category actions/types
import { CreateCategoryForm } from './CreateCategoryForm'; // Import category form
import { CategoryList } from './CategoryList'; // Import category list

// Server Component for managing categories
export default async function ManageCategoriesPage() {
  let initialCategories: Category[] = []; // Variable name changed
  let fetchError: string | null = null;

  // Fetch initial data on the server
  try {
    initialCategories = await getCategories(); // Call category fetch action
  } catch (error: any) {
    console.error("Failed to load categories for page:", error);
    fetchError = error.message || "Could not load categories.";
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Manage Categories</h1> {/* Title changed */}
        <Button variant="outline" size="sm" asChild>
          <Link href="/admin">Back to Admin</Link>
        </Button>
      </div>

      {/* Render the Create Form */}
      <CreateCategoryForm />

      {/* Display Fetch Error if any */}
      {fetchError && (
        <p className="mt-8 text-center text-red-600 py-4">{fetchError}</p>
      )}

      {/* Render the Category List and pass initial data */}
      {!fetchError && <CategoryList initialCategories={initialCategories} />} {/* Component/prop names changed */}

    </div>
  );
}

// Optional: Add dynamic = 'force-dynamic' if data needs to be fresh on every load
// export const dynamic = 'force-dynamic'; 