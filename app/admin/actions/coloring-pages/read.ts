'use server';
/* eslint-disable @typescript-eslint/no-explicit-any */
import { supabase } from '@/lib/supabaseClient';
import { type AdminImageWithRelations, type ImageForEdit } from './types'; // Import types
import { Constants } from '@/config/constants';

const COLORING_PAGES_TABLE = Constants.COLORING_PAGES_TABLE; // Define constant for table name

/**
 * Fetches paginated images with category/tag names for the admin list.
 */
export async function getAdminColoringPages(page = 1, pageSize = 10): Promise<{ images: AdminImageWithRelations[], totalCount: number }> {
    const offset = (page - 1) * pageSize;
    console.log(`Fetching images for admin page ${page}, offset ${offset}, limit ${pageSize}`);

    try {
        // Fetch total count first
        const { count, error: countError } = await supabase
            .from(COLORING_PAGES_TABLE)
            .select('*', { count: 'exact', head: true });

        if (countError) {
            console.error('Error fetching image count:', countError.message);
            throw new Error(`Database error fetching image count: ${countError.message}`);
        }

        // Fetch image data with relations
        const { data, error } = await supabase
            .from(COLORING_PAGES_TABLE)
            .select(`
                id,
                title,
                image_url,
                created_at,
                coloring_page_categories ( categories ( id, name ) ),
                coloring_page_tags ( tags ( id, name ) )
            `)
            .order('created_at', { ascending: false })
            .range(offset, offset + pageSize - 1);
        console.log('Data:', JSON.stringify(data, null, 2));

        if (error) {
            console.error('Error fetching images with relations:', error.message);
            throw new Error(`Database error fetching images: ${error.message}`);
        }

        // Process the data to match the AdminImageWithRelations type
        const processedImages: AdminImageWithRelations[] = (data || []).map((img: any) => ({
            id: img.id,
            title: img.title,
            image_url: img.image_url,
            created_at: img.created_at,
            categories: img.image_categories?.map((ic: any) => ic.categories?.name).filter(Boolean) ?? [],
            tags: img.image_tags?.map((it: any) => it.tags?.name).filter(Boolean) ?? [],
        }));

        console.log(`Fetched ${processedImages.length} images. Total count: ${count ?? 0}`);
        return { images: processedImages, totalCount: count ?? 0 };

    } catch (err: any) {
        console.error('Error in getAdminColoringPages:', err.message);
        // Ensure a consistent error is thrown or handled
        throw new Error(`Failed to fetch admin coloring pages: ${err.message}`);
    }
}


/**
 * Fetches a single image with its linked category and tag IDs for editing.
 */
export async function getColoringPageForEdit(imageId: string): Promise<ImageForEdit | null> {
    console.log(`Fetching image for edit: ${imageId}`);
    const { data: imageData, error: imageError } = await supabase
        .from(COLORING_PAGES_TABLE)
        .select(`
            id,
            title,
            description,
            image_url
        `)
        .eq('id', imageId)
        .single();
    
    if (imageError || !imageData) {
        console.error(`Error fetching image ${imageId}:`, imageError);
        return null;
    }

    // Fetch linked category IDs
    const { data: categoryLinks, error: categoryError } = await supabase
        .from(Constants.COLORING_PAGE_CATEGORY_TABLE)
        .select('category_id')
        .eq('coloring_page_id', imageId);

    // Fetch linked tag IDs
    const { data: tagLinks, error: tagError } = await supabase
        .from(Constants.COLORING_PAGE_TAG_TABLE)
        .select('tag_id')
        .eq('coloring_page_id', imageId);

    if (categoryError || tagError) {
        console.error(`Error fetching links for image ${imageId}:`, categoryError || tagError);
        // Decide if you want to return partial data or null
        // Returning null might be safer if links are critical
        return null;
    }

    return {
        id: imageData.id,
        title: imageData.title,
        description: imageData.description,
        image_url: imageData.image_url,
        categoryIds: categoryLinks?.map(link => link.category_id) || [],
        tagIds: tagLinks?.map(link => link.tag_id) || [],
    };
} 