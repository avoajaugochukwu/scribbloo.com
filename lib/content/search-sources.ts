import 'server-only';

import { imageUrl } from '@/lib/images';
import { getAllCollectionNodes, getAllLeaves, getRootHub } from './collections';
import { getAllPosts } from './blog';
import { getDocs } from './docs';
import type { SearchDoc, SearchType } from './search-shared';

/**
 * Build-time sources of the site search index. Every searchable thing becomes a
 * `SearchDoc`. To add a new content type:
 *   1. add its key to `SearchType` + an entry to `SEARCH_TYPE_META` (search-shared.ts), and
 *   2. add a source function to the `SOURCES` array below.
 * scripts/build-runtime-index.ts writes the result into the runtime index that
 * search.ts ranks; nothing else changes.
 */

/* -------------------------------------------------------------------------- */
/* Sources — one function per content type, each emitting SearchDocs          */
/* -------------------------------------------------------------------------- */

async function coloringPageDocs(): Promise<SearchDoc[]> {
  const leaves = await getAllLeaves();
  return leaves.map((leaf) => ({
    id: `coloring-page:${leaf.href}`,
    type: 'coloring-page' as const,
    title: leaf.page.title,
    description: leaf.page.description,
    url: leaf.href,
    image: imageUrl({ kind: 'coloring-page', slug: leaf.page.image, variant: 'thumb' }),
    keywords: [...leaf.page.tags, ...leaf.pathSlugs.slice(0, -1)],
    date: leaf.page.createdAt,
  }));
}

async function collectionDocs(): Promise<SearchDoc[]> {
  const nodes = await getAllCollectionNodes();
  return nodes.map((node) => ({
    id: `collection:${node.href}`,
    type: 'collection' as const,
    title: node.category.name,
    description: node.category.seoDescription ?? node.category.description,
    url: node.href,
    image: node.category.thumbnailImage
      ? imageUrl({ kind: 'category-thumb', slug: node.category.slug })
      : node.category.heroImage
        ? imageUrl({ kind: 'category-hero', slug: node.category.slug })
        : null,
    keywords: [...node.category.aliases, ...node.pathSlugs],
    date: null,
  }));
}

async function facetDocs(): Promise<SearchDoc[]> {
  const { facets } = await getRootHub();
  return facets.map((facet) => ({
    id: `facet:/coloring-pages/${facet.slug}`,
    type: 'facet' as const,
    title: facet.name,
    description: facet.seoDescription ?? facet.description,
    url: `/coloring-pages/${facet.slug}`,
    image: facet.thumbnailImage ? imageUrl({ kind: 'category-thumb', slug: facet.slug }) : null,
    keywords: [...facet.aliases, facet.facetTag ?? ''].filter(Boolean),
    date: null,
  }));
}

async function blogDocs(): Promise<SearchDoc[]> {
  const posts = await getAllPosts();
  return posts.map((post) => ({
    id: `blog:/blog/${post.slug}`,
    type: 'blog' as const,
    title: post.title,
    description: post.excerpt ?? post.metaDescription,
    url: `/blog/${post.slug}`,
    image: post.featuredImage ? imageUrl({ kind: 'blog-featured', slug: post.slug }) : null,
    keywords: post.tags,
    date: post.publishedAt,
  }));
}

/** Factory for the three flat doc namespaces (how-to-draw, drawing-ideas, tools). */
function docNamespaceSource(namespace: Extract<SearchType, 'how-to-draw' | 'drawing-ideas' | 'tools'>) {
  return async (): Promise<SearchDoc[]> => {
    const docs = await getDocs(namespace);
    return docs.map((doc) => ({
      id: `${namespace}:/${namespace}/${doc.slug}`,
      type: namespace,
      title: doc.title,
      description: doc.description ?? doc.subtitle,
      url: `/${namespace}/${doc.slug}`,
      image: doc.featuredImage ? imageUrl({ kind: 'doc-featured', slug: doc.slug, namespace }) : null,
      keywords: [doc.category ?? '', doc.slug].filter(Boolean),
      date: null,
    }));
  };
}

/** The registry. Add a content type here and it becomes searchable everywhere. */
const SOURCES: Array<() => Promise<SearchDoc[]>> = [
  coloringPageDocs,
  collectionDocs,
  facetDocs,
  blogDocs,
  docNamespaceSource('how-to-draw'),
  docNamespaceSource('drawing-ideas'),
  docNamespaceSource('tools'),
];

export async function buildSearchIndex(): Promise<SearchDoc[]> {
  const batches = await Promise.all(SOURCES.map((source) => source()));
  return batches.flat();
}
