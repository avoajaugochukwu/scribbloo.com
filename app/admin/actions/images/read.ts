'use server';

import { supabase } from '@/lib/supabaseClient';
import { type AdminImageWithRelations, type ImageForEdit } from './types'; // Import types

/**
 * Fetches paginated images with category/tag names for the admin list.
 */
export async function getAdminImages(page = 1, pageSize = 10): Promise<{ images: AdminImageWithRelations[], totalCount: number }> {
    const offset = (page - 1) * pageSize;
    console.log(`Fetching images for admin page ${page}, offset ${offset}, limit ${pageSize}`);

    try {
        // Fetch total count first
        const { count, error: countError } = await supabase
            .from('images')
            .select('*', { count: 'exact', head: true });

        if (countError) {
            console.error('Error fetching image count:', countError.message);
            throw new Error(`Database error fetching image count: ${countError.message}`);
        }

        // Fetch image data with relations
        const { data, error } = await supabase
            .from('images')
            .select(`
                id,
                title,
                image_url,
                created_at,
                image_categories ( categories ( id, name ) ),
                image_tags ( tags ( id, name ) )
            `)
            .order('created_at', { ascending: false })
            .range(offset, offset + pageSize - 1);

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
        console.error('Error in getAdminImages:', err.message);
        // Ensure a consistent error is thrown or handled
        throw new Error(`Failed to fetch admin images: ${err.message}`);
    }
}


/**
 * Fetches a single image's details (including linked category/tag IDs) for the edit form.
 */
export async function getImageForEdit(imageId: string): Promise<ImageForEdit | null> {
    if (!imageId) {
        console.error('getImageForEdit called with invalid ID');
        return null;
    }
    console.log(`Fetching image details for edit: ID ${imageId}`);
    try {
        const { data, error } = await supabase
            .from('images')
            .select(`
                id,
                title,
                image_url,
                image_categories ( category_id ),
                image_tags ( tag_id )
            `)
            .eq('id', imageId)
            .single();

        if (error) {
            if (error.code === 'PGRST116') { // Not found code
                console.warn(`Image not found for edit: ID ${imageId}`);
                return null;
            }
            console.error(`Error fetching image for edit (ID: ${imageId}):`, error.message);
            throw error; // Re-throw other errors
        }

        if (!data) return null;

        // Process data to match the ImageForEdit type
        const imageDetails: ImageForEdit = {
            id: data.id,
            title: data.title,
            image_url: data.image_url,
            // Extract just the IDs from the join table results
            categoryIds: data.image_categories?.map((ic: any) => ic.category_id) ?? [],
            tagIds: data.image_tags?.map((it: any) => it.tag_id) ?? [],
        };

        console.log(`Successfully fetched image details for edit:`, imageDetails);
        return imageDetails;

    } catch (err: any) {
        console.error(`Unexpected error fetching image for edit (ID: ${imageId}):`, err.message);
        throw new Error(`Failed to fetch image details: ${err.message}`);
    }
} 