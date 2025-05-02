import { Button } from '@/components/ui/button';
/* eslint-disable @typescript-eslint/no-explicit-any */
import Link from 'next/link';
import { PlusCircle } from 'lucide-react';
import Image from 'next/image';
import { Constants } from '@/config/constants';
import { getCategories } from '../actions/categories/read';
import Category from '@/types/category.type';
import {
    Table,
    TableBody,
    TableCaption,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Pencil } from 'lucide-react';
import { DeleteCategoryButton } from '../components/DeleteCategoryButton';

export default async function ManageCategoriesPage() {
    let categories: Category[] = [];
    let fetchError: string | null = null;
    try {
        categories = await getCategories();
    } catch (error: any) {
        console.error("Failed to load categories:", error);
        fetchError = error.message || "An unknown error occurred.";
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Manage Categories</h1>
                <div className="flex gap-2">
                    <Button asChild>
                        <Link href="/admin/categories/create">
                            <PlusCircle className="mr-2 h-4 w-4" /> Create New Category
                        </Link>
                    </Button>
                    <Button variant="outline" asChild>
                        <Link href="/admin">Back to Admin Dashboard</Link>
                    </Button>
                </div>
            </div>

            {fetchError && <p className="text-red-500">Error loading categories: {fetchError}</p>}

            {!fetchError && (
                <div className="bg-white p-6 rounded-lg shadow overflow-x-auto">
                    <Table>
                        <TableCaption>A list of your categories.</TableCaption>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[80px]">Image</TableHead>
                                <TableHead>Name</TableHead>
                                <TableHead>Slug</TableHead>
                                <TableHead>Description</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {categories.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center">
                                        No categories found.
                                    </TableCell>
                                </TableRow>
                            )}
                            {categories.map((category) => {
                                const imageUrl = category.thumbnail_image
                                    ? `${Constants.SUPABASE_THUMBNAIL_IMAGES_BUCKET_URL}${category.thumbnail_image}`
                                    : null;

                                return (
                                    <TableRow key={category.id}>
                                        <TableCell>
                                            {imageUrl ? (
                                                <Image
                                                    src={imageUrl}
                                                    alt={category.name || 'Category image'}
                                                    width={50}
                                                    height={50}
                                                    className="object-cover rounded"
                                                />
                                            ) : (
                                                <div className="w-[50px] h-[50px] bg-gray-200 rounded flex items-center justify-center text-xs text-gray-500">
                                                    No img
                                                </div>
                                            )}
                                        </TableCell>
                                        <TableCell className="font-medium">{category.name}</TableCell>
                                        <TableCell>{category.slug}</TableCell>
                                        <TableCell className="max-w-xs truncate">{category.description}</TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end space-x-2">
                                                <Button 
                                                    variant="outline" 
                                                    size="sm" 
                                                    asChild
                                                >
                                                    <Link href={`/admin/categories/edit/${category.id}`}>
                                                        <Pencil className="h-4 w-4" />
                                                        Edit
                                                    </Link>
                                                </Button>
                                                <DeleteCategoryButton 
                                                    categoryId={category.id} 
                                                    categoryName={category.name} 
                                                />
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
                </div>
            )}
        </div>
    );
}

// Optional: Add dynamic = 'force-dynamic' if data needs to be fresh on every load
// export const dynamic = 'force-dynamic'; 