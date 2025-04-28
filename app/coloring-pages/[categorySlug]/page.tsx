import { getImagesByCategorySlug } from '@/lib/coloringPages';
import Link from 'next/link';
import { CategoryWithImages, ImageType } from '@/types/database'; // Adjust path if needed
import ColoringPageImage from './components/ColoringPageImage'; // Relative path to the component
import { notFound } from 'next/navigation';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { Metadata } from 'next';

// Define the props for the page component
interface CategoryPageProps {
  params: Promise<{ categorySlug: string }>;
  // searchParams: { [key: string]: string | string[] | undefined }; // Include if you use searchParams
}

// This is a React Server Component (RSC)
export default async function CategoryPage({ params }: CategoryPageProps) {
  const { categorySlug } = await params;

  // Fetch the category details and its associated images
  const categoryData = await getImagesByCategorySlug(categorySlug) as CategoryWithImages | null;

  // Handle case where category is not found
  if (!categoryData) {
    notFound(); // Trigger 404 page
  }

  // Remove imageUrlStub if URL construction is moved to the component
  // const imageUrlStub = Constants.SUPABASE_URL + '/storage/v1/object/public/images/'
  // Handle case where category exists but has no images (adjust as needed)
  const images = categoryData.images || [];
  // console.log('Images:', images); // Keep for debugging if needed

  const breadcrumbItems = [
    { label: 'Home', href: '/' },
    { label: 'Coloring Pages', href: '/coloring-pages' },
    { label: categoryData.name, href: `/coloring-pages/${categoryData.slug}` }, // Current page is last
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <Breadcrumb>
        <BreadcrumbList>
          {breadcrumbItems.map((item, index) => (
            <> {/* Use Fragment to handle key prop correctly */}
              <BreadcrumbItem key={item.href}>
                {index === breadcrumbItems.length - 1 ? (
                  // Render last item as BreadcrumbPage (not a link)
                  <BreadcrumbPage>{item.label}</BreadcrumbPage>
                ) : (
                  // Render other items as links
                  <BreadcrumbLink asChild>
                    <Link href={item.href}>{item.label}</Link>
                  </BreadcrumbLink>
                )}
              </BreadcrumbItem>
              {index < breadcrumbItems.length - 1 && (
                // Add separator if not the last item
                <BreadcrumbSeparator />
              )}
            </>
          ))}
        </BreadcrumbList>
      </Breadcrumb>

      <h1 className="text-3xl font-bold mb-6 mt-4"> {/* Added mt-4 for spacing */}
        {categoryData.name} Coloring Pages
      </h1>

      {/* Remove or comment out this section as categoryData.description doesn't exist */}
      {/* {categoryData.description && (
        <p className="text-lg text-gray-600 mb-6" dangerouslySetInnerHTML={{ __html: categoryData.description.replace(/"/g, '&quot;').replace(/'/g, '&apos;') }} />
      )} */}

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
        <p>No coloring pages found in the &quot;{categoryData.name}&quot; category yet. Check back soon!</p>
      )}
    </div>
  );
}

// Optional: Generate metadata dynamically
export async function generateMetadata(
  { params }: CategoryPageProps,
): Promise<Metadata> {
  const { categorySlug } = await params;
  const categoryData = await getImagesByCategorySlug(categorySlug) as CategoryWithImages | null;

  if (!categoryData) {
    return {
      title: 'Category Not Found',
      description: 'The requested category could not be found.',
    };
  }

  // Customize title and description based on the category
  const title = `${categoryData.name} Coloring Pages - Free Printables`;
  // Create a generic description since categoryData.description doesn't exist
  const description = `Explore our collection of ${categoryData.name} coloring pages. Download and print free images for kids and adults.`;

  // Optionally merge with parent metadata
  // const previousImages = (await parent).openGraph?.images || []

  return {
    title,
    description, // Use the generic description
    openGraph: {
      title,
      description, // Use the generic description
      // images: ['/some-specific-page-image.jpg', ...previousImages], // Add specific images if needed
    },
  };
}

// Optional: Generate static paths if you want to pre-render these pages at build time
// export async function generateStaticParams() {
//   const { data: categories } = await supabase.from('categories').select('slug');
//   return categories?.map((category) => ({
//     categorySlug: category.slug,
//   })) || [];
// } 