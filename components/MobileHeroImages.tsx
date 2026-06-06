import Image from 'next/image';

export default function MobileHeroImages() {
  return (
    // Grid container for 2x2 layout, with gap
    <div className="grid grid-cols-2 gap-4 w-full max-w-xs mx-auto">

      {/* Unicorn Image */}
      <div className="w-full"> {/* Let grid control width */}
        <Image
          src="/img/unicorn.png"
          alt="Unicorn coloring page example"
          width={150} // Smaller size for mobile grid
          height={225}
          className="rounded-2xl border-4 border-white shadow-lg ring-2 ring-yellow-300 w-full h-auto" // Ensure image scales within container
          priority // Keep priority on first image if desired
        />
      </div>

      {/* Dinosaur Image */}
      <div className="w-full">
        <Image
          src="/img/dinosaur.png"
          alt="Dinosaur coloring page example"
          width={150}
          height={225}
          className="rounded-2xl border-4 border-white shadow-lg ring-2 ring-emerald-300 w-full h-auto"
        />
      </div>

      {/* Butterfly Image */}
      <div className="w-full">
        <Image
          src="/img/butterfly.png"
          alt="Butterfly coloring page example"
          width={150}
          height={225}
          className="rounded-2xl border-4 border-white shadow-lg ring-2 ring-sky-300 w-full h-auto"
        />
      </div>

      {/* Fairy Image */}
      <div className="w-full">
        <Image
          src="/img/fairy-girl.png"
          alt="Fairy coloring page example"
          width={150}
          height={225}
          className="rounded-2xl border-4 border-white shadow-lg ring-2 ring-pink-300 w-full h-auto"
        />
      </div>
    </div>
  );
} 