'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import { getCategories } from '../actions/categories/read';
import { deleteCategory } from '../actions/categories/delete';
import Category from '@/types/category.type';
import { Button } from '@/components/ui/button';
import { Trash2, Edit } from 'lucide-react';
import { toast } from 'sonner';

export function CategoryList() {
  const queryClient = useQueryClient();

  const [deleteConfirmation, setDeleteConfirmation] = useState<{ id: string; name: string } | null>(null);

  const { data: categories = [], isLoading: isLoadingCategories, error: fetchError } = useQuery<Category[]>({
    queryKey: ['categories'],
    queryFn: getCategories,
  });

  const deleteMutation = useMutation({
    mutationFn: deleteCategory,
    onSuccess: (result, categoryId) => {
      if (result.success) {
        console.log(`Category ${categoryId} deleted successfully.`);
        queryClient.invalidateQueries({ queryKey: ['categories'] });
        setDeleteConfirmation(null);
      } else {
        console.error(`Failed to delete category ${categoryId}:`, result.message);
        toast.error(`Deletion failed: ${result.message}`);
      }
    },
    onError: (error, categoryId) => {
      console.error(`Error deleting category ${categoryId}:`, error);
      toast.error(`An unexpected error occurred during deletion: ${error.message}`);
    },
  });

  const handleDelete = (categoryId: string, categoryName: string) => {
    setDeleteConfirmation({ id: categoryId, name: categoryName });
  };

  const confirmDelete = () => {
    if (deleteConfirmation) {
      deleteMutation.mutate(deleteConfirmation.id);
    }
  };

  const cancelDelete = () => {
    setDeleteConfirmation(null);
  };

  if (isLoadingCategories) {
    return <p className="text-center text-gray-500 py-6">Loading categories...</p>;
  }

  if (fetchError) {
    return <p className="text-center text-red-600 py-6">Error loading categories: {fetchError.message}</p>;
  }

  const isMutating = deleteMutation.isPending;

  console.log('categories', categories);

  return (
    <div className="mt-8">
      <h2 className="text-xl font-semibold mb-4">Existing Categories</h2>

      {deleteConfirmation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-sm">
            <h3 className="text-lg font-medium mb-4">Confirm Deletion</h3>
            <p className="mb-4">Are you sure you want to delete the category &quot;{deleteConfirmation.name}&quot;? This action cannot be undone.</p>
            <div className="flex justify-end space-x-3">
              <Button variant="outline" onClick={cancelDelete} disabled={isMutating}>Cancel</Button>
              <Button variant="destructive" onClick={confirmDelete} disabled={isMutating}>
                {isMutating ? 'Deleting...' : 'Delete'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {categories.length === 0 ? (
        <p className="text-gray-500 italic">No categories found.</p>
      ) : (
        <div className="overflow-x-auto relative shadow-md sm:rounded-lg">
          <table className="w-full text-sm text-left text-gray-500">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50">
              <tr>
                <th scope="col" className="py-3 px-6">Name</th>
                <th scope="col" className="py-3 px-6">Slug</th>
                <th scope="col" className="py-3 px-6">Description</th>
                <th scope="col" className="py-3 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((category) => (
                <tr key={category.id} className="bg-white border-b hover:bg-gray-50">
                  <td className="py-4 px-6 font-medium text-gray-900 whitespace-nowrap">
                    {category.name}
                  </td>
                  <td className="py-4 px-6">
                    {category.slug || <span className="text-gray-400 italic">N/A</span>}
                  </td>
                  <td className="py-4 px-6 max-w-xs truncate" title={category.description ?? ''}>
                    {category.description || <span className="text-gray-400 italic">None</span>}
                  </td>
                  <td className="py-4 px-6 text-right">
                    <Button asChild variant="ghost" size="sm" title="Edit category" disabled={isMutating}>
                      <Link href={`/admin/categories/edit/${category.id}`}>
                        <Edit className="h-4 w-4" />
                      </Link>
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDelete(category.id, category.name)} disabled={isMutating} className="text-red-600 hover:text-red-800 ml-2" title="Delete category">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
} 