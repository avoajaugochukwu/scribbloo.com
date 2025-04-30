import Link from 'next/link';
import Image from 'next/image';

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-14 items-center px-4 lg:px-6">
        {/* Site Title/Logo */}
        <div className="mr-4 flex">
          <Link href="/" className="mr-6 flex items-center space-x-2">
            <Image src="/img/Logo.svg" alt="Scribbloo Logo" width={150} height={100} />
          </Link>
        </div>

        {/* Right-aligned items - Move Nav Links Here */}
        {/* Added gap-4 lg:gap-6 for spacing between links */}
        <div className="flex flex-1 items-center justify-end space-x-4 lg:space-x-6 text-sm">
          {/* Moved Nav Links */}
          <Link
            href="/"
            className="transition-colors hover:text-foreground/80 text-foreground/60"
          >
            Home
          </Link>
          <Link
            href="/blog"
            className="transition-colors hover:text-foreground/80 text-foreground" // Example: Highlight current section
          >
            Blog
          </Link>
          <Link
            href="/coloring-pages"
            className="transition-colors hover:text-foreground/80 text-foreground/60"
          >
            Coloring Pages
          </Link>
          {/* Add other links like "/about", "/contact" here if needed */}

          {/* Keep other right-aligned items here */}
          {/* Example: Add a theme toggle or login button here */}
          {/* <ThemeToggle /> */}
          {/* <Button variant="outline" size="sm">Login</Button> */}
        </div>
      </div>
    </header>
  );
} 