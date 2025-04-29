'use server';

import { supabase } from '@/lib/supabaseClient';
import Category from '@/types/category.type';

/**
 * Fetches all categories from the database, ordered by name.
 */
export async function getCategories(): Promise<Category[]> {
  console.log('Fetching all categories...');
  try {
    const { data, error } = await supabase
      .from('categories')
      .select('id, name, created_at, description, seo_title, seo_description, hero_image_url, thumbnail_image_url, slug')
      .order('name', { ascending: true });

    if (error) {
      console.error('Error fetching categories:', error.message);
      throw new Error(`Database error fetching categories: ${error.message}`);
    }

    console.log(`Fetched ${data?.length ?? 0} categories.`);
    // Ensure the returned data matches the Category type
    return (data || []).map(cat => ({
        id: cat.id,
        name: cat.name,
        created_at: cat.created_at,
        description: cat.description,
        seo_title: cat.seo_title,
        seo_description: cat.seo_description,
        hero_image_url: cat.hero_image_url,
        thumbnail_image_url: cat.thumbnail_image_url,
        slug: cat.slug
    })) as Category[];

  } catch (err) {
    console.error('Unexpected error fetching categories:', err);
    // Re-throw or return an empty array/error object depending on desired handling
    throw new Error('Failed to fetch categories.');
  }
} 