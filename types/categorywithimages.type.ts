import Category from "./category.type";
import ColoringPage from "./coloringpage.type";

export default interface CategoryWithImages extends Category {
  images: ColoringPage[];
}