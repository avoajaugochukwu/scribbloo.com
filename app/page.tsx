import Link from 'next/link';
import { Metadata } from 'next';
import { baseUrl } from '@/app/metadata';
import { getRootHub, getRecentLeaves } from '@/lib/content/collections';
import { isRecent } from '@/lib/utils';
import CategoryRail from '@/components/CategoryRail';
import { HeroArt } from '@/components/heroArt';
import ColoringPageImage from './coloring-pages/components/ColoringPageImage';
import { ArrowIcon, SparkleIcon, PaletteIcon, BookIcon } from '@/components/icons';

export const metadata: Metadata = {
  title: 'Free Printable Coloring Pages for All Ages | Scribbloo',
  description:
    'Download hundreds of free, high-quality printable coloring pages for kids, teens, and adults. New unicorns, animals, mandalas, and more added weekly!',
  alternates: { canonical: baseUrl },
  openGraph: {
    title: 'Free Printable Coloring Pages for All Ages | Scribbloo',
    description:
      'Download hundreds of free, high-quality printable coloring pages for kids, teens, and adults.',
    url: baseUrl,
    siteName: 'Scribbloo',
    images: [{ url: `${baseUrl}/img/og-image-home.png`, width: 1200, height: 630, alt: 'Scribbloo Coloring Pages Collection' }],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Free Printable Coloring Pages for All Ages | Scribbloo',
    description: 'Download hundreds of free, high-quality printable coloring pages for kids, teens, and adults.',
  },
  robots: { index: true, follow: true },
};

const COLLAGE = [
  { left: '46%', top: '2%', width: 175, rot: 6, tint: 'bg-pink-t' },
  { left: '2%', top: '20%', width: 150, rot: -7, tint: 'bg-purple-t' },
  { left: '58%', top: '48%', width: 158, rot: -4, tint: 'bg-yellow-t' },
  { left: '20%', top: '58%', width: 150, rot: 8, tint: 'bg-teal-t' },
  { left: '40%', top: '30%', width: 130, rot: -3, tint: 'bg-orange-t' },
];

const FEATURES = [
  {
    href: '/drawing-ideas',
    top: 'bg-purple-t',
    accent: 'text-purple',
    icon: <SparkleIcon className="h-16 w-16" />,
    title: 'Drawing Ideas',
    body: 'Stuck on what to draw? Spin up doodle prompts, step-by-step guides and daily challenges.',
    cta: 'Get inspired',
  },
  {
    href: '/tools',
    top: 'bg-teal-t',
    accent: 'text-teal',
    icon: <PaletteIcon className="h-16 w-16" />,
    title: 'Coloring Tools',
    body: 'Color online with our browser studio, build custom palettes, or resize pages to print.',
    cta: 'Open the studio',
  },
  {
    href: '/blog',
    top: 'bg-orange-t',
    accent: 'text-orange',
    icon: <BookIcon className="h-16 w-16" />,
    title: 'The Scribbloo Blog',
    body: 'Tips for teachers and parents, artist spotlights, and the science of why coloring calms us.',
    cta: 'Read stories',
  },
];

export default async function Home() {
  const [{ themes, counts }, recent] = await Promise.all([getRootHub(), getRecentLeaves(8)]);
  const now = Date.now();
  // Each leaf has exactly one top-level ancestor, so summing theme counts = total leaves.
  const totalPages = themes.reduce((sum, t) => sum + (counts.get(t.pathSlugs.join('/')) ?? 0), 0);

  const jsonLd = { '@context': 'https://schema.org', '@type': 'WebSite', name: 'Scribbloo', url: baseUrl };

  return (
    <div>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      {/* ---------------- HERO ---------------- */}
      <section className="relative overflow-hidden">
        <div className="container mx-auto grid items-center gap-10 px-4 py-12 lg:grid-cols-[1.05fr_0.95fr] lg:px-7 lg:py-16">
          <div className="animate-rise">
            <span className="eyebrow">Free printable &amp; color-online</span>
            <h1 className="mt-3 font-display text-[clamp(44px,5.6vw,78px)] font-bold leading-[1.05]">
              Color outside
              <br />
              the{' '}
              <span className="relative whitespace-nowrap">
                lines
                <svg
                  viewBox="0 0 200 18"
                  preserveAspectRatio="none"
                  fill="none"
                  className="absolute -bottom-3 left-0 h-[18px] w-full"
                  aria-hidden="true"
                >
                  <path d="M3 12 Q40 2 80 10 T160 8 T197 11" stroke="var(--red)" strokeWidth="5" strokeLinecap="round" />
                </svg>
              </span>
            </h1>
            <p className="mt-6 max-w-[34ch] text-xl font-semibold text-ink-soft">
              Thousands of hand-drawn coloring pages, drawing ideas and tools — for tiny artists, big
              kids and grown-ups alike.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3.5">
              <Link
                href="/coloring-pages"
                className="pressable shadow-pop inline-flex items-center gap-2 rounded-full border-[2.5px] border-ink bg-red px-6 py-3.5 font-display text-[17px] font-semibold text-white"
              >
                Browse coloring pages <ArrowIcon className="h-5 w-5" />
              </Link>
              <Link
                href="/drawing-ideas"
                className="pressable shadow-pop inline-flex items-center gap-2 rounded-full border-[2.5px] border-ink bg-cream px-6 py-3.5 font-display text-[17px] font-semibold text-ink"
              >
                Get inspired ✨
              </Link>
            </div>
            <div className="mt-8 flex flex-wrap gap-6">
              <Stat value={totalPages > 0 ? `${totalPages}+` : 'Fresh'} label="FREE PAGES" />
              <Stat value={String(themes.length)} label="BIG THEMES" />
              <Stat value="All ages" label="0 TO 100" />
            </div>
          </div>

          {/* Collage of floating square line-art cards (varied sizes = dynamic) */}
          <div className="relative hidden h-[460px] lg:block" aria-hidden="true">
            {COLLAGE.map((s, i) => (
              <article
                key={i}
                className={`animate-float-y absolute shadow-pop overflow-hidden rounded-[var(--radius-md)] border-[2.5px] border-ink ${s.tint}`}
                style={{
                  left: s.left,
                  top: s.top,
                  width: s.width,
                  '--rot': `${s.rot}deg`,
                  transform: `rotate(${s.rot}deg)`,
                  animationDelay: `${i * 0.6}s`,
                  zIndex: i + 1,
                } as React.CSSProperties}
              >
                <div className="aspect-square w-full p-3">
                  <HeroArt index={i} className="h-full w-full" />
                </div>
              </article>
            ))}
            <span className="blob size-[120px] bg-yellow" style={{ left: '30%', top: '8%' }} />
            <span className="blob size-[90px] bg-teal" style={{ left: '72%', top: '30%' }} />
            <span className="blob size-[80px] bg-pink" style={{ left: '8%', top: '64%' }} />
          </div>
        </div>
      </section>

      {/* ---------------- CATEGORIES ---------------- */}
      <section className="container mx-auto px-4 py-12 lg:px-7">
        <SectionHead eyebrow="Pick a theme" title="What do you feel like coloring?" href="/coloring-pages" linkLabel="See all pages" />
        <CategoryRail themes={themes} counts={counts} />
      </section>

      {/* ---------------- POPULAR ---------------- */}
      {recent.length > 0 && (
        <section className="container mx-auto px-4 py-12 lg:px-7">
          <SectionHead eyebrow="Fresh off the press" title="New coloring pages" href="/coloring-pages" linkLabel="View library" />
          <div className="grid grid-cols-2 gap-5 md:grid-cols-3 lg:grid-cols-4">
            {recent.map((leaf, i) => (
              <ColoringPageImage
                key={leaf.href}
                coloringPage={leaf.page}
                href={leaf.href}
                contextLabel="Scribbloo"
                tintIndex={i}
                priority={i < 4}
                isNew={isRecent(leaf.page.createdAt, now)}
              />
            ))}
          </div>
        </section>
      )}

      {/* ---------------- MORE WAYS ---------------- */}
      <section className="container mx-auto px-4 py-12 lg:px-7">
        <SectionHead eyebrow="Beyond the page" title="More ways to make" />
        <div className="grid gap-5 md:grid-cols-3">
          {FEATURES.map((f) => (
            <Link
              key={f.href}
              href={f.href}
              className="pressable shadow-pop-sm flex flex-col overflow-hidden rounded-[var(--radius-lg)] border-[2.5px] border-ink bg-cream"
            >
              <div className={`grid h-[150px] place-items-center border-b-[2.5px] border-ink ${f.top} ${f.accent}`}>
                {f.icon}
              </div>
              <div className="p-6">
                <h3 className="text-[22px] font-semibold">{f.title}</h3>
                <p className="mt-2 font-semibold text-ink-soft">{f.body}</p>
                <span className={`link-arrow mt-3.5 ${f.accent}`}>
                  {f.cta} <ArrowIcon className="h-5 w-5" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ---------------- CTA BAND ---------------- */}
      <section className="container mx-auto px-4 py-12 lg:px-7">
        <div className="dotgrid relative overflow-hidden rounded-[var(--radius-xl)] border-[3px] border-ink bg-cream p-12 text-center">
          <span className="eyebrow">No app, no signup</span>
          <h2 className="mt-3 font-display text-[clamp(32px,4vw,50px)] font-semibold">Ready, set, color!</h2>
          <p className="mx-auto mt-3.5 max-w-[46ch] text-lg font-semibold text-ink-soft">
            Pick a page, print it or color it online in seconds. Brand-new artwork added every single
            week.
          </p>
          <Link
            href="/coloring-pages"
            className="pressable shadow-pop mt-6 inline-flex items-center gap-2 rounded-full border-[2.5px] border-ink bg-red px-6 py-3.5 font-display text-[17px] font-semibold text-white"
          >
            Start coloring <ArrowIcon className="h-5 w-5" />
          </Link>
        </div>
      </section>
    </div>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div className="flex flex-col gap-1">
      <b className="font-display text-[26px] font-bold leading-none">{value}</b>
      <span className="text-[13.5px] font-bold text-ink-soft">{label}</span>
    </div>
  );
}

function SectionHead({
  eyebrow,
  title,
  href,
  linkLabel,
}: {
  eyebrow: string;
  title: string;
  href?: string;
  linkLabel?: string;
}) {
  return (
    <div className="mb-7 flex items-end justify-between gap-5">
      <div>
        <span className="eyebrow">{eyebrow}</span>
        <h2 className="mt-1.5 font-display text-[clamp(30px,3.4vw,42px)] font-semibold">{title}</h2>
      </div>
      {href && linkLabel && (
        <Link href={href} className="link-arrow shrink-0 whitespace-nowrap">
          {linkLabel} <ArrowIcon className="h-5 w-5" />
        </Link>
      )}
    </div>
  );
}
