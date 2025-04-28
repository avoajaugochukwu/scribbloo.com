'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { createTag } from '../actions/tags/create';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export function CreateTagForm() {
  const router = useRouter();
  const [tagName, setTagName] = useState('');
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage(null);

    startTransition(async () => {
      const formData = new FormData();
      formData.append('tagName', tagName);

      const result = await createTag(formData);

      if (result.success) {
        setMessage({ text: result.message, type: 'success' });
        setTagName('');
        router.refresh();
      } else {
        setMessage({ text: result.message, type: 'error' });
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="mt-6 p-4 border rounded-lg bg-gray-50 shadow-sm">
        <h2 className="text-lg font-semibold mb-3">Add New Tag</h2>
        <div className="flex items-end space-x-2">
            <div className="flex-grow">
                <label htmlFor="tagName" className="sr-only">Tag Name</label>
                <Input
                    type="text"
                    id="tagName"
                    name="tagName"
                    value={tagName}
                    onChange={(e) => setTagName(e.target.value)}
                    placeholder="Enter new tag name"
                    required
                    disabled={isPending}
                    className="w-full"
                />
            </div>
            <Button type="submit" disabled={isPending || !tagName.trim()}>
                {isPending ? 'Adding...' : 'Add Tag'}
            </Button>
        </div>
         {message && (
            <p className={`mt-2 text-sm ${message.type === 'error' ? 'text-red-600' : 'text-green-600'}`}>
                {message.text}
            </p>
        )}
    </form>
  );
} 