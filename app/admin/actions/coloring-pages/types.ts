// Type for the data returned by getAdminImages
export type AdminImageWithRelations = {
  id: string; // Assuming UUID
  title: string | null;
  image_url: string | null;
  created_at: string | null;
  categories: string[]; // Names of categories
  tags: string[];       // Names of tags
};

// Type for data needed for the edit form
export type ImageForEdit = {
    id: string; // UUID
    title: string | null;
    description: string | null;
    image_url: string | null; // To display current image
    categoryIds: string[]; // IDs of currently linked categories (UUIDs)
    tagIds: string[];      // IDs of currently linked tags (UUIDs)
}; 