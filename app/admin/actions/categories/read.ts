'use server';

import { Constants } from '@/config/constants';
import { supabase } from '@/lib/supabaseClient';
import Category from '@/types/category.type';

/**
 * Fetches all categories for the admin list.
 */
export async function getCategories(): Promise<Category[]> {
  console.log('Fetching all categories...');
  try {
    const { data, error } = await supabase
      .from(Constants.CATEGORIES_TABLE)
      .select(`
        id,
        name,
        slug,
        description,
        seo_title,
        seo_description,
        seo_meta_description,
        hero_image,
        thumbnail_image,
        created_at
      `)
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
        seo_meta_description: cat.seo_meta_description,
        hero_image: cat.hero_image,
        thumbnail_image: cat.thumbnail_image,
        slug: cat.slug
    })) as Category[];

  } catch (err) {
    console.error('Unexpected error fetching categories:', err);
    // Re-throw or return an empty array/error object depending on desired handling
    throw new Error('Failed to fetch categories.');
  }
} 