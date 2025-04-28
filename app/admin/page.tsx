'use client'; // Required for state and form handling
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect, useCallback } from 'react';
// Removed direct supabase import, it's now used in actions.ts
import { ImageType } from '@/types/database'; // Adjust path if needed
import Image from 'next/image';
import { Button } from '@/components/ui/button';
// Import the updated action and type
import { getAdminImages, type AdminImageWithRelations } from './actions/images';
import Link from 'next/link';

// Helper component to render date only on client
function ClientOnlyDate({ dateString }: { dateString: string | null | undefined }) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted || !dateString) {
    // Render placeholder or nothing on server and initial client render
    return <span>{dateString ? '...' : 'N/A'}</span>;
  }

  // Render formatted date only after mount
  return <span>{new Date(dateString).toLocaleDateString()}</span>;
}

const IMAGES_PER_PAGE = 10; // Keep consistent with the action

export default function AdminPage() {
  // Use the new type for state
  const [images, setImages] = useState<AdminImageWithRelations[]>([]);
  const [currentPage, setCurrentPage] = useState(1); // Use 1-based page for UI
  const [totalImages, setTotalImages] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  // Get Supabase public URL base from environment variables (still needed here for URL construction)
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const bucketName = 'images'; // *** Replace with your actual bucket name ***
  const storageBaseUrl = supabaseUrl ? `${supabaseUrl}/storage/v1/object/public/${bucketName}/` : null;

  // Calculate total pages
  const totalPages = Math.ceil(totalImages / IMAGES_PER_PAGE);

  // Memoize fetch function to avoid recreating it on every render
  const fetchImagesForPage = useCallback(async (page: number) => {
    setIsLoading(true);
    setFetchError(null);
    console.log(`Requesting page: ${page}`);
    try {
      // Call the updated action
      const { images: fetchedImages, totalCount } = await getAdminImages(page);
      setImages(fetchedImages);
      setTotalImages(totalCount);
      // Optional: Scroll to top when page changes
      // window.scrollTo(0, 0);
    } catch (err: any) {
      console.error('Error loading images on page:', err);
      setFetchError(err.message || 'Failed to load images.');
      setImages([]); // Clear images on error
      setTotalImages(0);
    } finally {
      setIsLoading(false);
    }
  }, []); // Empty dependency array means this function is created once

  // Effect to fetch images when currentPage changes
  useEffect(() => {
    fetchImagesForPage(currentPage);
  }, [currentPage, fetchImagesForPage]); // Depend on currentPage and the memoized fetch function

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage((prev) => prev - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage((prev) => prev + 1);
    }
  };

  // --- Render Admin Content (Image List) ---
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <div className="flex space-x-2">
            <Button asChild>
                <Link href="/admin/images/create">Create New Image</Link>
            </Button>
            <Button asChild variant="outline">
                <Link href="/admin/categories">Manage Categories</Link>
            </Button>
            <Button asChild variant="outline">
                <Link href="/admin/tags">Manage Tags</Link>
            </Button>
        </div>
        {!isLoading && totalImages > 0 && (
          <div className="text-right text-sm text-gray-600 mb-4">
            Showing Images: Page {currentPage} of {totalPages} ({totalImages} total)
          </div>
        )}
      </div>

      {/* Loading State */}
      {isLoading && <p className="text-center text-gray-500 py-10">Loading images...</p>}

      {/* Error State */}
      {fetchError && !isLoading && <p className="text-center text-red-600 py-10">{fetchError}</p>}

      {/* Content: Table */}
      {!isLoading && !fetchError && images.length > 0 && (
         <div className="overflow-x-auto relative shadow-md sm:rounded-lg mb-6">
           <table className="w-full text-sm text-left text-gray-500">
             <thead className="text-xs text-gray-700 uppercase bg-gray-50">
               <tr>
                 <th scope="col" className="py-3 px-6">Thumbnail</th>
                 <th scope="col" className="py-3 px-6">Title</th>
                 <th scope="col" className="py-3 px-6">Categories</th>
                 <th scope="col" className="py-3 px-6">Tags</th>
                 <th scope="col" className="py-3 px-6">Created At</th>
               </tr>
             </thead>
             <tbody>
               {images.map((image) => {
                 const fullImageUrl = storageBaseUrl && image.image_url
                   ? `${storageBaseUrl}${image.image_url}`
                   : null;

                 return (
                   <tr key={image.id} className="bg-white border-b hover:bg-gray-50">
                     {/* Thumbnail */}
                     <td className="py-2 px-6">
                       {fullImageUrl ? ( <Image src={fullImageUrl} alt={image.title || ''} width={60} height={60} className="object-contain h-16 w-16 rounded" onError={(e) => console.warn(`Failed to load image: ${fullImageUrl}`, e)} /> ) : ( <div className="h-16 w-16 bg-gray-200 rounded flex items-center justify-center text-xs text-gray-500">{image.image_url ? 'URL Error' : 'No Image'}</div> )}
                     </td>
                     {/* Title */}
                     <td className="py-4 px-6 font-medium text-gray-900 whitespace-nowrap">
                       {image.title || 'Untitled'}
                     </td>
                     {/* Categories List */}
                     <td className="py-4 px-6">
                       {image.categories.length > 0
                         ? image.categories.join(', ')
                         : <span className="text-gray-400 italic">None</span>}
                     </td>
                     {/* Tags List */}
                     <td className="py-4 px-6">
                       {image.tags.length > 0
                         ? image.tags.join(', ')
                         : <span className="text-gray-400 italic">None</span>
                       }
                     </td>
                     {/* Created At */}
                     <td className="py-4 px-6">
                       <ClientOnlyDate dateString={image.created_at} />
                     </td>
                   </tr>
                 );
               })}
             </tbody>
           </table>
         </div>
      )}

      {/* Empty State */}
      {!isLoading && !fetchError && images.length === 0 && (
         <p className="text-center text-gray-500 py-10">No images found.</p>
      )}

      {/* Pagination Controls */}
      {!isLoading && !fetchError && totalPages > 1 && (
        <div className="flex justify-center items-center space-x-4 mt-8">
          <Button
            onClick={handlePreviousPage}
            disabled={currentPage <= 1}
            variant="outline"
          >
            Previous
          </Button>
          <span className="text-sm font-medium">
            Page {currentPage} of {totalPages}
          </span>
          <Button
            onClick={handleNextPage}
            disabled={currentPage >= totalPages}
            variant="outline"
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
} 