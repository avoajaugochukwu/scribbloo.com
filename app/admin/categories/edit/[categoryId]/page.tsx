'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image'; // Import Next Image
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { getCategoryForEdit, updateCategory } from '../../../actions/categories/update'; // Adjust path
import { type Category } from '../../../actions/categories/types'; // Adjust path
import { Constants } from '@/config/constants'; // Import constants

export default function EditCategoryPage() {
    const params = useParams();
    const categoryId = params.categoryId as string;
    const queryClient = useQueryClient();
    const router = useRouter();

    // Local state for form inputs
    const [categoryName, setCategoryName] = useState('');
    const [description, setDescription] = useState('');
    const [seoTitle, setSeoTitle] = useState('');
    const [seoDescription, setSeoDescription] = useState('');
    const [currentSlug, setCurrentSlug] = useState('');
    // --- State for Current Image Paths (from DB) ---
    const [currentHeroPath, setCurrentHeroPath] = useState<string | null>(null);
    const [currentThumbnailPath, setCurrentThumbnailPath] = useState<string | null>(null);
    // --- State for NEW File Uploads ---
    const [newHeroImageFile, setNewHeroImageFile] = useState<File | null>(null);
    const [newThumbnailImageFile, setNewThumbnailImageFile] = useState<File | null>(null);
    // Preview URLs for NEW uploads (optional)
    const [newHeroPreviewUrl, setNewHeroPreviewUrl] = useState<string | null>(null);
    const [newThumbnailPreviewUrl, setNewThumbnailPreviewUrl] = useState<string | null>(null);
    // --- End State ---

    // --- Fetch Category Data ---
    const { data: categoryDetails, isLoading: loadingCategory, error: categoryError } = useQuery<Category | null>({
        queryKey: ['categoryForEdit', categoryId],
        queryFn: () => getCategoryForEdit(categoryId),
        enabled: !!categoryId, // Only run query if categoryId is available
    });

    // --- Effect to populate form state once category data loads ---
    useEffect(() => {
        if (categoryDetails) {
            setCategoryName(categoryDetails.name || '');
            setDescription(categoryDetails.description || '');
            setSeoTitle(categoryDetails.seo_title || '');
            setSeoDescription(categoryDetails.seo_description || '');
            setCurrentSlug(categoryDetails.slug || 'N/A'); // Store slug for display
            // --- Store current image paths ---
            setCurrentHeroPath(categoryDetails.hero_image_url || null); // Assuming url column stores path
            setCurrentThumbnailPath(categoryDetails.thumbnail_image_url || null); // Assuming url column stores path
            // --- Clear new file state when data loads ---
            setNewHeroImageFile(null);
            setNewThumbnailImageFile(null);
            setNewHeroPreviewUrl(null);
            setNewThumbnailPreviewUrl(null);
        }
    }, [categoryDetails]);

    // --- Update Category Mutation ---
    const updateMutation = useMutation({
        mutationFn: updateCategory,
        onSuccess: (result) => {
            if (result.success) {
                alert('Category updated successfully!');
                queryClient.invalidateQueries({ queryKey: ['categoryForEdit', categoryId] });
                queryClient.invalidateQueries({ queryKey: ['categories'] }); // Invalidate list view
                router.push('/admin/categories'); // Navigate back to list on success
            } else {
                alert(`Update failed: ${result.message}`);
            }
        },
        onError: (error) => {
             alert(`Update error: ${error.message}`);
        },
    });

    // --- File Handlers (same as create page) ---
    const handleFileChange = (
        event: React.ChangeEvent<HTMLInputElement>,
        setter: React.Dispatch<React.SetStateAction<File | null>>,
        previewSetter: React.Dispatch<React.SetStateAction<string | null>>
    ) => {
        const file = event.target.files?.[0];
        if (file) {
            setter(file);
            const reader = new FileReader();
            reader.onloadend = () => { previewSetter(reader.result as string); };
            reader.readAsDataURL(file);
        } else {
            setter(null);
            previewSetter(null);
        }
    };
    // --- End File Handlers ---

    // --- Construct Full URLs for Current Images ---
    const getFullImageUrl = (bucket: string, path: string | null): string | null => {
        if (!path) return null;
        // Ensure path doesn't start with a slash if bucket URL already has one
        const cleanPath = path.startsWith('/') ? path.substring(1) : path;
        return `${Constants.SUPABASE_URL}/storage/v1/object/public/${bucket}/${cleanPath}`;
    };
    const currentHeroFullUrl = getFullImageUrl(Constants.SUPABASE_HERO_IMAGES_BUCKET, currentHeroPath);
    const currentThumbnailFullUrl = getFullImageUrl(Constants.SUPABASE_THUMBNAIL_IMAGES_BUCKET, currentThumbnailPath);
    // --- End Construct URLs ---

    // --- Handlers ---
    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const formData = new FormData();
        formData.append('categoryId', categoryId); // Include the ID
        formData.append('categoryName', categoryName.trim());
        formData.append('description', description.trim());
        formData.append('seoTitle', seoTitle.trim());
        formData.append('seoDescription', seoDescription.trim());
        // --- Append NEW Files (if selected) ---
        if (newHeroImageFile) {
            formData.append('heroImageFile', newHeroImageFile);
        }
        if (newThumbnailImageFile) {
            formData.append('thumbnailImageFile', newThumbnailImageFile);
        }
        // --- End Append Files ---
        updateMutation.mutate(formData);
    };

    // --- Loading & Error States ---
    const isLoading = loadingCategory || updateMutation.isPending;

    if (loadingCategory) return <p className="p-4 text-center">Loading category details...</p>;
    if (categoryError) return <p className="p-4 text-center text-red-600">Error loading category data: {categoryError.message}</p>;
    if (!categoryDetails && !loadingCategory) { // Check after loading is complete
        return <p className="p-4 text-center text-red-600">Category not found.</p>;
    }

    return (
        <div className="container mx-auto px-4 py-8 max-w-3xl">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Edit Category</h1>
                <Button variant="outline" size="sm" asChild>
                    <Link href="/admin/categories">Back to Categories List</Link>
                </Button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-lg shadow">
                {/* Display Slug (Non-Editable) */}
                 <div>
                    <Label>Slug (Auto-generated, cannot be changed here)</Label>
                    <Input
                        type="text"
                        value={currentSlug}
                        disabled // Make it visually disabled
                        readOnly // Prevent editing
                        className="mt-1 bg-gray-100 cursor-not-allowed"
                    />
                </div>

                {/* Category Name */}
                <div>
                    <Label htmlFor="categoryName">Category Name*</Label>
                    <Input
                        id="categoryName"
                        type="text"
                        value={categoryName}
                        onChange={(e) => setCategoryName(e.target.value)}
                        placeholder="Enter category name"
                        required
                        disabled={isLoading}
                        className="mt-1"
                    />
                </div>

                {/* Description */}
                <div>
                    <Label htmlFor="description">Description*</Label>
                    <Textarea
                        id="description"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Enter category description"
                        required
                        disabled={isLoading}
                        className="mt-1"
                        rows={3}
                    />
                </div>

                {/* SEO Title */}
                <div>
                    <Label htmlFor="seoTitle">SEO Title*</Label>
                    <Input
                        id="seoTitle"
                        type="text"
                        value={seoTitle}
                        onChange={(e) => setSeoTitle(e.target.value)}
                        placeholder="Enter SEO title"
                        required
                        disabled={isLoading}
                        className="mt-1"
                    />
                </div>

                {/* SEO Description */}
                <div>
                    <Label htmlFor="seoDescription">SEO Description*</Label>
                    <Textarea
                        id="seoDescription"
                        value={seoDescription}
                        onChange={(e) => setSeoDescription(e.target.value)}
                        placeholder="Enter SEO description"
                        required
                        disabled={isLoading}
                        className="mt-1"
                        rows={2}
                    />
                </div>

                {/* --- Hero Image Upload --- */}
                <div>
                  <Label htmlFor="heroImageFile">Hero Image (Upload new to replace)</Label>
                  {/* Display Current Hero Image */}
                  {currentHeroFullUrl && !newHeroPreviewUrl && (
                      <div className="my-2 p-2 border rounded inline-block">
                          <Image src={currentHeroFullUrl} alt="Current Hero" width={200} height={120} className="object-contain rounded" />
                          <p className="text-xs text-center text-gray-500 mt-1">Current</p>
                      </div>
                  )}
                  {/* Display New Hero Preview */}
                   {newHeroPreviewUrl && (
                    <div className="my-2 p-2 border rounded inline-block border-blue-500">
                      <img src={newHeroPreviewUrl} alt="New Hero preview" className="max-h-40 rounded" />
                       <p className="text-xs text-center text-blue-600 mt-1">New</p>
                    </div>
                  )}
                  <Input
                    id="heroImageFile"
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileChange(e, setNewHeroImageFile, setNewHeroPreviewUrl)}
                    // Not required for edit
                    disabled={isLoading}
                    className="mt-1 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-violet-50 file:text-violet-700 hover:file:bg-violet-100"
                  />
                  <p className="text-xs text-gray-500 mt-1">Upload a new image if you want to replace the current one.</p>
                </div>
                {/* --- End Hero Image Upload --- */}

                {/* --- Thumbnail Image Upload --- */}
                <div>
                  <Label htmlFor="thumbnailImageFile">Thumbnail Image (Upload new to replace)</Label>
                   {/* Display Current Thumbnail Image */}
                  {currentThumbnailFullUrl && !newThumbnailPreviewUrl && (
                      <div className="my-2 p-2 border rounded inline-block">
                          <Image src={currentThumbnailFullUrl} alt="Current Thumbnail" width={100} height={100} className="object-contain rounded" />
                           <p className="text-xs text-center text-gray-500 mt-1">Current</p>
                      </div>
                  )}
                   {/* Display New Thumbnail Preview */}
                   {newThumbnailPreviewUrl && (
                    <div className="my-2 p-2 border rounded inline-block border-blue-500">
                      <img src={newThumbnailPreviewUrl} alt="New Thumbnail preview" className="max-h-24 rounded" />
                       <p className="text-xs text-center text-blue-600 mt-1">New</p>
                    </div>
                  )}
                  <Input
                    id="thumbnailImageFile"
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileChange(e, setNewThumbnailImageFile, setNewThumbnailPreviewUrl)}
                    // Not required for edit
                    disabled={isLoading}
                    className="mt-1 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-violet-50 file:text-violet-700 hover:file:bg-violet-100"
                  />
                  <p className="text-xs text-gray-500 mt-1">Upload a new image if you want to replace the current one.</p>
                </div>
                {/* --- End Thumbnail Image Upload --- */}

                {/* Submit Button */}
                <div className="flex justify-end pt-4">
                    <Button type="submit" disabled={isLoading} className="w-full sm:w-auto">
                        {updateMutation.isPending ? 'Updating...' : 'Update Category'}
                    </Button>
                </div>
            </form>
        </div>
    );
} 