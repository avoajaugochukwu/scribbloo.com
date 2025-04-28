'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { type Category, updateCategory, deleteCategory } from './actions'; // Import category types/actions
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Trash2, Edit, Save, XCircle } from 'lucide-react';

// Helper for date formatting
function formatDate(dateString: string | null | undefined): string {
    if (!dateString) return 'N/A';
    try { return new Date(dateString).toLocaleDateString(); }
    catch (e) { return 'Invalid Date'; }
}

interface CategoryListProps {
  initialCategories: Category[]; // Prop name changed
}

export function CategoryList({ initialCategories }: CategoryListProps) { // Prop name changed
  const router = useRouter();
  const [editingCategoryId, setEditingCategoryId] = useState<number | null>(null); // State name changed
  const [editValue, setEditValue] = useState<string>('');
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleEdit = (category: Category) => { // Parameter type changed
    setEditingCategoryId(category.id); // State setter changed
    setEditValue(category.name);
    setError(null);
    setSuccessMessage(null);
  };

  const handleCancel = () => {
    setEditingCategoryId(null); // State setter changed
    setEditValue('');
  };

  const handleSave = (categoryId: number) => { // Parameter name changed
    setError(null);
    setSuccessMessage(null);
    startTransition(async () => {
      const result = await updateCategory(categoryId, editValue); // Call category action
      if (result.success) {
        setSuccessMessage(result.message);
        setEditingCategoryId(null); // State setter changed
        router.refresh();
      } else {
        setError(result.message);
      }
    });
  };

  const handleDelete = (categoryId: number, categoryName: string) => { // Parameter names changed
    if (!window.confirm(`Are you sure you want to delete the category "${categoryName}"? This might fail if it's linked to images.`)) {
      return;
    }
    setError(null);
    setSuccessMessage(null);
    startTransition(async () => {
      const result = await deleteCategory(categoryId); // Call category action
      if (result.success) {
        setSuccessMessage(result.message);
        router.refresh();
      } else {
        setError(result.message);
      }
    });
  };

  const categoriesToDisplay = initialCategories; // Variable name changed

  return (
    <div className="mt-8">
      <h2 className="text-xl font-semibold mb-4">Existing Categories</h2>

      {error && <p className="mb-4 text-sm text-red-600">{error}</p>}
      {successMessage && <p className="mb-4 text-sm text-green-600">{successMessage}</p>}

      {categoriesToDisplay.length === 0 && ( // Variable name changed
        <p className="text-gray-500">No categories found.</p>
      )}
      {categoriesToDisplay.length > 0 && ( // Variable name changed
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
              {categoriesToDisplay.map((category) => ( // Variable names changed
                <tr key={category.id} className="bg-white border-b hover:bg-gray-50">
                  {editingCategoryId === category.id ? ( // State variable changed
                    <td colSpan={3} className="py-2 px-6">
                      <div className="flex items-center space-x-2">
                         <Input
                            type="text"
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            disabled={isPending}
                            className="flex-grow"
                            autoFocus
                         />
                      </div>
                    </td>
                  ) : (
                    <>
                      <td className="py-4 px-6 font-medium text-gray-900 whitespace-nowrap">
                        {category.name}
                      </td>
                      <td className="py-4 px-6 text-xs">{category.id}</td>
                      <td className="py-4 px-6">{formatDate(category.created_at)}</td>
                    </>
                  )}
                  <td className="py-2 px-6 text-right">
                    {editingCategoryId === category.id ? ( // State variable changed
                      <div className="flex justify-end space-x-2">
                        <Button variant="ghost" size="sm" onClick={() => handleSave(category.id)} disabled={isPending || !editValue.trim() || editValue === category.name} title="Save changes"> <Save className="h-4 w-4" /> </Button>
                        <Button variant="ghost" size="sm" onClick={handleCancel} disabled={isPending} title="Cancel edit"> <XCircle className="h-4 w-4" /> </Button>
                      </div>
                    ) : (
                      <div className="flex justify-end space-x-2">
                        <Button variant="ghost" size="sm" onClick={() => handleEdit(category)} disabled={isPending} title="Edit category"> <Edit className="h-4 w-4" /> </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleDelete(category.id, category.name)} disabled={isPending} className="text-red-600 hover:text-red-800" title="Delete category"> <Trash2 className="h-4 w-4" /> </Button>
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