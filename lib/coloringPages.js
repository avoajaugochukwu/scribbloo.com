import { supabase } from './supabaseClient.js';

/**
 * Fetches all coloring pages from the 'coloring_pages' table.
 * Assumes you have a table named 'coloring_pages'.
 * Adjust table and column names as needed.
 *
 * @returns {Promise<Array|null>} A promise that resolves to an array of coloring pages or null if an error occurs.
 */
export async function getAllColoringPages() {
  try {
    const { data, error } = await supabase
      .from('coloring_pages') // Replace 'coloring_pages' with your actual table name
      .select('*'); // Select all columns, or specify columns like 'id, title, preview_url, pdf_url'

    if (error) {
      console.error('Error fetching coloring pages:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('An error occurred in getAllColoringPages:', error);
    return null; // Or handle the error more gracefully
  }
}

/**
 * Fetches a single coloring page by its ID.
 *
 * @param {string|number} id The ID of the coloring page to fetch.
 * @returns {Promise<Object|null>} A promise that resolves to the coloring page object or null if not found or an error occurs.
 */
export async function getColoringPageById(id) {
  if (!id) {
    console.error('getColoringPageById requires an ID.');
    return null;
  }

  try {
    const { data, error } = await supabase
      .from('coloring_pages') // Replace 'coloring_pages' with your actual table name
      .select('*')
      .eq('id', id) // Filter by the 'id' column
      .single(); // Expect a single result

    if (error) {
      // Handle 'PGRST116' error specifically if you want to differentiate between "not found" and other errors
      if (error.code === 'PGRST116') {
        console.log(`Coloring page with ID ${id} not found.`);
        return null;
      }
      console.error(`Error fetching coloring page with ID ${id}:`, error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error(`An error occurred in getColoringPageById for ID ${id}:`, error);
    return null; // Or handle the error more gracefully
  }
}

/**
 * Fetches all distinct categories from the 'categories' table.
 * Assumes you have a table named 'categories'.
 * Adjust table and column names as needed.
 *
 * @returns {Promise<Array|null>} A promise that resolves to an array of category objects or null if an error occurs.
 */
export async function getAllCategories() {
  try {
    // Assuming you have a dedicated 'categories' table
    // If categories are just a column in 'coloring_pages', you might need a different query
    // like: supabase.from('coloring_pages').select('category').distinct()
    const { data, error } = await supabase
      .from('categories') // Replace 'categories' with your actual table name
      .select('*'); // Select all columns, or specify 'id, name' etc.

    if (error) {
      console.error('Error fetching categories:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('An error occurred in getAllCategories:', error);
    return null; // Or handle the error more gracefully
  }
}

// Add more functions as needed, e.g., for fetching pages by category, etc. 