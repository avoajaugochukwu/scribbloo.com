import { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ColoringPageForm from './components/ColoringPageForm';
import { getCategories } from '@/app/admin/actions/categories/read';

export const metadata: Metadata = {
    title: 'Create New Coloring Page | Admin Dashboard',
    description: 'Add a new coloring page image, assign categories and tags.',
};

export default async function CreateColoringPage() {
    const categories = await getCategories();

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="mb-6">
                <Button asChild variant="outline" size="sm">
                    <Link href="/admin">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Dashboard
                    </Link>
                </Button>
            </div>

            <h1 className="text-3xl font-bold mb-6">Create New Coloring Page</h1>

            <ColoringPageForm categories={categories} />
        </div>
    );
} 