import { Baloo_2, Nunito, Nunito_Sans } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { GoogleAnalytics } from "@next/third-parties/google";
import { metadata } from "./metadata";
import { Toaster } from "@/components/ui/sonner";

// Display: chunky, rounded, storybook — used for every heading.
const display = Baloo_2({
  variable: "--font-display",
  subsets: ["latin"],
  display: "swap",
  weight: ["500", "600", "700", "800"],
});

// Body: warm, rounded humanist sans that pairs with the display.
const body = Nunito({
  variable: "--font-body",
  subsets: ["latin"],
  display: "swap",
});

// Monospace fallback for inline code in blog posts.
const mono = Nunito_Sans({
  variable: "--font-mono-fallback",
  subsets: ["latin"],
  display: "swap",
});

export { metadata };

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Removed JSON-LD script from here if it's handled per-page */}
      </head>
      <body
        className={cn(
          "min-h-screen bg-background font-sans antialiased flex flex-col",
          display.variable,
          body.variable,
          mono.variable
        )}
      >
        <Header />
        <div className="relative flex flex-col flex-grow">
          <main className="flex-grow pt-4">{children}</main>
        </div>
        <Footer />
        <GoogleAnalytics gaId="G-LV4B3PXPG8" />
        <Toaster richColors position="top-right" />
      </body>
    </html>
  );
}
