'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { api } from '@/lib/api';
import { getCategories } from '@/lib/categories';

export function CategoryPageDebug() {
  const pathname = usePathname();
  const [debugInfo, setDebugInfo] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDebugInfo() {
      try {
        const categorySlug = pathname?.split('/').pop() || '';
        
        console.log('[CategoryPageDebug] Pathname:', pathname);
        console.log('[CategoryPageDebug] Category slug from pathname:', categorySlug);
        
        const allCategories = await getCategories();
        console.log('[CategoryPageDebug] Categories fetched:', {
          count: allCategories.length,
          slugs: allCategories.map(c => c.slug),
          categories: allCategories.map(c => ({ id: c.id, name: c.name, slug: c.slug }))
        });
        
        const category = allCategories.find(c => c.slug === categorySlug);
        
        let calculators: any[] = [];
        let subcategories: any[] = [];
        
        if (category) {
          try {
            calculators = await api.calculators.getAll({ 
              category_id: category.id, 
              is_active: true 
            });
          } catch (error) {
            console.error('[CategoryPageDebug] Error fetching calculators:', error);
          }
          
          try {
            subcategories = await api.subcategories.getAll(category.id);
          } catch (error) {
            console.error('[CategoryPageDebug] Error fetching subcategories:', error);
          }
        }
        
        setDebugInfo({
          pathname,
          categorySlug,
          category,
          allCategoriesCount: allCategories.length,
          allCategories: allCategories.map(c => ({ id: c.id, name: c.name, slug: c.slug })),
          calculatorsCount: calculators.length,
          calculators: calculators.map(c => ({ id: c.id, name: c.name, subcategory_id: c.subcategory_id })),
          subcategoriesCount: subcategories.length,
          subcategories: subcategories.map(s => ({ id: s.id, name: s.name, category_id: s.category_id })),
          categoryFound: !!category
        });
      } catch (error) {
        console.error('[CategoryPageDebug] Error:', error);
        setDebugInfo({
          error: error instanceof Error ? error.message : 'Unknown error',
          pathname
        });
      } finally {
        setLoading(false);
      }
    }
    
    if (pathname?.includes('/calculators/')) {
      fetchDebugInfo();
    } else {
      setLoading(false);
    }
  }, [pathname]);

  // Only show on category pages and in development
  if (process.env.NODE_ENV !== 'development' || !pathname?.includes('/calculators/')) {
    return null;
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-4 bg-yellow-100 dark:bg-yellow-900 border border-yellow-300 dark:border-yellow-700 rounded mb-4">
        <p className="text-sm font-semibold">Loading debug info...</p>
      </div>
    );
  }

  if (!debugInfo) {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-4 bg-blue-50 dark:bg-blue-900 border border-blue-300 dark:border-blue-700 rounded mb-4">
      <h3 className="text-lg font-bold mb-2">🐛 Category Page Debug Info</h3>
      <div className="space-y-2 text-sm">
        <div>
          <strong>Pathname:</strong> {debugInfo.pathname}
        </div>
        <div>
          <strong>Category Slug:</strong> {debugInfo.categorySlug}
        </div>
        <div>
          <strong>Category Found:</strong> {debugInfo.categoryFound ? '✅ Yes' : '❌ No'}
        </div>
        {debugInfo.category ? (
          <>
            <div>
              <strong>Category:</strong> {debugInfo.category.name} (ID: {debugInfo.category.id})
            </div>
            <div>
              <strong>Calculators:</strong> {debugInfo.calculatorsCount}
            </div>
            <div>
              <strong>Subcategories:</strong> {debugInfo.subcategoriesCount}
            </div>
          </>
        ) : (
          <div>
            <strong>Available Categories:</strong>
            <ul className="list-disc list-inside ml-4 mt-1">
              {debugInfo.allCategories?.map((cat: any) => (
                <li key={cat.id}>{cat.name} ({cat.slug})</li>
              ))}
            </ul>
          </div>
        )}
        {debugInfo.error && (
          <div className="text-red-600 dark:text-red-400">
            <strong>Error:</strong> {debugInfo.error}
          </div>
        )}
        <details className="mt-2">
          <summary className="cursor-pointer font-semibold">Full Debug Data</summary>
          <pre className="mt-2 text-xs bg-white dark:bg-gray-800 p-2 rounded overflow-auto max-h-64">
            {JSON.stringify(debugInfo, null, 2)}
          </pre>
        </details>
      </div>
    </div>
  );
}

