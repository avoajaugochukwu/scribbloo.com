-- Create images table
create table images (
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
  hero_image_url text default '' not null,
  thumbnail_image_url text default '' not null

);

-- Create tags table
create table tags (
  id uuid primary key default gen_random_uuid(),
  name text not null unique
);

-- Create image_categories join table
create table image_categories (
  id uuid primary key default gen_random_uuid(),
  image_id uuid references images(id) on delete cascade,
  category_id uuid references categories(id) on delete cascade
);

-- Create image_tags join table
create table image_tags (
  id uuid primary key default gen_random_uuid(),
  image_id uuid references images(id) on delete cascade,
  tag_id uuid references tags(id) on delete cascade
);
