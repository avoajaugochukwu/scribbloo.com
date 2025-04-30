-- Create coloring_pages table (formerly images)
create table coloring_pages (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  image_url text not null,
  created_at timestamp with time zone default timezone('utc', now())
);

-- Create categories table
create table categories (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  slug text unique,
  description text default '' not null,
  seo_title text default '' not null,
  seo_description text default '' not null,
  seo_meta_description text default '' not null,
  hero_image text default '' not null,
  thumbnail_image text default '' not null

);

-- Create tags table
create table tags (
  id uuid primary key default gen_random_uuid(),
  name text not null unique
);

-- Create image_categories join table
create table coloring_page_categories (
  id uuid primary key default gen_random_uuid(),
  coloring_page_id uuid references coloring_pages(id) on delete cascade,
  category_id uuid references categories(id) on delete cascade
);

-- Create image_tags join table
create table coloring_page_tags (
  id uuid primary key default gen_random_uuid(),
  coloring_page_id uuid references coloring_pages(id) on delete cascade,
  tag_id uuid references tags(id) on delete cascade
);

-- NOTE: Remember to update the update_image_links RPC function in your database
--       if it references the 'images' table directly.
