import { getImagesByCategorySlug } from '@/lib/coloringPages';
import Link from 'next/link';
import ColoringPageImage from './components/ColoringPageImage';
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
import CategoryWithImages from '@/types/categorywithimages.type';
import ImageType from '@/types/image.type';
import Image from 'next/image';
import React from 'react';
import { Constants } from '@/config/constants';

interface CategoryPageProps {
  params: Promise<{ categorySlug: string }>;
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { categorySlug } = await params;

  const categoryData = await getImagesByCategorySlug(categorySlug) as CategoryWithImages | null;

  console.log('Category Data:', categoryData);

  if (!categoryData) {
    notFound();
  }

  const images = categoryData.images || [];

  const breadcrumbItems = [
    { label: 'Home', href: '/' },
    { label: 'Coloring Pages', href: '/coloring-pages' },
    { label: categoryData.name, href: `/coloring-pages/${categoryData.slug}` }, // Current page is last
  ];

  return (
    <div className="container mx-auto px-4 mb-20">
      <Breadcrumb>
        <BreadcrumbList>
          {breadcrumbItems.map((item, index) => (
            <React.Fragment key={item.href}>
              <BreadcrumbItem>
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
            </React.Fragment>
          ))}
        </BreadcrumbList>
      </Breadcrumb>


      <h1 className="text-3xl font-bold mb-6 mt-4"> {/* Added mt-4 for spacing */}
        {categoryData.name} Coloring Pages
      </h1>

      <section className="w-4/6">
        <Image 
          src={Constants.SUPABASE_HERO_IMAGES_BUCKET + categoryData.hero_image_url} 
          alt={categoryData.name} 
          width={1000} 
          height={1000} 
          className="w-full h-auto"
        />
        {/* Remove or comment out this section as categoryData.description doesn't exist */}
        {categoryData.description && (
          <p className="text-lg text-gray-600 my-6"
            dangerouslySetInnerHTML={
              { __html: categoryData.description.replace(/"/g, '&quot;').replace(/'/g, '&apos;') }
            } />
        )}
      </section>

      {images.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-6">
          {/* Map over images and render the component */}
          {images.map((image: ImageType) => (
            <ColoringPageImage
              key={image.id}
              image={image}
              categoryName={categoryData.name}
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
