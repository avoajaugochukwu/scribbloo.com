import 'server-only';
import React from 'react';
import { Client } from '@notionhq/client';
import type { BlockObjectResponse, PageObjectResponse } from '@notionhq/client/build/src/api-endpoints';

export const notion = new Client({
  auth: process.env.NOTION_API_KEY,
});

export const fetchPages = React.cache(async () => {
  const response = await notion.databases.query({
    database_id: process.env.NOTION_DATABASE_ID!,
    filter: {
      property: 'Status',
      status: {
        equals: 'Done',
      },
    },
  });
  return response.results;
});

export const fetchBySlug = React.cache(async (slug: string) => {
  const response = await notion.databases.query({
    database_id: process.env.NOTION_DATABASE_ID!,
    filter: {
      property: 'Slug',
      rich_text: {
        equals: slug,
      },
    },
  });

  if (!response.results.length) {
    console.warn(`No page found for slug: ${slug}`);
    return undefined;
  }

  return response.results[0] as PageObjectResponse;
});

// export const fetchPageBlocks = React.cache(async (pageId: string) => {
//   const response = await notion.blocks.children.list({
//     block_id: pageId,
//   });
//   return response.results as BlockObjectResponse[];
// });

export const fetchPageBlocks = React.cache(async (pageId: string) => {
  const blocks: BlockObjectResponse[] = [];
  let cursor: string | undefined = undefined; // Explicitly define as undefined

  do {
    const response = await notion.blocks.children.list({
      block_id: pageId,
      start_cursor: cursor, // Use cursor for pagination
    });

    blocks.push(...(response.results as BlockObjectResponse[]));

    cursor = response.next_cursor ?? undefined; // Convert null to undefined
  } while (cursor); // Keep fetching while there are more results

  return blocks;
});



