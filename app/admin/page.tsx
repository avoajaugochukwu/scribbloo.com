'use client'; // Required for state and form handling
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient'; // Adjust path if needed
import { ImageType } from '@/types/database'; // Adjust path if needed
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function ObscureAdminPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [images, setImages] = useState<ImageType[]>([]);
  const [isLoadingImages, setIsLoadingImages] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);
  // fhiytury
  const handleLogin = (event: React.FormEvent) => {
    event.preventDefault();
    setError(null); // Clear previous errors

    // --- Simple, INSECURE Check ---
    if (username === 'demo' && password === 'demo') {
      setIsLoggedIn(true);
    } else {
      setError('Invalid credentials.');
    }
    // Clear password field after attempt
    setPassword('');
  };

  // Fetch images *after* login state is true
  useEffect(() => {
    if (isLoggedIn) {
      const fetchImages = async () => {
        setIsLoadingImages(true);
        setFetchError(null);
        try {
          const { data, error: dbError } = await supabase
            .from('images')
            .select('id, title, description, image_url, created_at')
            .order('created_at', { ascending: false });

          if (dbError) {
            throw dbError;
          }
          setImages((data || []) as ImageType[]);
        } catch (err: any) {
          console.error('Error fetching images for admin:', err);
          setFetchError(`Failed to load images: ${err.message || 'Unknown error'}`);
          setImages([]); // Clear images on error
        } finally {
          setIsLoadingImages(false);
        }
      };

      fetchImages();
    }
  }, [isLoggedIn]); // Re-run effect when isLoggedIn changes

  // --- Render Login Form ---
  if (!isLoggedIn) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md">
          <h1 className="text-2xl font-bold text-center text-gray-900">
            Admin Access
          </h1>
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                name="username"
                type="text"
                required
                className="mt-1"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                required
                className="mt-1"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            {error && (
              <p className="text-sm text-red-600 text-center">{error}</p>
            )}

            <Button type="submit" className="w-full">
              Login
            </Button>
          </form>
        </div>
      </div>
    );
  }

  // --- Render Admin Content (Image List) ---
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Admin Dashboard - Images</h1>
        {/* Simple logout by resetting state */}
        <Button variant="outline" onClick={() => setIsLoggedIn(false)}>Logout</Button>
      </div>

      {isLoadingImages && <p className="text-center text-gray-500">Loading images...</p>}
      {fetchError && <p className="text-center text-red-600">{fetchError}</p>}

      {!isLoadingImages && !fetchError && images.length > 0 && (
         <div className="overflow-x-auto relative shadow-md sm:rounded-lg">
           <table className="w-full text-sm text-left text-gray-500">
             <thead className="text-xs text-gray-700 uppercase bg-gray-50">
               <tr>
                 <th scope="col" className="py-3 px-6">Image</th>
                 <th scope="col" className="py-3 px-6">Title</th>
                 <th scope="col" className="py-3 px-6">ID</th>
                 <th scope="col" className="py-3 px-6">Created At</th>
               </tr>
             </thead>
             <tbody>
               {images.map((image) => (
                 <tr key={image.id} className="bg-white border-b hover:bg-gray-50">
                   <td className="py-4 px-6">
                     {image.image_url ? (
                       <Image
                         src={image.image_url}
                         alt={image.title || 'Coloring page image'}
                         width={80}
                         height={80}
                         className="object-contain h-20 w-20 rounded"
                       />
                     ) : (
                       <div className="h-20 w-20 bg-gray-200 rounded flex items-center justify-center text-xs text-gray-500">
                         No Image
                       </div>
                     )}
                   </td>
                   <td className="py-4 px-6 font-medium text-gray-900 whitespace-nowrap">
                     {image.title || 'Untitled'}
                   </td>
                   <td className="py-4 px-6 text-xs">{image.id}</td>
                   <td className="py-4 px-6">
                     {image.created_at ? new Date(image.created_at).toLocaleDateString() : 'N/A'}
                   </td>
                 </tr>
               ))}
             </tbody>
           </table>
         </div>
      )}

      {!isLoadingImages && !fetchError && images.length === 0 && (
         <p className="text-center text-gray-500 mt-10">No images found.</p>
      )}
    </div>
  );
} 