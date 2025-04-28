'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label'; // Assuming you have a Label component
import { Textarea } from '@/components/ui/textarea'; // Import Textarea
import { Checkbox } from '@/components/ui/checkbox'; // Assuming Checkbox component
import { createImage } from '../../actions/images/create';
import { getCategories } from '../../actions/categories/read';
import { getTags } from '../../actions/tags/read';
import { type Category } from '../../actions/categories/types';
import { type Tag } from '../../actions/tags/types';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export default function CreateImagePage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<Set<string>>(new Set());
  const [selectedTagIds, setSelectedTagIds] = useState<Set<string>>(new Set());

  const { data: availableCategories = [], isLoading: loadingCategories, error: categoryError } = useQuery<Category[], Error>({
    queryKey: ['availableCategories'],
    queryFn: getCategories,
  });
  const { data: availableTags = [], isLoading: loadingTags, error: tagError } = useQuery<Tag[], Error>({
    queryKey: ['availableTags'],
    queryFn: getTags,
  });

  const createMutation = useMutation({
    mutationFn: createImage,
    onSuccess: (result) => {
      if (result.success) {
        alert(result.message);
        queryClient.invalidateQueries({ queryKey: ['adminImages'] });
        setTitle('');
        setDescription('');
        setImageFile(null);
        setPreviewUrl(null);
        setSelectedCategoryIds(new Set());
        setSelectedTagIds(new Set());
        const fileInput = document.getElementById('imageFile') as HTMLInputElement;
        if (fileInput) fileInput.value = '';
      } else {
        alert(`Creation failed: ${result.message}`);
      }
    },
    onError: (error) => {
      alert(`Creation error: ${error.message}`);
    },
  });

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setImageFile(file);
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

  const handleCategoryChange = (categoryId: string, checked: boolean | 'indeterminate') => {
    setSelectedCategoryIds(prev => {
      const newSet = new Set(prev);
      if (checked === true) {
        newSet.add(categoryId);
      } else {
        newSet.delete(categoryId);
      }
      return newSet;
    });
  };

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

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!imageFile) {
      alert('Please select an image file.');
      return;
    }

    const formData = new FormData();
    formData.append('title', title);
    formData.append('description', description);
    formData.append('imageFile', imageFile);
    selectedCategoryIds.forEach(id => formData.append('categoryIds', id));
    selectedTagIds.forEach(id => formData.append('tagIds', id));

    createMutation.mutate(formData);
  };

  // Combined loading state from useQuery results
  const loadingData = loadingCategories || loadingTags;
  // Combined error state from useQuery results (will be Error | null)
  const dataError = categoryError || tagError;

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Create New Image</h1>
        <Button variant="outline" size="sm" asChild>
          <Link href="/admin">Back to Admin</Link>
        </Button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <Label htmlFor="title">Image Title (Optional)</Label>
          <Input
            type="text"
            id="title"
            name="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter image title"
            disabled={createMutation.isPending}
            className="mt-1"
          />
        </div>

        <div>
          <Label htmlFor="description">Description (Optional)</Label>
          <Textarea
            id="description"
            name="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Enter image description"
            disabled={createMutation.isPending}
            className="mt-1"
            rows={4}
          />
        </div>

        <div>
          <Label htmlFor="imageFile">Image File*</Label>
          <Input
            type="file"
            id="imageFile"
            name="imageFile"
            accept="image/*"
            onChange={handleFileChange}
            required
            disabled={createMutation.isPending}
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

        {/* Loading/Error for Categories/Tags */}
        {loadingData && <p className="text-gray-500">Loading categories and tags...</p>}
        {/* Access the message property since dataError is an Error object */}
        {dataError && <p className="text-red-600">Error loading data: {dataError.message}</p>}

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
                    disabled={createMutation.isPending}
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
                    disabled={createMutation.isPending}
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

        <Button type="submit" disabled={createMutation.isPending || loadingData || !imageFile} className="w-full">
          {createMutation.isPending ? 'Creating...' : 'Create Image'}
        </Button>
      </form>
    </div>
  );
} 