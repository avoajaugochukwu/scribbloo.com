import Image from 'next/image';

const heroImages = [
  { src: '/img/unicorn.png', alt: 'Unicorn coloring page example', priority: true },
  { src: '/img/dinosaur.png', alt: 'Dinosaur coloring page example', priority: false },
  { src: '/img/butterfly.png', alt: 'Butterfly coloring page example', priority: false },
  { src: '/img/fairy-girl.png', alt: 'Fairy coloring page example', priority: false },
];

export default function MobileHeroImages() {
  const tilts = ['-rotate-3', 'rotate-2', 'rotate-3', '-rotate-2'];

  return (
    // Grid container for 2x2 layout, with gap
    <div className="mx-auto grid w-full max-w-xs grid-cols-2 gap-5">
      {heroImages.map((image, i) => (
        <div
          key={image.src}
          className={`retro-frame shadow-pop animate-pop-in p-2 ${tilts[i]}`}
          style={{ animationDelay: `${i * 100}ms` }}
        >
          <div className="relative aspect-[210/297] w-full overflow-hidden">
            <Image
              src={image.src}
              alt={image.alt}
              fill
              sizes="(max-width: 480px) 40vw, 150px"
              className="object-contain"
              priority={image.priority}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
