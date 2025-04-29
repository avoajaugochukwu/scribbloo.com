import Category from "./category.type";
import ImageType from "./image.type";

export type CategoryWithImages = Category & {
  images: ImageType[]; // Array of images associated with the category
}

export default CategoryWithImages;