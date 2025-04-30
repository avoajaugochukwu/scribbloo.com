'use client'; // Required for state and form handling

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'; // Add RQ imports
import Image from 'next/image';
import { Button } from '@/components/ui/button';
// Import the updated action and type
import { getAdminColoringPages } from './actions/coloring-pages/read';
import { deleteImage } from './actions/coloring-pages/delete'; // Import delete action
import { type AdminImageWithRelations } from './actions/coloring-pages/types';
import Link from 'next/link';
import { Edit, Trash2 } from 'lucide-react'; // Add Trash2 if adding delete button
import { Constants } from '@/config/constants';
import { toast } from 'sonner';

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
  const queryClient = useQueryClient(); // Get query client
  const [currentPage, setCurrentPage] = useState(1);
  const [deleteConfirmation, setDeleteConfirmation] = useState<{ id: string; title: string | null } | null>(null);

  // --- Fetch with useQuery ---
  const { data: imageData, isLoading, error: fetchError } = useQuery({
    // Update queryKey to reflect the data source
    queryKey: ['adminColoringPages', currentPage], // <-- Updated query key
    queryFn: () => getAdminColoringPages(currentPage, IMAGES_PER_PAGE),
    placeholderData: (previousData) => previousData,
  });

  // Extract data from RQ result
  const images = imageData?.images ?? [];
  const totalImages = imageData?.totalCount ?? 0;
  const totalPages = Math.ceil(totalImages / IMAGES_PER_PAGE);

  // --- Delete Mutation ---
  const deleteMutation = useMutation({
    mutationFn: deleteImage,
    onSuccess: (result, imageId) => {
      if (result.success) {
        console.log(`Image ${imageId} deleted successfully.`);
        // Invalidate the updated query key
        queryClient.invalidateQueries({ queryKey: ['adminColoringPages', currentPage] });
        queryClient.invalidateQueries({ queryKey: ['adminColoringPages'] }); // Invalidate all pages/count
        setDeleteConfirmation(null);
      } else {
        console.error(`Failed to delete image ${imageId}:`, result.message);
        toast.error(`Deletion failed: ${result.message}`);
      }
    },
    onError: (error, imageId) => {
      console.error(`Error deleting image ${imageId}:`, error);
      toast.error(`An unexpected error occurred during deletion: ${error.message}`);
    },
  });

  // --- Handlers ---
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

  const handleDeleteClick = (image: AdminImageWithRelations) => {
    setDeleteConfirmation({ id: image.id, title: image.title });
  };

  const confirmDelete = () => {
    if (deleteConfirmation) {
      deleteMutation.mutate(deleteConfirmation.id);
    }
  };

  const cancelDelete = () => {
    setDeleteConfirmation(null);
  };

  const isMutating = deleteMutation.isPending; // Check if delete is running

  // --- Render Admin Content (Image List) ---
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <div className="flex space-x-2">
          <Button asChild>
            <Link href="/admin/coloring-pages/create">Create New Coloring Page</Link>
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

      {/* Delete Confirmation Modal */}
      {deleteConfirmation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-sm">
            <h3 className="text-lg font-medium mb-4">Confirm Deletion</h3>
            <p className="mb-4">Are you sure you want to delete the image &quot;{deleteConfirmation.title || 'Untitled'}&quot;? This action cannot be undone.</p>
            <div className="flex justify-end space-x-3">
              <Button variant="outline" onClick={cancelDelete} disabled={isMutating}>Cancel</Button>
              <Button variant="destructive" onClick={confirmDelete} disabled={isMutating}>
                {isMutating ? 'Deleting...' : 'Delete'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Loading State */}
      {isLoading && <p className="text-center text-gray-500 py-10">Loading images...</p>}

      {/* Error State */}
      {fetchError && !isLoading && <p className="text-center text-red-600 py-10">{fetchError.message}</p>}

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
                <th scope="col" className="py-3 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {images.map((image) => {
                return (
                  <tr key={image.id} className="bg-white border-b hover:bg-gray-50">
                    {/* Thumbnail */}
                    <td className="py-2 px-6">
                      <Image src={Constants.SUPABASE_COLORING_PAGES_BUCKET_URL + image.image_url} alt={image.title || ''} width={60} height={60} className="object-contain h-16 w-16 rounded" />
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
                    {/* Actions */}
                    <td className="py-4 px-6 text-right">
                      <Button asChild variant="ghost" size="sm" title="Edit Coloring Page" disabled={isMutating}>
                        <Link href={`/admin/coloring-pages/edit/${image.id}`}>
                          <Edit className="h-4 w-4" />
                        </Link>
                      </Button>
                      <Button variant="ghost" size="sm" title="Delete Image" onClick={() => handleDeleteClick(image)} disabled={isMutating} className="text-red-600 hover:text-red-800 ml-2">
                        <Trash2 className="h-4 w-4" />
                      </Button>
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