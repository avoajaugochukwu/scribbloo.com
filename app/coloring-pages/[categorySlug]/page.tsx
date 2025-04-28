import { getImagesByCategorySlug } from '@/lib/coloringPages';
import Link from 'next/link';
// Keep next/image import if needed elsewhere, otherwise it's handled by the component
// import Image from 'next/image';
import { CategoryWithImages, ImageType } from '@/types/database'; // Adjust path if needed
// Remove Constants import if URL construction is moved to the component
// import { Constants } from '@/config/constants';
// Import the new component
import ColoringPageImage from './components/ColoringPageImage'; // Relative path to the component

// Define the expected shape of the params object
interface CategoryPageParams {
  categorySlug: string;
}

// Define the props for the page component
interface CategoryPageProps {
  params: Promise<{ categorySlug: string }>;
}

// This is a React Server Component (RSC)
export default async function CategoryPage({ params }: CategoryPageProps) {
  const { categorySlug } = await params;

  // Fetch the category details and its associated images
  const categoryData = await getImagesByCategorySlug(categorySlug) as CategoryWithImages | null;

  // Handle case where category is not found
  if (!categoryData) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h1 className="text-2xl font-bold mb-4">Category Not Found</h1>
        <p>Sorry, we couldn't find a category with the slug "{decodeURIComponent(categorySlug)}".</p>
        <Link href="/coloring-pages" className="text-blue-600 hover:underline mt-4 inline-block">
          Back to Categories
        </Link>
      </div>
    );
  }

  // Remove imageUrlStub if URL construction is moved to the component
  // const imageUrlStub = Constants.SUPABASE_URL + '/storage/v1/object/public/images/'
  // Handle case where category exists but has no images (adjust as needed)
  const images = categoryData.images || [];
  // console.log('Images:', images); // Keep for debugging if needed

  return (
    <div className="container mx-auto px-4 py-8">
      <nav className="mb-4 text-sm">
        <Link href="/coloring-pages" className="text-blue-600 hover:underline">
          Coloring Pages
        </Link>
        <span className="mx-2">/</span>
        <span>{categoryData.name}</span>
      </nav>

      <h1 className="text-3xl font-bold mb-6">
        {categoryData.name} Coloring Pages
      </h1>

      {images.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-6">
          {/* Map over images and render the component */}
          {images.map((image: ImageType) => (
            <ColoringPageImage
              key={image.id}
              image={image}
              categoryName={categoryData.name}
              // Pass imageUrlStub if needed by the component
              // imageUrlStub={imageUrlStub}
            />
          ))}
        </div>
      ) : (
        <p>No coloring pages found in the "{categoryData.name}" category yet.</p>
      )}
    </div>
  );
}

// Optional: Generate metadata dynamically
export async function generateMetadata({ params }: CategoryPageProps) {
  const { categorySlug } = await params;
  // Fetch minimal category data just for the title/description
  const categoryData = await getImagesByCategorySlug(categorySlug) as CategoryWithImages | null;

  if (!categoryData) {
    return {
      title: 'Category Not Found',
    };
  }

  return {
    title: `${categoryData.name} Coloring Pages`,
    description: `Browse coloring pages in the ${categoryData.name} category.`,
    // Add other metadata tags as needed
  };
}

// Optional: Generate static paths if you want to pre-render these pages at build time
// export async function generateStaticParams() {
//   const { data: categories } = await supabase.from('categories').select('slug');
//   return categories?.map((category) => ({
//     categorySlug: category.slug,
//   })) || [];
// } 