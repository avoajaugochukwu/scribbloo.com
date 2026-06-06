import Image from 'next/image';

const heroImages = [
  { src: '/img/unicorn.png', alt: 'Unicorn coloring page example', priority: true },
  { src: '/img/dinosaur.png', alt: 'Dinosaur coloring page example', priority: false },
  { src: '/img/butterfly.png', alt: 'Butterfly coloring page example', priority: false },
  { src: '/img/fairy-girl.png', alt: 'Fairy coloring page example', priority: false },
];

export default function MobileHeroImages() {
  return (
    // Grid container for 2x2 layout, with gap
    <div className="mx-auto grid w-full max-w-xs grid-cols-2 gap-4">
      {heroImages.map((image) => (
        <div
          key={image.src}
          className="border-2 border-black bg-white p-2 shadow-lg"
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
