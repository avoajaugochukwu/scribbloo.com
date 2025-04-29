'use client';

import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation'; // Import useRouter for navigation
import Link from 'next/link';
import { createCategory } from '../../actions/categories/create'; // Adjust path if needed
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
  const [heroImageUrl, setHeroImageUrl] = useState('');
  const [thumbnailImageUrl, setThumbnailImageUrl] = useState('');

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

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    // Trim values for validation
    const trimmedName = categoryName.trim();
    const trimmedDesc = description.trim();
    const trimmedSeoTitle = seoTitle.trim();
    const trimmedSeoDesc = seoDescription.trim();
    const trimmedHeroUrl = heroImageUrl.trim();
    const trimmedThumbnailUrl = thumbnailImageUrl.trim();

    // Client-side validation
    if (!trimmedName || !trimmedDesc || !trimmedSeoTitle || !trimmedSeoDesc || !trimmedHeroUrl || !trimmedThumbnailUrl) {
      alert('All fields are required. Please fill out the entire form.');
      return;
    }

    const formData = new FormData();
    formData.append('categoryName', trimmedName);
    formData.append('description', trimmedDesc);
    formData.append('seoTitle', trimmedSeoTitle);
    formData.append('seoDescription', trimmedSeoDesc);
    formData.append('heroImageUrl', trimmedHeroUrl);
    formData.append('thumbnailImageUrl', trimmedThumbnailUrl);

    createMutation.mutate(formData);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Create New Category</h1>
        <Button asChild variant="outline">
          <Link href="/admin/categories">Back to Categories List</Link>
        </Button>
      </div>

      <div className="bg-white p-6 rounded-lg shadow">
        <form onSubmit={handleSubmit} className="space-y-4">
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
              disabled={createMutation.isPending}
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
              disabled={createMutation.isPending}
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
              disabled={createMutation.isPending}
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
              disabled={createMutation.isPending}
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
              disabled={createMutation.isPending}
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
              disabled={createMutation.isPending}
              className="mt-1"
            />
            <p className="text-xs text-gray-500 mt-1">Upload image to storage first, then paste the public URL here.</p>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end pt-4">
             <Button type="submit" disabled={createMutation.isPending} className="w-full sm:w-auto">
                {createMutation.isPending ? 'Creating...' : 'Create Category'}
             </Button>
          </div>
        </form>
      </div>
    </div>
  );
} 