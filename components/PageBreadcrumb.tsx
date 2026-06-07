import React from 'react';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';

export interface CrumbItem {
  label: string;
  href: string;
}

interface PageBreadcrumbProps {
  items: CrumbItem[];
  className?: string;
}

/**
 * Bold brand-styled breadcrumb shared by the coloring-pages index,
 * category, and page-detail routes. Replaces the per-page duplicated
 * markup and the old ">>" text separator with a chevron.
 */
export default function PageBreadcrumb({
  items,
  className = 'mb-4 md:mb-6',
}: PageBreadcrumbProps) {
  return (
    <Breadcrumb className={className}>
      <BreadcrumbList>
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          return (
            <React.Fragment key={item.href}>
              <BreadcrumbItem>
                {isLast ? (
                  <BreadcrumbPage className="font-display font-bold text-terracotta-deep">
                    {item.label}
                  </BreadcrumbPage>
                ) : (
                  <BreadcrumbLink
                    asChild
                    className="font-display font-semibold text-teal-deep hover:text-terracotta"
                  >
                    <Link href={item.href}>{item.label}</Link>
                  </BreadcrumbLink>
                )}
              </BreadcrumbItem>
              {!isLast && (
                <BreadcrumbSeparator>
                  <ChevronRight className="size-4 text-ink/40" />
                </BreadcrumbSeparator>
              )}
            </React.Fragment>
          );
        })}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
