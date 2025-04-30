import Category from "./category.type";
import ImageType from "./image.type";

export default interface CategoryWithImages extends Category {
  images: ImageType[];
}