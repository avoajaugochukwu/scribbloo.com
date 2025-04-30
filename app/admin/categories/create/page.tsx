'use client';

import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation'; // Import useRouter for navigation
import Link from 'next/link';
import { createCategory } from '../../actions/categories/create'; // Adjusted path
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner'; // Assuming you use sonner for toasts

export default function CreateCategoryPage() {
  const queryClient = useQueryClient();
  const router = useRouter(); // Initialize router
  const [categoryName, setCategoryName] = useState('');
  const [description, setDescription] = useState('');
  const [seoTitle, setSeoTitle] = useState('');
  const [seoDescription, setSeoDescription] = useState('');
  const [seoMetaDescription, setSeoMetaDescription] = useState(''); // <-- Add state for new field
  // --- State for File Uploads ---
  const [heroImageFile, setHeroImageFile] = useState<File | null>(null);
  const [thumbnailImageFile, setThumbnailImageFile] = useState<File | null>(null);
  const [heroPreviewUrl, setHeroPreviewUrl] = useState<string | null>(null);
  const [thumbnailPreviewUrl, setThumbnailPreviewUrl] = useState<string | null>(null);
  // --- End File State ---

  const createMutation = useMutation({
    mutationFn: createCategory,
    onSuccess: (data) => {
      if (data.success) {
        toast.success(data.message);
        queryClient.invalidateQueries({ queryKey: ['categories'] }); // Invalidate cache
        router.push('/admin/categories'); // Redirect on success
      } else {
        toast.error(`Creation failed: ${data.message}`);
      }
    },
    onError: (error: Error) => {
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
      // Create object URL for preview
      const reader = new FileReader();
      reader.onloadend = () => {
        previewSetter(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setter(null);
      previewSetter(null); // Clear preview if no file selected
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
    const trimmedSeoMetaDesc = seoMetaDescription.trim(); // <-- Trim new field

    // Add trimmedSeoMetaDesc to validation if required
    if (!trimmedName || !trimmedDesc || !trimmedSeoTitle || !trimmedSeoDesc /* || !trimmedSeoMetaDesc */) {
      toast.error('Please fill in all required text fields.'); // Use toast for feedback
      return;
    }
    // --- Validate File Inputs ---
    if (!heroImageFile) {
      toast.error('Hero Image is required.');
      return;
    }
    if (!thumbnailImageFile) {
      toast.error('Thumbnail Image is required.');
      return;
    }
    // --- End File Validation ---

    const formData = new FormData();
    formData.append('categoryName', trimmedName);
    formData.append('description', trimmedDesc);
    formData.append('seoTitle', trimmedSeoTitle);
    formData.append('seoDescription', trimmedSeoDesc);
    formData.append('seoMetaDescription', trimmedSeoMetaDesc); // <-- Append new field
    // --- Append Files ---
    // Ensure files are not null before appending (already checked above, but good practice)
    if (heroImageFile) formData.append('heroImageFile', heroImageFile);
    if (thumbnailImageFile) formData.append('thumbnailImageFile', thumbnailImageFile);
    // --- End Append Files ---

    createMutation.mutate(formData);
  };

  const isLoading = createMutation.isPending;

  return (
    <div className="max-w-2xl mx-auto p-4 md:p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Create New Category</h1>
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
            placeholder="e.g., Unicorn"
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
            placeholder="Enter category description (visible on category page)"
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
            placeholder="Enter SEO title (for search results & browser tab)"
            required
            disabled={isLoading}
            className="mt-1"
          />
           <p className="text-xs text-gray-500 mt-1">Keep concise and keyword-rich (e.g., &quot;Free Unicorn Coloring Pages&quot;).</p>
        </div>

        {/* SEO Description (for OG/Twitter) */}
        <div>
          <Label htmlFor="seoDescription">SEO Description (for Social Sharing)*</Label>
          <Textarea
            id="seoDescription"
            value={seoDescription}
            onChange={(e) => setSeoDescription(e.target.value)}
            placeholder="Enter SEO description for social media previews (Open Graph/Twitter)"
            required
            disabled={isLoading}
            className="mt-1"
            rows={2}
          />
           <p className="text-xs text-gray-500 mt-1">~155 characters. Used for Facebook, Twitter etc. previews.</p>
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
          <Label htmlFor="heroImageFile">Hero Image*</Label>
          <Input
            id="heroImageFile"
            type="file"
            accept="image/*" // Suggest image files
            onChange={(e) => handleFileChange(e, setHeroImageFile, setHeroPreviewUrl)}
            required
            disabled={isLoading}
            className="mt-1 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-violet-50 file:text-violet-700 hover:file:bg-violet-100"
          />
          {heroPreviewUrl && (
            <div className="mt-2">
              <p className="text-sm font-medium mb-1">Preview:</p>
              <img src={heroPreviewUrl} alt="Hero preview" className="max-h-40 rounded border" />
            </div>
          )}
          <p className="text-xs text-gray-500 mt-1">Upload the main image for the category page.</p>
        </div>
        {/* --- End Hero Image Upload --- */}

        {/* --- Thumbnail Image Upload --- */}
        <div>
          <Label htmlFor="thumbnailImageFile">Thumbnail Image*</Label>
          <Input
            id="thumbnailImageFile"
            type="file"
            accept="image/*"
            onChange={(e) => handleFileChange(e, setThumbnailImageFile, setThumbnailPreviewUrl)}
            required
            disabled={isLoading}
            className="mt-1 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-violet-50 file:text-violet-700 hover:file:bg-violet-100"
          />
           {thumbnailPreviewUrl && (
            <div className="mt-2">
               <p className="text-sm font-medium mb-1">Preview:</p>
              <img src={thumbnailPreviewUrl} alt="Thumbnail preview" className="max-h-24 rounded border" />
            </div>
          )}
          <p className="text-xs text-gray-500 mt-1">Upload a smaller image for category listings.</p>
        </div>
        {/* --- End Thumbnail Image Upload --- */}

        {/* Submit Button */}
        <div className="flex justify-end pt-4">
          <Button type="submit" disabled={isLoading} className="w-full sm:w-auto">
            {isLoading ? 'Creating...' : 'Create Category'}
          </Button>
        </div>
      </form>
    </div>
  );
} 