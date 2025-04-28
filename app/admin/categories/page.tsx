import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { CreateCategoryForm } from './CreateCategoryForm';
import { CategoryList } from './CategoryList';

export default async function ManageCategoriesPage() {
  return (
    <div className="w-3/5 mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Manage Categories</h1>
        <Button variant="outline" size="sm" asChild>
          <Link href="/admin">Back to Admin</Link>
        </Button>
      </div>

      <CreateCategoryForm />
      <CategoryList />
    </div>
  );
}

// Optional: Add dynamic = 'force-dynamic' if data needs to be fresh on every load
// export const dynamic = 'force-dynamic'; 