import 'server-only';

import data from './generated/runtime-index.json';
import { resolvePath as resolveWith, type Resolved, type RouteTable } from './collections';
import type { SearchDoc } from './search-shared';

/**
 * Content facts needed at REQUEST time (search, runtime redirects/404s, footer).
 * The Worker has no content/ folder, so scripts/build-runtime-index.ts writes them
 * to generated/runtime-index.json in `prebuild`. Everything else is prerendered.
 */

export interface ThemeLink {
  href: string;
  name: string;
}

/** The JSON shape: Maps/Sets as entry arrays. */
export interface RuntimeIndexFile {
  searchIndex: SearchDoc[];
  themes: ThemeLink[];
  routes: {
    collections: [string, number][];
    facets: [string, number][];
    leaves: string[];
    slugCanonical: [string, string | null][];
    aliasTo: [string, string][];
  };
}

const file = data as RuntimeIndexFile;

const routeTable: RouteTable = {
  collections: new Map(file.routes.collections),
  facets: new Map(file.routes.facets),
  leaves: new Set(file.routes.leaves),
  slugCanonical: new Map(file.routes.slugCanonical),
  aliasTo: new Map(file.routes.aliasTo),
};

export const searchIndex: SearchDoc[] = file.searchIndex;

/** Top-level themes in hub order. */
export const themeLinks: ThemeLink[] = file.themes;

export function resolvePath(parts: string[]): Promise<Resolved> {
  return resolveWith(routeTable, parts);
}
