'use client';

import { useState, useEffect, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label'; // Assuming you have a Label component
import { Checkbox } from '@/components/ui/checkbox'; // Assuming Checkbox component
import { createImage, getAvailableCategories, getAvailableTags } from '../actions'; // Import actions
import { type Category } from '../../categories/actions'; // Import type
import { type Tag } from '../../tags/actions'; // Import type

export default function CreateImagePage() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [availableCategories, setAvailableCategories] = useState<Category[]>([]);
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<Set<string>>(new Set());
  const [availableTags, setAvailableTags] = useState<Tag[]>([]);
  const [selectedTagIds, setSelectedTagIds] = useState<Set<string>>(new Set());
  const [loadingData, setLoadingData] = useState(true); // For loading categories/tags
  const [dataError, setDataError] = useState<string | null>(null);
  const [formMessage, setFormMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [isPending, startTransition] = useTransition(); // For form submission loading state

  console.log('availableCategories', availableCategories);
  // Fetch categories and tags on component mount
  useEffect(() => {
    async function loadData() {
      setLoadingData(true);
      setDataError(null);
      try {
        const [categories, tags] = await Promise.all([
          getAvailableCategories(),
          getAvailableTags()
        ]);
        setAvailableCategories(categories);
        setAvailableTags(tags);
      } catch (error: any) {
        console.error("Failed to load categories/tags:", error);
        setDataError(error.message || "Failed to load data for the form.");
      } finally {
        setLoadingData(false);
      }
    }
    loadData();
  }, []); // Empty dependency array ensures this runs only once on mount

  // Handle file selection and preview
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setImageFile(file);
      // Create a preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setImageFile(null);
      setPreviewUrl(null);
    }
  };

  // Handle checkbox changes for categories
  const handleCategoryChange = (categoryId: string, checked: boolean | 'indeterminate') => {
    console.log('categoryId', categoryId);
    setSelectedCategoryIds(prev => {
      const newSet = new Set(prev);
      if (checked === true) {
        newSet.add(categoryId);
      } else {
        newSet.delete(categoryId);
      }
      console.log('newSet', newSet);
      return newSet;
    });
  };

  // Handle checkbox changes for tags
  const handleTagChange = (tagId: string, checked: boolean | 'indeterminate') => {
     setSelectedTagIds(prev => {
      const newSet = new Set(prev);
      if (checked === true) {
        newSet.add(tagId);
      } else {
        newSet.delete(tagId);
      }
      return newSet;
    });
  };

  // Handle form submission
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormMessage(null);

    if (!imageFile) {
      setFormMessage({ text: 'Please select an image file.', type: 'error' });
      return;
    }

    startTransition(async () => {
      const formData = new FormData();
      formData.append('title', title);
      formData.append('imageFile', imageFile);
      console.log('selectedCategoryIds', selectedCategoryIds);
      selectedCategoryIds.forEach(id => formData.append('categoryIds', id));
      selectedTagIds.forEach(id => formData.append('tagIds', id));

      console.log('formData.get(categoryIds)', formData.getAll('categoryIds'));
      const result = await createImage(formData);
      

      if (result.success) {
        setFormMessage({ text: result.message, type: 'success' });
        // Optionally redirect after success
        // router.push('/admin');
        // Reset form state
        setTitle('');
        setImageFile(null);
        setPreviewUrl(null);
        setSelectedCategoryIds(new Set());
        setSelectedTagIds(new Set());
        // Reset file input visually (if possible/needed)
        const fileInput = document.getElementById('imageFile') as HTMLInputElement;
        if (fileInput) fileInput.value = '';

      } else {
        setFormMessage({ text: result.message, type: 'error' });
      }
    });
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Create New Image</h1>
        <Button variant="outline" size="sm" asChild>
          <Link href="/admin">Back to Admin</Link>
        </Button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Title Input */}
        <div>
          <Label htmlFor="title">Image Title (Optional)</Label>
          <Input
            type="text"
            id="title"
            name="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter image title"
            disabled={isPending}
            className="mt-1"
          />
        </div>

        {/* File Input */}
        <div>
          <Label htmlFor="imageFile">Image File*</Label>
          <Input
            type="file"
            id="imageFile"
            name="imageFile"
            accept="image/*" // Accept only image types
            onChange={handleFileChange}
            required
            disabled={isPending}
            className="mt-1 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
          />
          {previewUrl && (
            <div className="mt-4">
              <p className="text-sm font-medium mb-1">Preview:</p>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={previewUrl} alt="Image preview" className="max-w-xs max-h-48 rounded border" />
            </div>
          )}
        </div>

        {/* Data Loading/Error State */}
        {loadingData && <p className="text-gray-500">Loading categories and tags...</p>}
        {dataError && <p className="text-red-600">Error loading data: {dataError}</p>}

        {/* Categories Selection */}
        {!loadingData && !dataError && availableCategories.length > 0 && (
          <fieldset className="space-y-2 border p-4 rounded-md">
            <legend className="text-lg font-semibold mb-2">Categories</legend>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {availableCategories.map((category) => (
                <div key={category.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={`category-${category.id}`}
                    checked={selectedCategoryIds.has(category.id)}
                    onCheckedChange={(checked) => handleCategoryChange(category.id, checked)}
                    disabled={isPending}
                  />
                  <Label htmlFor={`category-${category.id}`} className="cursor-pointer">
                    {category.name}
                  </Label>
                </div>
              ))}
            </div>
          </fieldset>
        )}
         {!loadingData && !dataError && availableCategories.length === 0 && (
             <p className="text-sm text-gray-500 italic">No categories available. Create them first.</p>
         )}


        {/* Tags Selection */}
         {!loadingData && !dataError && availableTags.length > 0 && (
          <fieldset className="space-y-2 border p-4 rounded-md">
            <legend className="text-lg font-semibold mb-2">Tags</legend>
             <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {availableTags.map((tag) => (
                <div key={tag.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={`tag-${tag.id}`}
                    checked={selectedTagIds.has(tag.id)}
                    onCheckedChange={(checked) => handleTagChange(tag.id, checked)}
                    disabled={isPending}
                  />
                  <Label htmlFor={`tag-${tag.id}`} className="cursor-pointer">
                    {tag.name}
                  </Label>
                </div>
              ))}
            </div>
          </fieldset>
        )}
         {!loadingData && !dataError && availableTags.length === 0 && (
             <p className="text-sm text-gray-500 italic">No tags available. Create them first.</p>
         )}


        {/* Form Message */}
        {formMessage && (
          <p className={`text-sm ${formMessage.type === 'error' ? 'text-red-600' : 'text-green-600'}`}>
            {formMessage.text}
          </p>
        )}

        {/* Submit Button */}
        <Button type="submit" disabled={isPending || loadingData || !imageFile} className="w-full">
          {isPending ? 'Creating...' : 'Create Image'}
        </Button>
      </form>
    </div>
  );
} 