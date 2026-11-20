/**
 * Writes lib/content/generated/runtime-index.json: the content facts the Worker
 * needs at request time (see lib/content/runtime-index.ts). Runs in `prebuild`
 * after validate. Needs `--conditions=react-server` (the loaders import server-only).
 */
import fs from 'node:fs';
import path from 'node:path';

import { getRootHub, getRouteTable } from '../lib/content/collections';
import { buildSearchIndex } from '../lib/content/search-sources';
import type { RuntimeIndexFile } from '../lib/content/runtime-index';

async function main() {
  const [routes, { themes }, searchIndex] = await Promise.all([getRouteTable(), getRootHub(), buildSearchIndex()]);
  const out: RuntimeIndexFile = {
    searchIndex,
    themes: themes.map((t) => ({ href: t.href, name: t.category.name })),
    routes: {
      collections: [...routes.collections],
      facets: [...routes.facets],
      leaves: [...routes.leaves],
      slugCanonical: [...routes.slugCanonical],
      aliasTo: [...routes.aliasTo],
    },
  };
  const file = path.join(process.cwd(), 'lib', 'content', 'generated', 'runtime-index.json');
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, JSON.stringify(out));
  console.log(`[runtime-index] ${searchIndex.length} search docs, ${routes.leaves.size} leaves -> ${path.relative(process.cwd(), file)}`);
}

main().catch((error) => {
  console.error('[runtime-index] failed:', error);
  process.exit(1);
});
