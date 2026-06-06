import Image from 'next/image';
import Link from 'next/link';
import type { ComponentProps } from 'react';
import type { MDXRemoteProps } from 'next-mdx-remote/rsc';

/**
 * Component overrides passed to <MDXRemote /> for rendering blog post bodies.
 *
 * `@tailwindcss/typography` (the `prose` plugin) is NOT installed in this repo,
 * so every element is styled explicitly here. The wrapping element in the page
 * provides max-width + vertical rhythm; these styles handle per-element design.
 *
 * Markdown images already point at local paths (`/images/blog/<slug>/inline-N.<ext>`),
 * so `img` is rendered with next/image for sizing + lazy loading (avoids CLS).
 */

type ImgProps = ComponentProps<'img'>;

function MdxImage({ src, alt }: ImgProps) {
  if (typeof src !== 'string' || src.length === 0) return null;
  return (
    <span className="my-8 block overflow-hidden rounded-lg">
      <Image
        src={src}
        alt={alt ?? ''}
        width={1200}
        height={800}
        sizes="(max-width: 768px) 100vw, 768px"
        className="h-auto w-full object-cover"
      />
    </span>
  );
}

type AnchorProps = ComponentProps<'a'>;

function MdxLink({ href, children, ...rest }: AnchorProps) {
  const target = href ?? '#';
  const isInternal = target.startsWith('/') || target.startsWith('#');
  const className = 'font-medium text-primary underline underline-offset-4 hover:text-primary/80';

  if (isInternal) {
    return (
      <Link href={target} className={className}>
        {children}
      </Link>
    );
  }

  return (
    <a href={target} className={className} target="_blank" rel="noopener noreferrer" {...rest}>
      {children}
    </a>
  );
}

export const mdxComponents: MDXRemoteProps['components'] = {
  h1: (props) => (
    <h1 className="mt-10 mb-4 text-3xl font-bold leading-tight md:text-4xl" {...props} />
  ),
  h2: (props) => (
    <h2 className="mt-10 mb-4 text-2xl font-bold leading-tight md:text-3xl" {...props} />
  ),
  h3: (props) => (
    <h3 className="mt-8 mb-3 text-xl font-semibold leading-snug md:text-2xl" {...props} />
  ),
  h4: (props) => <h4 className="mt-6 mb-2 text-lg font-semibold" {...props} />,
  p: (props) => <p className="my-5 leading-relaxed text-foreground/90" {...props} />,
  ul: (props) => <ul className="my-5 list-disc space-y-2 pl-6 text-foreground/90" {...props} />,
  ol: (props) => <ol className="my-5 list-decimal space-y-2 pl-6 text-foreground/90" {...props} />,
  li: (props) => <li className="leading-relaxed" {...props} />,
  blockquote: (props) => (
    <blockquote
      className="my-6 border-l-4 border-primary/40 pl-4 italic text-muted-foreground"
      {...props}
    />
  ),
  hr: () => <hr className="my-10 border-border" />,
  strong: (props) => <strong className="font-semibold text-foreground" {...props} />,
  em: (props) => <em className="italic" {...props} />,
  code: (props) => (
    <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-sm" {...props} />
  ),
  pre: (props) => (
    <pre className="my-6 overflow-x-auto rounded-lg bg-muted p-4 text-sm" {...props} />
  ),
  a: MdxLink,
  img: MdxImage,
};
