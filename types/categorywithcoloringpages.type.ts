import Category from "./category.type";
import ColoringPage from "./coloringpage.type";

export default interface CategoryWithColoringPages extends Category {
  coloringPages: ColoringPage[];
}