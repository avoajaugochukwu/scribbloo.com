'use client';
/* eslint-disable @typescript-eslint/no-explicit-any */
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
import Category from '@/types/category.type';
import { Constants } from '@/config/constants'; // Import constants
import { toast } from 'sonner'; // Assuming sonner for toasts
import { Skeleton } from '@/components/ui/skeleton'; // For loading state

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
    const [seoMetaDescription, setSeoMetaDescription] = useState(''); // <-- Add state
    const [currentSlug, setCurrentSlug] = useState('');
    // --- State for Current Image Paths (from DB) ---
    const [currentHeroPath, setCurrentHeroPath] = useState<string | null>(null);
    const [currentThumbnailPath, setCurrentThumbnailPath] = useState<string | null>(null);
    // --- State for NEW File Uploads ---
    const [newHeroImageFile, setNewHeroImageFile] = useState<File | null>(null);
    const [newThumbnailImageFile, setNewThumbnailImageFile] = useState<File | null>(null);
    const [newHeroPreviewUrl, setNewHeroPreviewUrl] = useState<string | null>(null);
    const [newThumbnailPreviewUrl, setNewThumbnailPreviewUrl] = useState<string | null>(null);
    // --- End File State ---

    // Fetch category data
    const { data: categoryData, isLoading: isQueryLoading, error: queryError } = useQuery<Category | null>({
        queryKey: ['category', categoryId],
        queryFn: () => getCategoryForEdit(categoryId),
        enabled: !!categoryId, // Only run query if categoryId is available
        staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    });

    // Update local state when category data loads
    useEffect(() => {
        if (categoryData) {
            setCategoryName(categoryData.name || '');
            setDescription(categoryData.description || '');
            setSeoTitle(categoryData.seo_title || '');
            setSeoDescription(categoryData.seo_description || '');
            setSeoMetaDescription(categoryData.seo_meta_description || ''); // <-- Populate state
            setCurrentSlug(categoryData.slug || '');
            setCurrentHeroPath(categoryData.hero_image || null);
            setCurrentThumbnailPath(categoryData.thumbnail_image || null);
        }
    }, [categoryData]);

    // Mutation for updating the category
    const updateMutation = useMutation({
        mutationFn: (formData: FormData) => updateCategory(categoryId as string, formData),
        onSuccess: (data) => {
            if (data.success) {
                toast.success(data.message);
                // Invalidate specific category query and the list query
                queryClient.invalidateQueries({ queryKey: ['category', categoryId] });
                queryClient.invalidateQueries({ queryKey: ['categories'] });
                router.push('/admin/categories'); // Redirect on success
            } else {
                toast.error(`Update failed: ${data.message}`);
            }
        },
        onError: (error: any) => {
             console.error("Mutation error:", error);
             toast.error(`An unexpected error occurred: ${error.message || 'Unknown error'}`);
        },
    });

    // --- File Handlers ---
     const handleFileChange = (
        event: React.ChangeEvent<HTMLInputElement>,
        setter: React.Dispatch<React.SetStateAction<File | null>>,
        previewSetter: React.Dispatch<React.SetStateAction<string | null>>
    ) => {
        const file = event.target.files?.[0];
        if (file) {
            setter(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                previewSetter(reader.result as string);
            };
            reader.readAsDataURL(file);
        } else {
            // Don't clear state if user cancels file selection, only if they submit without a file
            // setter(null); // Optional: clear if you want immediate feedback on cancel
            // previewSetter(null);
        }
    };
    // --- End File Handlers ---


    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        // Client-side validation
        const trimmedName = categoryName.trim();
        const trimmedDesc = description.trim();
        const trimmedSeoTitle = seoTitle.trim();
        const trimmedSeoDesc = seoDescription.trim();
        const trimmedSeoMetaDesc = seoMetaDescription.trim();

        // Add trimmedSeoMetaDesc to validation if required
        if (!trimmedName || !trimmedDesc || !trimmedSeoTitle || !trimmedSeoDesc /* || !trimmedSeoMetaDesc */) {
            toast.error('Please fill in all required text fields.');
            return;
        }
        // Files are optional for update

        const formData = new FormData();
        formData.append('categoryId', categoryId); // Crucial for update action
        formData.append('categoryName', trimmedName);
        formData.append('description', trimmedDesc);
        formData.append('seoTitle', trimmedSeoTitle);
        formData.append('seoDescription', trimmedSeoDesc);
        formData.append('seoMetaDescription', trimmedSeoMetaDesc);

        // Always keep images unless explicitly replacing them
        formData.append('keepThumbnail', currentThumbnailPath ? 'true' : 'false');
        formData.append('keepHero', currentHeroPath ? 'true' : 'false');

        // Only append files if new ones selected
        if (newHeroImageFile) {
            formData.append('heroFile', newHeroImageFile);
        }
        if (newThumbnailImageFile) {
            formData.append('thumbnailFile', newThumbnailImageFile);
        }

        updateMutation.mutate(formData);
    };

    const isLoading = updateMutation.isPending || isQueryLoading;

    // Handle Loading and Error States for Query
    if (isQueryLoading) {
        return (
             <div className="max-w-2xl mx-auto p-4 md:p-6">
                <div className="flex justify-between items-center mb-6">
                    <Skeleton className="h-8 w-48" />
                    <Skeleton className="h-9 w-20" />
                </div>
                 <div className="space-y-6">
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-24 w-full" />
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-20 w-full" />
                    <Skeleton className="h-20 w-full" /> {/* Placeholder for new field */}
                    <Skeleton className="h-40 w-full" />
                    <Skeleton className="h-32 w-full" />
                    <div className="flex justify-end pt-4">
                        <Skeleton className="h-10 w-32" />
                    </div>
                 </div>
            </div>
        );
    }

    if (queryError) {
         return (
             <div className="max-w-2xl mx-auto p-4 md:p-6 text-center">
                 <p className="text-red-600">Error loading category data: {queryError.message}</p>
                 <Button variant="outline" size="sm" asChild className="mt-4">
                    <Link href="/admin/categories">Back to Categories</Link>
                 </Button>
             </div>
        );
    }
     if (!categoryData) {
         return (
             <div className="max-w-2xl mx-auto p-4 md:p-6 text-center">
                 <p className="text-muted-foreground">Category not found.</p>
                  <Button variant="outline" size="sm" asChild className="mt-4">
                    <Link href="/admin/categories">Back to Categories</Link>
                 </Button>
             </div>
        );
    }


    // Construct full image URLs for display
    const heroImageUrl = currentHeroPath ? `${Constants.SUPABASE_HERO_IMAGES_BUCKET_URL}${currentHeroPath}` : null;
    const thumbnailImageUrl = currentThumbnailPath ? `${Constants.SUPABASE_THUMBNAIL_IMAGES_BUCKET_URL}${currentThumbnailPath}` : null;


    return (
        <div className="max-w-2xl mx-auto p-4 md:p-6">
             <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Edit Category: {categoryData?.name}</h1>
                 <Button variant="outline" size="sm" asChild>
                    <Link href="/admin/categories">Cancel</Link>
                 </Button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Category Name */}
                <div>
                    <Label htmlFor="categoryName">Category Name*</Label>
                    <Input
                        id="categoryName"
                        type="text"
                        value={categoryName}
                        onChange={(e) => setCategoryName(e.target.value)}
                        placeholder="e.g., Unicorn Coloring Pages"
                        required
                        disabled={isLoading}
                        className="mt-1"
                    />
                </div>

                 {/* Slug (Display Only) */}
                 <div>
                    <Label>Current Slug</Label>
                    <Input
                        type="text"
                        value={currentSlug}
                        readOnly
                        disabled
                        className="mt-1 bg-gray-100"
                    />
                     <p className="text-xs text-gray-500 mt-1">Slug is automatically generated from the name on save if the name changes.</p>
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
                     <p className="text-xs text-gray-500 mt-1">Keep concise and keyword-rich.</p>
                </div>

                {/* SEO Description (for OG/Twitter) */}
                <div>
                    <Label htmlFor="seoDescription">SEO Description (for Social Sharing)*</Label>
                    <Textarea
                        id="seoDescription"
                        value={seoDescription}
                        onChange={(e) => setSeoDescription(e.target.value)}
                        placeholder="Enter SEO description for social media previews"
                        required
                        disabled={isLoading}
                        className="mt-1"
                        rows={2}
                    />
                     <p className="text-xs text-gray-500 mt-1">~155 characters. Used for Facebook, Twitter etc.</p>
                </div>

                 {/* SEO Meta Description (for Google Search Results) */}
                <div>
                    <Label htmlFor="seoMetaDescription">SEO Meta Description (for Google)*</Label>
                    <Textarea
                        id="seoMetaDescription"
                        value={seoMetaDescription}
                        onChange={(e) => setSeoMetaDescription(e.target.value)} // <-- Set state
                        placeholder="Enter meta description for Google search results"
                        // required // Make required if needed
                        disabled={isLoading}
                        className="mt-1"
                        rows={2}
                    />
                    <p className="text-xs text-gray-500 mt-1">~160 characters. This appears in Google search snippets.</p>
                </div>


                {/* --- Hero Image Upload --- */}
                <div>
                  <Label htmlFor="heroImageFile">Hero Image</Label>
                   {/* Display Current Hero Image */}
                   {heroImageUrl ? (
                    <div className="my-2">
                       <p className="text-sm font-medium mb-1">Current:</p>
                       <Image // Use Next Image for optimization
                          src={heroImageUrl}
                          alt="Current Hero"
                          width={300} // Adjust width as needed
                          height={180} // Adjust height based on aspect ratio
                          className="max-h-40 w-auto rounded border object-contain"
                          priority // Prioritize if it's important LCP
                       />
                    </div>
                  ) : (
                     <p className="text-sm text-muted-foreground my-2">No current hero image.</p>
                  )}
                   {/* Display New Hero Preview */}
                   {newHeroPreviewUrl && (
                    <div className="my-2 p-2 border rounded inline-block border-blue-500">
                       <p className="text-sm font-medium mb-1 text-blue-600">New Preview:</p>
                      <img src={newHeroPreviewUrl} alt="New Hero preview" className="max-h-40 rounded" />
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
                  <Label htmlFor="thumbnailImageFile">Thumbnail Image</Label>
                   {/* Display Current Thumbnail Image */}
                   {thumbnailImageUrl ? (
                     <div className="my-2">
                       <p className="text-sm font-medium mb-1">Current:</p>
                       <Image
                          src={thumbnailImageUrl}
                          alt="Current Thumbnail"
                          width={100} // Smaller size for thumbnail
                          height={100}
                          className="max-h-24 w-auto rounded border object-contain"
                       />
                    </div>
                  ) : (
                     <p className="text-sm text-muted-foreground my-2">No current thumbnail image.</p>
                  )}
                   {/* Display New Thumbnail Preview */}
                   {newThumbnailPreviewUrl && (
                    <div className="my-2 p-2 border rounded inline-block border-blue-500">
                       <p className="text-sm font-medium mb-1 text-blue-600">New Preview:</p>
                      <img src={newThumbnailPreviewUrl} alt="New Thumbnail preview" className="max-h-24 rounded" />
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