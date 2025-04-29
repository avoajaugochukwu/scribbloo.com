'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { getCategoryForEdit, updateCategory } from '../../../actions/categories/update'; // Adjust path
import { type Category } from '../../../actions/categories/types'; // Adjust path

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
    const [heroImageUrl, setHeroImageUrl] = useState('');
    const [thumbnailImageUrl, setThumbnailImageUrl] = useState('');
    const [currentSlug, setCurrentSlug] = useState(''); // To display the non-editable slug

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
            setHeroImageUrl(categoryDetails.hero_image_url || '');
            setThumbnailImageUrl(categoryDetails.thumbnail_image_url || '');
            setCurrentSlug(categoryDetails.slug || 'N/A'); // Store slug for display
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

    // --- Handlers ---
    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const formData = new FormData();
        formData.append('categoryId', categoryId); // Include the ID
        formData.append('categoryName', categoryName.trim());
        formData.append('description', description.trim());
        formData.append('seoTitle', seoTitle.trim());
        formData.append('seoDescription', seoDescription.trim());
        formData.append('heroImageUrl', heroImageUrl.trim());
        formData.append('thumbnailImageUrl', thumbnailImageUrl.trim());
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

                {/* Hero Image URL */}
                <div>
                    <Label htmlFor="heroImageUrl">Hero Image URL*</Label>
                    <Input
                        id="heroImageUrl"
                        type="url"
                        value={heroImageUrl}
                        onChange={(e) => setHeroImageUrl(e.target.value)}
                        placeholder="Paste Hero Image URL"
                        required
                        disabled={isLoading}
                        className="mt-1"
                    />
                    <p className="text-xs text-gray-500 mt-1">Upload image to storage first, then paste the public URL here.</p>
                </div>

                {/* Thumbnail Image URL */}
                <div>
                    <Label htmlFor="thumbnailImageUrl">Thumbnail Image URL*</Label>
                    <Input
                        id="thumbnailImageUrl"
                        type="url"
                        value={thumbnailImageUrl}
                        onChange={(e) => setThumbnailImageUrl(e.target.value)}
                        placeholder="Paste Thumbnail Image URL"
                        required
                        disabled={isLoading}
                        className="mt-1"
                    />
                    <p className="text-xs text-gray-500 mt-1">Upload image to storage first, then paste the public URL here.</p>
                </div>

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