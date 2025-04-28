'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getTags } from '../actions/tags/read';
import { updateTag } from '../actions/tags/update';
import { deleteTag } from '../actions/tags/delete';
import { type Tag } from '../actions/tags/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Trash2, Edit, Save, XCircle } from 'lucide-react';

// Helper for date formatting
function formatDate(dateString: string | null | undefined): string {
    if (!dateString) return 'N/A';
    try { return new Date(dateString).toLocaleDateString(); }
    catch (e) { return 'Invalid Date'; }
}

export function TagList() {
    const queryClient = useQueryClient();
    const [editingTagId, setEditingTagId] = useState<string | null>(null);
    const [editingName, setEditingName] = useState('');
    const [deleteConfirmation, setDeleteConfirmation] = useState<{ id: string; name: string } | null>(null);

    // --- Fetch with useQuery ---
    const { data: tags = [], isLoading: isLoadingTags, error: fetchError } = useQuery<Tag[], Error>({
        queryKey: ['tags'],
        queryFn: getTags,
    });

    // --- Update Mutation ---
    const updateMutation = useMutation({
        mutationFn: async (variables: { id: string; name: string }) => {
            const formData = new FormData();
            formData.append('tagId', variables.id);
            formData.append('tagName', variables.name);
            return updateTag(formData);
        },
        onSuccess: (result, variables) => {
            if (result.success) {
                queryClient.invalidateQueries({ queryKey: ['tags'] });
                setEditingTagId(null);
            } else {
                alert(`Update failed: ${result.message}`);
            }
        },
        onError: (error) => alert(`Update error: ${error.message}`),
    });

    // --- Delete Mutation ---
    const deleteMutation = useMutation({
        mutationFn: deleteTag,
        onSuccess: (result, tagId) => {
            if (result.success) {
                queryClient.invalidateQueries({ queryKey: ['tags'] });
                setDeleteConfirmation(null);
            } else {
                alert(`Deletion failed: ${result.message}`);
            }
        },
        onError: (error) => alert(`Deletion error: ${error.message}`),
    });

    // --- Handlers (similar to CategoryList, using mutation.mutate) ---
    const handleEdit = (tag: Tag) => {
        setEditingTagId(tag.id);
        setEditingName(tag.name);
    };
    const handleCancelEdit = () => {
        setEditingTagId(null);
        setEditingName('');
    };
    const handleSave = (tagId: string) => {
        if (!editingName.trim()) return;
        updateMutation.mutate({ id: tagId, name: editingName.trim() });
    };
    const handleDelete = (tagId: string, tagName: string) => {
        if (!window.confirm(`Are you sure you want to delete the tag "${tagName}"? This might fail if it's linked to images.`)) {
            return;
        }
        deleteMutation.mutate(tagId);
    };
    const confirmDelete = () => {
        if (deleteConfirmation) deleteMutation.mutate(deleteConfirmation.id);
    };
    const cancelDelete = () => {
        setDeleteConfirmation(null);
    };

    // --- Loading/Error States ---
    if (isLoadingTags) return <p>Loading tags...</p>;
    if (fetchError) return <p>Error loading tags: {fetchError.message}</p>;

    const isMutating = updateMutation.isPending || deleteMutation.isPending;

    return (
        <div className="mt-8">
            <h2 className="text-xl font-semibold mb-4">Existing Tags</h2>
            {tags.length === 0 ? ( <p>No tags found.</p> ) : (
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
                            {tags.map((tag) => (
                                <tr key={tag.id} className="bg-white border-b hover:bg-gray-50">
                                    {editingTagId === tag.id ? (
                                        <td colSpan={3} className="py-2 px-6">
                                            <div className="flex items-center space-x-2">
                                                <Input
                                                    type="text"
                                                    value={editingName}
                                                    onChange={(e) => setEditingName(e.target.value)}
                                                    disabled={isMutating}
                                                    className="flex-grow"
                                                    autoFocus
                                                />
                                            </div>
                                        </td>
                                    ) : (
                                        <>
                                            <td className="py-4 px-6 font-medium text-gray-900 whitespace-nowrap">
                                                {tag.name}
                                            </td>
                                            <td className="py-4 px-6 text-xs">{tag.id}</td>
                                            <td className="py-4 px-6">{formatDate(tag.created_at)}</td>
                                        </>
                                    )}
                                    <td className="py-2 px-6 text-right">
                                        {editingTagId === tag.id ? (
                                            <div className="flex justify-end space-x-2">
                                                <Button
                                                    variant="ghost" size="sm"
                                                    onClick={() => handleSave(tag.id)}
                                                    disabled={isMutating || !editingName.trim() || editingName === tag.name}
                                                    title="Save changes"
                                                >
                                                    <Save className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost" size="sm"
                                                    onClick={handleCancelEdit}
                                                    disabled={isMutating}
                                                    title="Cancel edit"
                                                >
                                                    <XCircle className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        ) : (
                                            <div className="flex justify-end space-x-2">
                                                <Button
                                                    variant="ghost" size="sm"
                                                    onClick={() => handleEdit(tag)}
                                                    disabled={isMutating}
                                                    title="Edit tag"
                                                >
                                                    <Edit className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost" size="sm"
                                                    onClick={() => handleDelete(tag.id, tag.name)}
                                                    disabled={isMutating}
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