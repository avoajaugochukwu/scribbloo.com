/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { Fragment } from 'react';
import type { BlockObjectResponse } from '@notionhq/client/build/src/api-endpoints';

// Define a type for rich text items if needed, simplifying here
type RichTextItem = any;

// Helper to render rich text arrays
const renderRichText = (richText: RichTextItem[]) => {
  return richText.map((textItem, index) => {
    const { annotations, plain_text, href } = textItem;
    let element = <>{plain_text}</>;

    if (annotations.bold) element = <strong>{element}</strong>;
    if (annotations.italic) element = <em>{element}</em>;
    if (annotations.strikethrough) element = <del>{element}</del>;
    if (annotations.underline) element = <u>{element}</u>;
    if (annotations.code) element = <code className="bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded text-sm font-mono">{element}</code>;
    if (href) element = <a href={href} target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 hover:underline">{element}</a>;

    // Apply color classes if needed (requires mapping Notion colors to Tailwind)
    // if (annotations.color !== 'default') { ... }

    return <Fragment key={index}>{element}</Fragment>;
  });
};

export const NotionRenderer: React.FC<{ blocks: BlockObjectResponse[] }> = ({ blocks }) => {
  return (
    <div className="prose dark:prose-invert max-w-none space-y-4">
      {blocks.map((block) => {
        const { type, id } = block;
        const value = block[type as keyof BlockObjectResponse] as any; // Type assertion

        switch (type) {
          case 'paragraph':
            return <p key={id}>{renderRichText(value.rich_text)}</p>;

          case 'heading_1':
            return <h1 key={id} className="text-3xl font-bold mt-8 mb-4">{renderRichText(value.rich_text)}</h1>;

          case 'heading_2':
            return <h2 key={id} className="text-2xl font-semibold mt-6 mb-3">{renderRichText(value.rich_text)}</h2>;

          case 'heading_3':
            return <h3 key={id} className="text-xl font-semibold mt-4 mb-2">{renderRichText(value.rich_text)}</h3>;

          case 'bulleted_list_item':
          case 'numbered_list_item':
            // Note: This basic renderer doesn't group list items.
            // A full implementation would group consecutive items.
            // const ListTag = type === 'numbered_list_item' ? 'ol' : 'ul';
            // Simple rendering as individual items for now
            return (
              <li key={id} className="ml-6">
                {renderRichText(value.rich_text)}
              </li>
            );
            // Proper implementation would look like:
            // if is start of list: <ListTag><li key={id}>...</li>
            // if middle: <li key={id}>...</li>
            // if end: <li key={id}>...</li></ListTag>

          case 'to_do':
            return (
              <div key={id} className="flex items-center gap-2">
                <input type="checkbox" checked={value.checked} readOnly className="form-checkbox h-4 w-4 text-blue-600"/>
                <span>{renderRichText(value.rich_text)}</span>
              </div>
            );

          case 'toggle':
            return (
              <details key={id} className="bg-gray-50 dark:bg-gray-800 p-3 rounded">
                <summary className="cursor-pointer font-medium">{renderRichText(value.rich_text)}</summary>
                {/* Recursive rendering for nested blocks would go here if needed */}
              </details>
            );

          case 'code':
             // Basic code block - lacks syntax highlighting
            return (
              <pre key={id} className="bg-gray-800 dark:bg-gray-900 text-white p-4 rounded-md overflow-x-auto text-sm font-mono my-4">
                <code>{renderRichText(value.rich_text)}</code>
              </pre>
            );

          case 'image':
            const src = value.type === 'external' ? value.external.url : value.file.url;
            const caption = value.caption.length ? renderRichText(value.caption) : null;
            return (
              <figure key={id} className="my-6">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={src} alt={caption ? String(caption) : 'Notion image'} className="max-w-full h-auto rounded-md mx-auto" />
                {caption && <figcaption className="text-center text-sm text-muted-foreground mt-2">{caption}</figcaption>}
              </figure>
            );

          case 'divider':
            return <hr key={id} className="my-6 border-gray-200 dark:border-gray-700" />;

          case 'quote':
            return (
              <blockquote key={id} className="border-l-4 border-gray-300 dark:border-gray-600 pl-4 italic text-muted-foreground my-4">
                {renderRichText(value.rich_text)}
              </blockquote>
            );

          case 'callout':
             // Basic callout styling
            return (
              <div key={id} className="flex items-start gap-3 bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800/50 p-4 rounded-md my-4">
                 {value.icon?.emoji && <span className="text-xl">{value.icon.emoji}</span>}
                 {/* Add handling for external/file icons if needed */}
                 <div>{renderRichText(value.rich_text)}</div>
              </div>
            );

          // Add cases for other block types you use (video, embed, etc.)

          default:
            console.warn(`Unsupported block type: ${type}`);
            return <p key={id} className="text-red-500">[Unsupported Block: {type}]</p>;
        }
      })}
    </div>
  );
}; 