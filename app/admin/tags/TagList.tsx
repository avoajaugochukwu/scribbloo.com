'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { type Tag, updateTag, deleteTag } from './actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Trash2, Edit, Save, XCircle } from 'lucide-react'; // Example icons

// Helper for date formatting
function formatDate(dateString: string | null | undefined): string {
    if (!dateString) return 'N/A';
    try { return new Date(dateString).toLocaleDateString(); }
    catch (e) { return 'Invalid Date'; }
}

interface TagListProps {
  initialTags: Tag[];
}

export function TagList({ initialTags }: TagListProps) {
  const router = useRouter();
  const [editingTagId, setEditingTagId] = useState<number | null>(null);
  const [editValue, setEditValue] = useState<string>('');
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleEdit = (tag: Tag) => {
    setEditingTagId(tag.id);
    setEditValue(tag.name);
    setError(null); // Clear errors when starting edit
    setSuccessMessage(null);
  };

  const handleCancel = () => {
    setEditingTagId(null);
    setEditValue('');
  };

  const handleSave = (tagId: number) => {
    setError(null);
    setSuccessMessage(null);
    startTransition(async () => {
      const result = await updateTag(tagId, editValue);
      if (result.success) {
        setSuccessMessage(result.message);
        setEditingTagId(null); // Exit edit mode on success
        router.refresh();
      } else {
        setError(result.message);
      }
    });
  };

  const handleDelete = (tagId: number, tagName: string) => {
    if (!window.confirm(`Are you sure you want to delete the tag "${tagName}"? This might fail if it's linked to images.`)) {
      return;
    }
    setError(null);
    setSuccessMessage(null);
    startTransition(async () => {
      const result = await deleteTag(tagId);
      if (result.success) {
        setSuccessMessage(result.message);
        router.refresh();
      } else {
        setError(result.message);
      }
    });
  };

  const tagsToDisplay = initialTags;

  return (
    <div className="mt-8">
      <h2 className="text-xl font-semibold mb-4">Existing Tags</h2>

      {/* Display general error/success messages */}
      {error && <p className="mb-4 text-sm text-red-600">{error}</p>}
      {successMessage && <p className="mb-4 text-sm text-green-600">{successMessage}</p>}

      {tagsToDisplay.length === 0 && (
        <p className="text-gray-500">No tags found.</p>
      )}
      {tagsToDisplay.length > 0 && (
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
              {tagsToDisplay.map((tag) => (
                <tr key={tag.id} className="bg-white border-b hover:bg-gray-50">
                  {editingTagId === tag.id ? (
                    // Editing State
                    <td colSpan={3} className="py-2 px-6"> {/* Span across columns */}
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
                    // Display State
                    <>
                      <td className="py-4 px-6 font-medium text-gray-900 whitespace-nowrap">
                        {tag.name}
                      </td>
                      <td className="py-4 px-6 text-xs">{tag.id}</td>
                      <td className="py-4 px-6">{formatDate(tag.created_at)}</td>
                    </>
                  )}
                  {/* Actions Column */}
                  <td className="py-2 px-6 text-right">
                    {editingTagId === tag.id ? (
                      // Edit Mode Actions
                      <div className="flex justify-end space-x-2">
                        <Button
                          variant="ghost" size="sm"
                          onClick={() => handleSave(tag.id)}
                          disabled={isPending || !editValue.trim() || editValue === tag.name}
                          title="Save changes"
                        >
                          <Save className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost" size="sm"
                          onClick={handleCancel}
                          disabled={isPending}
                          title="Cancel edit"
                        >
                          <XCircle className="h-4 w-4" />
                        </Button>
                      </div>
                    ) : (
                      // Display Mode Actions
                      <div className="flex justify-end space-x-2">
                        <Button
                          variant="ghost" size="sm"
                          onClick={() => handleEdit(tag)}
                          disabled={isPending}
                          title="Edit tag"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost" size="sm"
                          onClick={() => handleDelete(tag.id, tag.name)}
                          disabled={isPending}
                          className="text-red-600 hover:text-red-800"
                          title="Delete tag"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
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