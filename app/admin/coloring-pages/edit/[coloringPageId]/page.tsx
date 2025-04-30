'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image'; // For displaying current image
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea'; // Import Textarea
import { getColoringPageForEdit } from '../../../actions/coloring-pages/read'; // getImageForEdit is here
import { updateColoringPage } from '../../../actions/coloring-pages/update'; // updateImage is here
import { getCategories } from '../../../actions/categories/read'; // getCategories is here
import { getTags } from '../../../actions/tags/read'; // getTags is here
import Category from '@/types/category.type';
import Tag from '@/types/tag.type';
import { Constants } from '@/config/constants';
import { toast } from 'sonner';

export default function EditImagePage() {
    const params = useParams();
    const coloringPageId = params.coloringPageId as string;
    const queryClient = useQueryClient();

    // Local state for form inputs based on fetched data
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState(''); // <-- Add state for description
    const [selectedCategoryIds, setSelectedCategoryIds] = useState<Set<string>>(new Set());
    const [selectedTagIds, setSelectedTagIds] = useState<Set<string>>(new Set());

    // --- Fetch Image Data ---
    const { data: imageDetails, isLoading: loadingImage, error: imageError } = useQuery({
        queryKey: ['coloringPageForEdit', coloringPageId],
        queryFn: () => getColoringPageForEdit(coloringPageId),
        enabled: !!coloringPageId,
    });

    // --- Fetch Available Categories/Tags ---
    const { data: availableCategories = [], isLoading: loadingCategories } = useQuery<Category[], Error>({
        queryKey: ['availableCategories'],
        queryFn: getCategories,
    });
    const { data: availableTags = [], isLoading: loadingTags } = useQuery<Tag[], Error>({
        queryKey: ['availableTags'],
        queryFn: getTags,
    });

    // --- Effect to populate form state once image data loads ---
    useEffect(() => {
        if (imageDetails) {
            setTitle(imageDetails.title || '');
            setDescription(imageDetails.description || ''); // <-- Populate description state
            setSelectedCategoryIds(new Set(imageDetails.categoryIds));
            setSelectedTagIds(new Set(imageDetails.tagIds));
        }
    }, [imageDetails]); // Re-run when imageDetails changes

    // --- Update Image Mutation ---
    const updateMutation = useMutation({
        mutationFn: updateColoringPage,
        onSuccess: (result) => {
            if (result.success) {
                toast.success('Coloring page updated successfully!');
                queryClient.invalidateQueries({ queryKey: ['coloringPageForEdit', coloringPageId] });
                queryClient.invalidateQueries({ queryKey: ['adminColoringPages'] });
            } else {
                toast.error(`Update failed: ${result.message}`);
            }
        },
        onError: (error) => {
            toast.error(`Update error: ${error.message}`);
        },
    });

    // --- Handlers ---
    const handleCategoryChange = (categoryId: string, checked: boolean | 'indeterminate') => {
        setSelectedCategoryIds(prev => {
            const newSet = new Set(prev);
            if (checked === true) newSet.add(categoryId); else newSet.delete(categoryId);
            return newSet;
        });
    };
    const handleTagChange = (tagId: string, checked: boolean | 'indeterminate') => {
        setSelectedTagIds(prev => {
            const newSet = new Set(prev);
            if (checked === true) newSet.add(tagId); else newSet.delete(tagId);
            return newSet;
        });
    };

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const formData = new FormData();
        formData.append('coloringPageId', coloringPageId);
        formData.append('title', title);
        formData.append('description', description); // <-- Append description
        selectedCategoryIds.forEach(id => formData.append('categoryIds', id));
        selectedTagIds.forEach(id => formData.append('tagIds', id));
        updateMutation.mutate(formData);
    };

    // --- Loading & Error States ---
    const isLoading = loadingImage || loadingCategories || loadingTags || updateMutation.isPending;

    // Construct image URL
    const currentImageUrl = Constants.SUPABASE_COLORING_PAGES_BUCKET_URL + imageDetails?.image_url;

    if (loadingImage) return <p>Loading image details...</p>; // Separate loading for initial image fetch
    if (imageError) return <p>Error loading image data: {imageError.message}</p>;
    if (!imageDetails) {
        return <p>Coloring page not found.</p>;
    }

    return (
        <div className="container mx-auto px-4 py-8 max-w-3xl">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Edit Coloring Page</h1>
                <Button variant="outline" size="sm" asChild>
                    <Link href="/admin">Back to Admin List</Link>
                </Button>
            </div>

            {/* Display Current Image */}
            {currentImageUrl && (
                 <div className="mb-6 p-4 border rounded-md bg-gray-50 flex justify-center">
                    <Image
                        src={currentImageUrl}
                        alt={imageDetails.title || 'Current image'}
                        width={1400}
                        height={1400}
                        className="object-contain rounded h-auto w-1/2"
                    />
                </div>
            )}
             {!currentImageUrl && (
                 <p className="mb-6 text-center text-gray-500 italic">No image preview available.</p>
             )}


            <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-lg shadow">
                 {/* Hidden input for ID - not strictly needed if passed in submit handler, but can be useful */}
                 {/* <input type="hidden" name="imageId" value={imageId} /> */}

                {/* Title Input */}
                <div>
                    <Label htmlFor="title">Title</Label>
                    <Input
                        id="title"
                        name="title"
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="Image title (optional)"
                        disabled={isLoading}
                        className="mt-1"
                    />
                </div>

                {/* Description Textarea */}
                <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                        id="description"
                        name="description"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Image description (optional)"
                        disabled={isLoading}
                        className="mt-1"
                        rows={4} // Adjust as needed
                    />
                </div>

                {/* Categories Selection */}
                {availableCategories.length > 0 && (
                    <fieldset className="space-y-2 border p-4 rounded-md">
                        <legend className="text-lg font-semibold mb-2">Categories</legend>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                            {availableCategories.map((category) => (
                                <div key={category.id} className="flex items-center space-x-2">
                                    <Checkbox
                                        id={`category-${category.id}`}
                                        checked={selectedCategoryIds.has(category.id)}
                                        onCheckedChange={(checked) => handleCategoryChange(category.id, checked)}
                                        disabled={isLoading}
                                    />
                                    <Label htmlFor={`category-${category.id}`} className="cursor-pointer">
                                        {category.name}
                                    </Label>
                                </div>
                            ))}
                        </div>
                    </fieldset>
                )}
                 {availableCategories.length === 0 && (
                     <p className="text-sm text-gray-500 italic">No categories available.</p>
                 )}


                {/* Tags Selection */}
                {availableTags.length > 0 && (
                    <fieldset className="space-y-2 border p-4 rounded-md">
                        <legend className="text-lg font-semibold mb-2">Tags</legend>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                            {availableTags.map((tag) => (
                                <div key={tag.id} className="flex items-center space-x-2">
                                    <Checkbox
                                        id={`tag-${tag.id}`}
                                        checked={selectedTagIds.has(tag.id)}
                                        onCheckedChange={(checked) => handleTagChange(tag.id, checked)}
                                        disabled={isLoading}
                                    />
                                    <Label htmlFor={`tag-${tag.id}`} className="cursor-pointer">
                                        {tag.name}
                                    </Label>
                                </div>
                            ))}
                        </div>
                    </fieldset>
                )}
                 {availableTags.length === 0 && (
                     <p className="text-sm text-gray-500 italic">No tags available.</p>
                 )}


                {/* Submit Button */}
                <Button type="submit" disabled={isLoading} className="w-full">
                    {updateMutation.isPending ? 'Updating...' : 'Update Image Details'}
                </Button>
            </form>
        </div>
    );
} 