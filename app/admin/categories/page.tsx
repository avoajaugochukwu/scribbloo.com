'use client';

import { Button } from '@/components/ui/button';
import { CategoryList } from './CategoryList';
import Link from 'next/link';
import { PlusCircle } from 'lucide-react';

export default function CategoriesAdminPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6 gap-4">
        <h1 className="text-3xl font-bold">Manage Categories</h1>
        <div className="flex items-center gap-2">
            <Button asChild>
                <Link href="/admin/categories/create">
                    <PlusCircle className="mr-2 h-4 w-4" /> Create New Category
                </Link>
            </Button>
            <Button asChild variant="outline">
                <Link href="/admin">Back to Admin Dashboard</Link>
            </Button>
        </div>
      </div>

      <CategoryList />
    </div>
  );
}

// Optional: Add dynamic = 'force-dynamic' if data needs to be fresh on every load
// export const dynamic = 'force-dynamic'; 