import Category from "./category.type";
import ColoringPage from "./coloringpage.type";

export default interface CategoryWithColoringPages extends Category {
  coloringPages: ColoringPage[];
  seoDetails?: string | null;
  metaDescription?: string | null;
  h1?: string | null;
}