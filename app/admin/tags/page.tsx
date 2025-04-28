import Link from 'next/link';
import { Button } from '@/components/ui/button';

import { TagList } from './TagList'; // <-- Import the new TagList component
import { CreateTagForm } from './CreateTagForm';

// This page remains a Server Component
export default async function ManageTagsPage() {
  return (
    <div className="w-3/5 mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Manage Tags</h1>
        <Button variant="outline" size="sm" asChild>
          <Link href="/admin">Back to Admin</Link>
        </Button>
      </div>
      {/* Render the Create Form (Client Component) */}
      <CreateTagForm />
      <TagList />
    </div>
  );
}

// Optional: Add dynamic = 'force-dynamic' if data needs to be fresh on every load
// export const dynamic = 'force-dynamic'; 