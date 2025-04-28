'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation'; // Import the category action
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { createCategory } from '../actions/categories/create';

export function CreateCategoryForm() {
  const router = useRouter();
  const [categoryName, setCategoryName] = useState(''); // State for category name
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage(null);

    startTransition(async () => {
      const formData = new FormData();
      formData.append('categoryName', categoryName); // Use 'categoryName' key

      const result = await createCategory(formData); // Call the category action

      if (result.success) {
        setMessage({ text: result.message, type: 'success' });
        setCategoryName(''); // Clear input on success
        router.refresh(); // Refresh the page data
      } else {
        setMessage({ text: result.message, type: 'error' });
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="mt-6 p-4 border rounded-lg bg-gray-50 shadow-sm">
        <h2 className="text-lg font-semibold mb-3">Add New Category</h2>
        <div className="flex items-end space-x-2">
            <div className="flex-grow">
                <label htmlFor="categoryName" className="sr-only">Category Name</label>
                <Input
                    type="text"
                    id="categoryName"
                    name="categoryName" // Match the key used in formData.append
                    value={categoryName}
                    onChange={(e) => setCategoryName(e.target.value)}
                    placeholder="Enter new category name"
                    required
                    disabled={isPending}
                    className="w-full"
                />
            </div>
            <Button type="submit" disabled={isPending || !categoryName.trim()}>
                {isPending ? 'Adding...' : 'Add Category'}
            </Button>
        </div>
         {message && (
            <p className={`mt-2 text-sm ${message.type === 'error' ? 'text-red-600' : 'text-green-600'}`}>
                {message.text}
            </p>
         )}
    </form>
  );
} 