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

export default function CreateCategoryPage() {
  const queryClient = useQueryClient();
  const router = useRouter(); // Initialize router
  const [categoryName, setCategoryName] = useState('');
  const [description, setDescription] = useState('');
  const [seoTitle, setSeoTitle] = useState('');
  const [seoDescription, setSeoDescription] = useState('');
  // --- State for File Uploads ---
  const [heroImageFile, setHeroImageFile] = useState<File | null>(null);
  const [thumbnailImageFile, setThumbnailImageFile] = useState<File | null>(null);
  // Preview URLs (optional)
  const [heroPreviewUrl, setHeroPreviewUrl] = useState<string | null>(null);
  const [thumbnailPreviewUrl, setThumbnailPreviewUrl] = useState<string | null>(null);
  // --- End State ---

  const createMutation = useMutation({
    mutationFn: createCategory,
    onSuccess: (result) => {
      if (result.success) {
        alert(result.message);
        queryClient.invalidateQueries({ queryKey: ['categories'] });
        // Navigate back to the category list page on success
        router.push('/admin/categories');
      } else {
        alert(`Creation failed: ${result.message}`);
      }
    },
    onError: (error) => {
      alert(`Creation error: ${error.message}`);
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

    if (!trimmedName || !trimmedDesc || !trimmedSeoTitle || !trimmedSeoDesc) {
      alert('Name, Description, SEO Title, and SEO Description are required.');
      return;
    }
    // --- Validate File Inputs ---
    if (!heroImageFile) {
      alert('Hero Image is required.');
      return;
    }
    if (!thumbnailImageFile) {
      alert('Thumbnail Image is required.');
      return;
    }
    // --- End File Validation ---

    const formData = new FormData();
    formData.append('categoryName', trimmedName);
    formData.append('description', trimmedDesc);
    formData.append('seoTitle', trimmedSeoTitle);
    formData.append('seoDescription', trimmedSeoDesc);
    // --- Append Files ---
    formData.append('heroImageFile', heroImageFile);
    formData.append('thumbnailImageFile', thumbnailImageFile);
    // --- End Append Files ---

    createMutation.mutate(formData);
  };

  const isLoading = createMutation.isPending;

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Create New Category</h1>
        <Button variant="outline" size="sm" asChild>
          <Link href="/admin/categories">Back to Categories List</Link>
        </Button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-lg shadow">
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