import { revalidatePath } from 'next/cache';
import logger from '@/lib/logger';
import { Logger } from 'pino';

export type RevalidationType = 'page' | 'layout';
export type EntityType = 'category' | 'coloringPage' | 'tag';

/**
 * Static service for handling path revalidation with integrated logging
 */
export class RevalidationService {
  /**
   * Revalidate a single path with logging
   */
  static revalidateSinglePath(
    path: string, 
    type: RevalidationType = 'page',
    context?: { action: string; entityId?: string }
  ): void {
    const log = context 
      ? logger.child({ service: 'RevalidationService', ...context })
      : logger.child({ service: 'RevalidationService' });
    
    log.info({ path, type }, `Revalidating ${type}: ${path}`);
    revalidatePath(path, type);
  }
  
  /**
   * Revalidate multiple paths with logging
   */
  static revalidateMultiplePaths(
    paths: { path: string; type?: RevalidationType }[],
    context?: { action: string; entityId?: string }
  ): void {
    const log = context 
      ? logger.child({ service: 'RevalidationService', ...context })
      : logger.child({ service: 'RevalidationService' });
    
    log.info({ pathCount: paths.length }, `Revalidating ${paths.length} paths`);
    
    for (const { path, type = 'page' } of paths) {
      log.debug({ path, type }, `Revalidating ${type}: ${path}`);
      revalidatePath(path, type);
    }
    
    log.info('Completed path revalidation');
  }
  
  /**
   * Revalidate standard paths for common entity types
   */
  static revalidateEntity(
    entity: EntityType,
    context?: { action: string; entityId?: string }
  ): void {
    const log = context 
      ? logger.child({ service: 'RevalidationService', ...context })
      : logger.child({ service: 'RevalidationService' });
    
    const commonPaths = [
      { path: '/admin', type: 'layout' as RevalidationType },
      { path: '/admin/dashboard', type: 'page' as RevalidationType }
    ];
    
    // Define entity-specific paths
    const entityPaths: Record<EntityType, { path: string; type: RevalidationType }[]> = {
      category: [
        { path: '/admin/categories', type: 'layout' },
        { path: '/coloring-pages', type: 'layout' }
      ],
      coloringPage: [
        { path: '/admin/coloring-pages', type: 'layout' },
        { path: '/coloring-pages', type: 'layout' },
        { path: '/api/sitemap', type: 'page' } // If you have a sitemap
      ],
      tag: [
        { path: '/admin/tags', type: 'layout' },
        { path: '/api/sitemap', type: 'page' } // If you have a sitemap
      ]
    };
    
    // Combine common and entity-specific paths
    const pathsToRevalidate = [
      ...commonPaths,
      ...entityPaths[entity]
    ];
    
    log.info(
      { entity, pathCount: pathsToRevalidate.length }, 
      `Revalidating paths for ${entity}`
    );
    
    // Revalidate all paths
    for (const { path, type = 'page' } of pathsToRevalidate) {
      log.debug({ path, type }, `Revalidating ${type}: ${path}`);
      revalidatePath(path, type);
    }
    
    log.info('Completed entity path revalidation');
  }
} 