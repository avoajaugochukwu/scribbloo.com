'use client';

import { useFormState, useFormStatus } from 'react-dom';
import { useEffect, useState, useRef } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Checkbox } from "@/components/ui/checkbox";
import type Category from '@/types/category.type';
import { createColoringPage } from '@/app/admin/actions/coloring-pages/create';
import { Loader2 } from 'lucide-react';

const initialState = {
    success: false,
    message: '',
    imageId: undefined,
};

function SubmitButton() {
    const { pending } = useFormStatus();
    return (
        <Button type="submit" disabled={pending} aria-disabled={pending}>
            {pending ? (
                <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                </>
            ) : (
                'Create Coloring Page'
            )}
        </Button>
    );
}

interface ColoringPageFormProps {
    categories: Category[];
}

export default function ColoringPageForm({ categories }: ColoringPageFormProps) {
    const [state, formAction] = useFormState(createColoringPage, initialState);
    const formRef = useRef<HTMLFormElement>(null);
    const [filePreview, setFilePreview] = useState<string | null>(null);
    const [fileName, setFileName] = useState<string>('');

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            setFileName(file.name);
            const reader = new FileReader();
            reader.onloadend = () => {
                setFilePreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        } else {
            setFileName('');
            setFilePreview(null);
        }
    };

    useEffect(() => {
        if (state.message) {
            if (state.success) {
                toast.success(state.message);
                formRef.current?.reset();
                setFilePreview(null);
                setFileName('');
            } else {
                toast.error(state.message);
            }
        }
    }, [state]);

    return (
        <form ref={formRef} action={formAction} className="space-y-6">
            <div>
                <Label htmlFor="title">Title</Label>
                <Input id="title" name="title" type="text" required className="mt-1" />
            </div>

            <div>
                <Label htmlFor="description">Description</Label>
                <Textarea id="description" name="description" className="mt-1" />
            </div>

            <div>
                <Label htmlFor="imageFile">Image File</Label>
                <Input
                    id="imageFile"
                    name="imageFile"
                    type="file"
                    required
                    accept="image/*"
                    onChange={handleFileChange}
                    className="mt-1 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
                />
                {fileName && <p className="text-sm text-muted-foreground mt-1">Selected: {fileName}</p>}
                {filePreview && (
                    <div className="mt-4 border rounded-md p-2 max-w-xs">
                        <p className="text-sm font-medium mb-1">Preview:</p>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={filePreview} alt="Image preview" className="max-w-full h-auto rounded" />
                    </div>
                )}
            </div>

            <div>
                <Label>Categories</Label>
                <div className="mt-2 space-y-2 border p-4 rounded-md max-h-60 overflow-y-auto">
                    {categories.length > 0 ? (
                        categories.map((category) => (
                            <div key={category.id} className="flex items-center space-x-2">
                                <Checkbox
                                    id={`category-${category.id}`}
                                    name="categoryIds"
                                    value={category.id}
                                />
                                <Label htmlFor={`category-${category.id}`} className="font-normal">
                                    {category.name}
                                </Label>
                            </div>
                        ))
                    ) : (
                        <p className="text-sm text-muted-foreground">No categories available.</p>
                    )}
                </div>
            </div>

            <div>
                <Label htmlFor="tagsInput">Tags (comma-separated)</Label>
                <Input
                    id="tagsInput"
                    name="tagsInput"
                    type="text"
                    placeholder="e.g. animal, cute, printable, unicorn"
                    className="mt-1"
                />
                <p className="text-sm text-muted-foreground mt-1">
                    Enter tag names separated by commas. New tags will be created automatically.
                </p>
            </div>

            <SubmitButton />
        </form>
    );
} 