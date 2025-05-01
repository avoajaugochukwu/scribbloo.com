'use client';

import { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image'; // For displaying current image
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea'; // Import Textarea
import { getColoringPageForEdit } from '../../../actions/coloring-pages/read'; // getImageForEdit is here
import { updateColoringPage } from '../../../actions/coloring-pages/update'; // updateImage is here
import { deleteColoringPage } from '../../../actions/coloring-pages/delete'; // Import delete action
import { getCategories } from '../../../actions/categories/read'; // getCategories is here
import { getTags } from '../../../actions/tags/read'; // getTags is here
import Category from '@/types/category.type';
import Tag from '@/types/tag.type';
import { Constants } from '@/config/constants';
import { toast } from 'sonner';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog" // Import AlertDialog components

export default function EditImagePage() {
    const params = useParams();
    const router = useRouter(); // Get router instance
    const coloringPageId = params.coloringPageId as string;
    const queryClient = useQueryClient();
    const fileInputRef = useRef<HTMLInputElement>(null); // Ref for file input

    // Local state for form inputs based on fetched data
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState(''); // <-- Add state for description
    const [selectedCategoryIds, setSelectedCategoryIds] = useState<Set<string>>(new Set());
    const [selectedTagIds, setSelectedTagIds] = useState<Set<string>>(new Set());
    const [selectedFile, setSelectedFile] = useState<File | null>(null); // State for the new image file
    const [previewUrl, setPreviewUrl] = useState<string | null>(null); // State for new image preview URL

    // --- Fetch Image Data ---
    const { data: imageDetails, isLoading: loadingImage, error: imageError, refetch: refetchImageDetails } = useQuery({
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
            // Don't reset file/preview here, only on initial load
        }
    }, [imageDetails]); // Re-run when imageDetails changes

    // --- Effect to create/revoke preview URL ---
    useEffect(() => {
        if (!selectedFile) {
            setPreviewUrl(null);
            return;
        }
        const objectUrl = URL.createObjectURL(selectedFile);
        setPreviewUrl(objectUrl);
        // Free memory when the component unmounts or file changes
        return () => URL.revokeObjectURL(objectUrl);
    }, [selectedFile]);

    // --- Update Image Mutation ---
    const updateMutation = useMutation({
        mutationFn: updateColoringPage,
        onSuccess: (result) => {
            if (result.success) {
                toast.success('Coloring page updated successfully!');
                queryClient.invalidateQueries({ queryKey: ['coloringPageForEdit', coloringPageId] });
                queryClient.invalidateQueries({ queryKey: ['adminColoringPages'] });
                // Reset file input state after successful upload
                setSelectedFile(null);
                if (fileInputRef.current) {
                    fileInputRef.current.value = ''; // Clear the file input visually
                }
                // Refetch image details to show the potentially updated image URL
                refetchImageDetails();
            } else {
                toast.error(`Update failed: ${result.message}`);
            }
        },
        onError: (error) => {
            toast.error(`Update error: ${error.message}`);
        },
    });

    // --- Delete Image Mutation ---
    const deleteMutation = useMutation({
        mutationFn: deleteColoringPage,
        onSuccess: (result) => {
            if (result.success) {
                toast.success('Coloring page deleted successfully!');
                queryClient.invalidateQueries({ queryKey: ['adminColoringPages'] }); // Invalidate list
                queryClient.removeQueries({ queryKey: ['coloringPageForEdit', coloringPageId] }); // Remove specific item cache
                router.push('/admin'); // Redirect to admin list
            } else {
                toast.error(`Deletion failed: ${result.message}`);
            }
        },
        onError: (error) => {
            toast.error(`Deletion error: ${error.message}`);
        },
    });

    // --- Handlers ---
    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && event.target.files[0]) {
            setSelectedFile(event.target.files[0]);
        } else {
            setSelectedFile(null);
        }
    };
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

        // Append the file ONLY if one is selected
        if (selectedFile) {
            formData.append('imageFile', selectedFile);
        }

        updateMutation.mutate(formData);
    };

    const handleDelete = () => {
        deleteMutation.mutate(coloringPageId);
    };

    // --- Loading & Error States ---
    const isLoading = loadingImage || loadingCategories || loadingTags || updateMutation.isPending || deleteMutation.isPending;

    // Construct current image URL (use optional chaining)
    const currentImageUrl = imageDetails?.image_url
        ? Constants.SUPABASE_COLORING_PAGES_BUCKET_URL + imageDetails.image_url
        : null;

    if (loadingImage) return <p>Loading image details...</p>;
    if (imageError) return <p>Error loading image data: {imageError.message}</p>;
    if (!imageDetails) {
        return <p>Coloring page not found.</p>;
    }

    return (
        <div className="container mx-auto px-4 py-8 max-w-3xl">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Edit Coloring Page</h1>
                <div className="flex gap-2">
                     {/* Delete Button with Confirmation */}
                     <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <Button variant="destructive" size="sm" disabled={isLoading}>Delete</Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                                This action cannot be undone. This will permanently delete the coloring page
                                and its associated image files from storage.
                            </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                            <AlertDialogCancel disabled={deleteMutation.isPending}>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                                onClick={handleDelete}
                                disabled={deleteMutation.isPending}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                                {deleteMutation.isPending ? 'Deleting...' : 'Yes, delete it'}
                            </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>

                    <Button variant="outline" size="sm" asChild>
                        <Link href="/admin">Back to Admin List</Link>
                    </Button>
                </div>
            </div>

            {/* Form starts here, wrapping Title, Image, and other inputs */}
            <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-lg shadow">

                {/* == Title Input - Moved Here == */}
                <div>
                    <Label htmlFor="title">Title</Label>
                    <Input
                        id="title"
                        name="title"
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="Coloring page title" // Updated placeholder
                        required // Make title required if necessary
                        disabled={isLoading}
                        className="mt-1"
                    />
                </div>

                {/* == Display Preview or Current Image - Now After Title == */}
                <div className="p-4 border rounded-md bg-gray-50 flex flex-col items-center">
                    <Label className="mb-2 text-sm font-medium text-gray-600">
                        {previewUrl ? 'New Image Preview:' : 'Current Image:'}
                    </Label>
                    {previewUrl ? (
                        <Image
                            src={previewUrl}
                            alt="New image preview"
                            width={400} // Adjust size as needed
                            height={400}
                            className="object-contain rounded max-h-80 w-auto" // Limit height
                        />
                    ) : currentImageUrl ? (
                        <Image
                            src={currentImageUrl}
                            alt={imageDetails.title || 'Current image'}
                            width={400} // Adjust size as needed
                            height={400}
                            className="object-contain rounded max-h-80 w-auto" // Limit height
                            // Add error handling for Image component if needed
                            onError={(e) => console.error("Error loading current image:", e)}
                        />
                    ) : (
                        <p className="text-center text-gray-500 italic">No image preview available.</p>
                    )}
                </div>

                {/* == File Input for Replacing Image == */}
                <div>
                    <Label htmlFor="imageFile">Replace Image (Optional)</Label>
                    <Input
                        id="imageFile"
                        name="imageFile" // Name should match what server action expects
                        type="file"
                        accept="image/*" // Accept only image files
                        onChange={handleFileChange}
                        disabled={isLoading}
                        ref={fileInputRef} // Assign ref
                        className="mt-1 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
                    />
                    {selectedFile && (
                         <Button
                             type="button"
                             variant="ghost"
                             size="sm"
                             onClick={() => {
                                 setSelectedFile(null);
                                 if (fileInputRef.current) fileInputRef.current.value = '';
                             }}
                             className="mt-1 text-xs text-muted-foreground"
                             disabled={isLoading}
                         >
                             Clear selection
                         </Button>
                     )}
                    <p className="mt-1 text-xs text-gray-500">Select a new image file if you want to replace the current one.</p>
                </div>

                {/* == Description Textarea == */}
                <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                        id="description"
                        name="description"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Coloring page description (optional)"
                        disabled={isLoading}
                        className="mt-1"
                        rows={4}
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
                 {availableCategories.length === 0 && !loadingCategories && ( // Show only if not loading
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
                 {availableTags.length === 0 && !loadingTags && ( // Show only if not loading
                     <p className="text-sm text-gray-500 italic">No tags available.</p>
                 )}

                {/* Submit Button */}
                <Button type="submit" disabled={isLoading} className="w-full">
                    {updateMutation.isPending ? 'Updating...' : 'Update Coloring Page'}
                </Button>
            </form> {/* Form ends here */}
        </div>
    );
} 