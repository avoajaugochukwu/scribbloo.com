import Link from 'next/link';

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t mt-auto py-6 md:py-8"> {/* mt-auto pushes footer down */}
      <div className="container mx-auto px-4 lg:px-6 flex flex-col md:flex-row items-center justify-between gap-4">
        <p className="text-sm text-muted-foreground">
          &copy; {currentYear} Scribbloo. All rights reserved.
        </p>
        <nav className="flex gap-4 sm:gap-6">
          {/* Add relevant footer links */}
          <Link
            href="/privacy-policy" // Example link
            className="text-sm hover:underline underline-offset-4 text-muted-foreground"
            prefetch={false}
          >
            Privacy Policy
          </Link>
          <Link
            href="/terms-of-service" // Example link
            className="text-sm hover:underline underline-offset-4 text-muted-foreground"
            prefetch={false}
          >
            Terms of Service
          </Link>
        </nav>
      </div>
    </footer>
  );
} 