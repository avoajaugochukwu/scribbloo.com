'use client';
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getCategories } from '../actions/categories/read';
import { updateCategory } from '../actions/categories/update';
import { deleteCategory } from '../actions/categories/delete';
import { type Category } from '../actions/categories/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Trash2, Edit, Save, XCircle } from 'lucide-react';

// Helper for date formatting
function formatDate(dateString: string | null | undefined): string {
  if (!dateString) return 'N/A';
  try { return new Date(dateString).toLocaleDateString(); }
  catch (error: any) { return `Invalid Date: ${error.message}`; }
}

export function CategoryList() {
  const queryClient = useQueryClient();

  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');
  const [deleteConfirmation, setDeleteConfirmation] = useState<{ id: string; name: string } | null>(null);

  const { data: categories = [], isLoading: isLoadingCategories, error: fetchError } = useQuery<Category[], Error>({
    queryKey: ['categories'],
    queryFn: getCategories,
  });

  const updateMutation = useMutation({
    mutationFn: updateCategory,
    onSuccess: (result, variables /* variables is FormData */) => {
      // Get the ID from FormData
      const categoryId = variables.get('categoryId')?.toString();
      if (result.success) {
        // Use the retrieved ID
        console.log(`Category ${categoryId} updated successfully.`);
        queryClient.invalidateQueries({ queryKey: ['categories'] });
        setEditingCategoryId(null);
      } else {
        // Use the retrieved ID
        console.error(`Failed to update category ${categoryId}:`, result.message);
        alert(`Update failed: ${result.message}`);
      }
    },
    onError: (error, variables /* variables is FormData */) => {
      // Get the ID from FormData
      const categoryId = variables.get('categoryId')?.toString();
      // Use the retrieved ID
      console.error(`Error updating category ${categoryId}:`, error);
      alert(`An unexpected error occurred during update: ${error.message}`);
    },
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
        alert(`Deletion failed: ${result.message}`);
      }
    },
    onError: (error, categoryId) => {
      console.error(`Error deleting category ${categoryId}:`, error);
      alert(`An unexpected error occurred during deletion: ${error.message}`);
    },
  });

  const handleEdit = (category: Category) => {
    setEditingCategoryId(category.id);
    setEditingName(category.name);
  };

  const handleCancelEdit = () => {
    setEditingCategoryId(null);
  };

  const handleSave = (categoryId: string) => {
    const trimmedName = editingName.trim();
    if (!trimmedName) {
      alert('Category name cannot be empty.');
      return;
    }

    // Create FormData and append the required fields
    const formData = new FormData();
    formData.append('categoryId', categoryId);
    formData.append('categoryName', trimmedName);

    // Pass the FormData object to the mutation
    updateMutation.mutate(formData);
  };

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

  const isMutating = updateMutation.isPending || deleteMutation.isPending;

  return (
    <div className="mt-8">
      <h2 className="text-xl font-semibold mb-4">Existing Categories</h2>

      {deleteConfirmation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-sm">
            <h3 className="text-lg font-medium mb-4">Confirm Deletion</h3>
            <p className="mb-4">Are you sure you want to delete the category &quot;{deleteConfirmation.name}&quot;?</p>
            <div className="flex justify-end space-x-3">
              <Button variant="outline" onClick={cancelDelete} disabled={isMutating}>Cancel</Button>
              <Button variant="destructive" onClick={confirmDelete} disabled={isMutating}>
                {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
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
                <th scope="col" className="py-3 px-6">ID</th>
                <th scope="col" className="py-3 px-6">Created At</th>
                <th scope="col" className="py-3 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((category) => (
                <tr key={category.id} className="bg-white border-b hover:bg-gray-50">
                  <td className="py-3 px-6">
                    {editingCategoryId === category.id ? (
                      <Input
                        type="text"
                        value={editingName}
                        onChange={(e) => setEditingName(e.target.value)}
                        disabled={isMutating}
                        className="w-full"
                        autoFocus
                      />
                    ) : (
                      category.name
                    )}
                  </td>
                  <td className="py-3 px-6 text-xs">{category.id}</td>
                  <td className="py-3 px-6">{formatDate(category.created_at)}</td>
                  <td className="py-3 px-6 text-right">
                    {editingCategoryId === category.id ? (
                      <div className="flex justify-end space-x-2">
                        <Button variant="ghost" size="sm" onClick={() => handleSave(category.id)} disabled={isMutating} title="Save changes"> <Save className="h-4 w-4 text-green-600" /> </Button>
                        <Button variant="ghost" size="sm" onClick={handleCancelEdit} disabled={isMutating} title="Cancel edit"> <XCircle className="h-4 w-4 text-gray-500" /> </Button>
                      </div>
                    ) : (
                      <div className="flex justify-end space-x-2">
                        <Button variant="ghost" size="sm" onClick={() => handleEdit(category)} disabled={isMutating} title="Edit category"> <Edit className="h-4 w-4" /> </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleDelete(category.id, category.name)} disabled={isMutating} className="text-red-600 hover:text-red-800" title="Delete category"> <Trash2 className="h-4 w-4" /> </Button>
                      </div>
                    )}
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