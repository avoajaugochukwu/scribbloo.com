import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Whether an ISO date is within `days` of `nowMs`. Pass a fixed `nowMs` from the
 * server so the result is identical at build and on hydration (no mismatch).
 */
export function isRecent(createdAt: string, nowMs: number, days = 21): boolean {
  const t = Date.parse(createdAt);
  if (Number.isNaN(t)) return false;
  return nowMs - t < days * 86_400_000;
}

export function generateSlug(text: string): string {
  if (!text) return '';
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')           // Replace spaces with -
    .replace(/[^\w-]+/g, '')        // Remove all non-word chars except -
    .replace(/--+/g, '-')           // Replace multiple - with single -
    .replace(/^-+/, '')             // Trim - from start of text
    .replace(/-+$/, '');            // Trim - from end of text
}
