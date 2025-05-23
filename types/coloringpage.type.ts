type ColoringPage = {
  id: string; // uuid is represented as string in JS/TS
  title: string;
  description: string | null;
  image_url: string;
  created_at: string; // timestamp with time zone is typically string
  webp_image_url: string | null;
}

export default ColoringPage;