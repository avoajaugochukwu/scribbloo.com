'use server';

import { supabase } from '@/lib/supabaseClient';
import { revalidatePath } from 'next/cache';

// Simple slugification utility
function slugify(text: string): string {
  if (!text) return '';
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')           // Replace spaces with -
    .replace(/[^\w-]+/g, '')        // Remove all non-word chars except -
    .replace(/--+/g, '-')           // Replace multiple - with single -
    .replace(/^-+/, '')             // Trim - from start of text
    .replace(/-+$/, '');            // Trim - from end of text
}

/**
 * Creates a new category in the database with additional fields.
 */
export async function createCategory(formData: FormData): Promise<{ success: boolean; message: string }> {
  const categoryName = formData.get('categoryName')?.toString().trim();
  // Read new fields and trim them
  const description = formData.get('description')?.toString().trim();
  const seoTitle = formData.get('seoTitle')?.toString().trim();
  const seoDescription = formData.get('seoDescription')?.toString().trim();
  const heroImageUrl = formData.get('heroImageUrl')?.toString().trim();
  const thumbnailImageUrl = formData.get('thumbnailImageUrl')?.toString().trim();

  // --- Server-side Validation ---
  if (!categoryName) {
    return { success: false, message: 'Category name is required.' };
  }
  if (!description) {
    return { success: false, message: 'Description is required.' };
  }
  if (!seoTitle) {
    return { success: false, message: 'SEO Title is required.' };
  }
  if (!seoDescription) {
    return { success: false, message: 'SEO Description is required.' };
  }
  if (!heroImageUrl) {
    return { success: false, message: 'Hero Image URL is required.' };
  }
  if (!thumbnailImageUrl) {
    return { success: false, message: 'Thumbnail Image URL is required.' };
  }
  // --- End Validation ---

  // Generate slug from name
  const slug = slugify(categoryName);
  if (!slug) {
      return { success: false, message: 'Category name must contain valid characters to generate a slug.' };
  }

  console.log(`Attempting to create category: "${categoryName}", slug: "${slug}"`);

  try {
    const { error } = await supabase
      .from('categories')
      .insert([{
          name: categoryName,
          slug: slug,
          description: description,
          seo_title: seoTitle,
          seo_description: seoDescription,
          hero_image_url: heroImageUrl,
          thumbnail_image_url: thumbnailImageUrl
       }])
      .select()
      .single();

    if (error) {
      console.error('Error creating category:', error.message);
      // Handle potential unique constraint violations (duplicate name or slug)
      if (error.code === '23505') { // Check Supabase error codes for uniqueness violation
         if (error.message.includes('categories_name_key')) {
            return { success: false, message: `Category name "${categoryName}" already exists.` };
         }
         if (error.message.includes('categories_slug_key')) {
             // This might happen if two different names slugify to the same value
             return { success: false, message: `Generated slug "${slug}" already exists. Try a slightly different name.` };
         }
         return { success: false, message: `A unique field conflict occurred: ${error.message}` };
      }
      return { success: false, message: `Database error: ${error.message}` };
    }

    console.log(`Category "${categoryName}" created successfully.`);
    revalidatePath('/admin/categories'); // Revalidate the page showing the list
    revalidatePath('/admin'); // Revalidate admin dashboard if it shows categories
    // Also revalidate image create/edit pages if they fetch categories
    revalidatePath('/admin/images/create');
    revalidatePath('/admin/images/edit', 'layout'); // Revalidate all edit pages
    // Revalidate public category pages
    revalidatePath('/coloring-pages', 'layout');

    return { success: true, message: `Category "${categoryName}" created successfully.` };

  } catch (err) {
    console.error('Unexpected error creating category:', err);
    // Type assertion if necessary, or handle unknown error type
    const message = err instanceof Error ? err.message : 'An unexpected error occurred.';
    return { success: false, message };
  }
} 