import {
  Sigma,
  Landmark,
  Atom,
  FlaskConical,
  HeartPulse,
  ArrowRightLeft,
  BarChart3,
  Construction,
  Scale,
  Leaf,
  UtensilsCrossed,
  Trophy,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { api } from './api';

export type Category = {
    id: number;
    slug: string;
    name: string;
    icon: LucideIcon;
    href: string;
    count: number;
};

// Icon mapping for categories
const categoryIconMap: Record<string, LucideIcon> = {
  'math': Sigma,
  'finance': Landmark,
  'physics': Atom,
  'chemistry': FlaskConical,
  'health': HeartPulse,
  'health-care': HeartPulse,
  'conversion': ArrowRightLeft,
  'construction': Construction,
  'everyday': Scale,
  'statistics': BarChart3,
  'biology': Leaf,
  'ecology': Leaf,
  'food': UtensilsCrossed,
  'sports': Trophy,
};

// Categories to show on the main browse section
export const MAIN_CATEGORY_SLUGS = [
  'biology',
  'chemistry',
  'construction',
  'conversion',
  'ecology',
  'everyday',
  'finance',
  'food',
  'health',
  'math',
  'physics',
  'sports',
  'statistics',
];

// Fetch categories from API
export async function getCategories(): Promise<Category[]> {
  console.log('[Categories] getCategories called');
  
  try {
    console.log('[Categories] Fetching categories from API...');
    const categories = await api.categories.getAll();
    
    console.log('[Categories] Categories fetched:', {
      count: Array.isArray(categories) ? categories.length : 'not an array',
      categories: Array.isArray(categories) ? categories.map(c => ({ id: c.id, name: c.name, slug: c.slug })) : categories
    });
    
    console.log('[Categories] Fetching calculators from API...');
    const calculators = await api.calculators.getAll({ is_active: true });
    
    console.log('[Categories] Calculators fetched:', {
      count: Array.isArray(calculators) ? calculators.length : 'not an array',
      sample: Array.isArray(calculators) && calculators.length > 0 ? calculators.slice(0, 3).map(c => ({ id: c.id, name: c.name, category_id: c.category_id })) : 'no data'
    });
    
    // Count calculators per category
    const calculatorCounts: Record<number, number> = {};
    if (Array.isArray(calculators)) {
      calculators.forEach(calc => {
        calculatorCounts[calc.category_id] = (calculatorCounts[calc.category_id] || 0) + 1;
      });
    }
    
    console.log('[Categories] Calculator counts:', calculatorCounts);
    
    const mappedCategories = Array.isArray(categories) ? categories.map((cat: any) => ({
      id: cat.id,
      slug: cat.slug,
      name: cat.name,
      icon: categoryIconMap[cat.slug] || Leaf,
      href: `/calculators/${cat.slug}`,
      count: calculatorCounts[cat.id] || 0,
    })) : [];
    
    console.log('[Categories] Mapped categories:', {
      count: mappedCategories.length,
      categories: mappedCategories.map(c => ({ name: c.name, slug: c.slug, count: c.count }))
    });
    
    return mappedCategories;
  } catch (error) {
    console.error('[Categories] Error fetching categories:', {
      error: error instanceof Error ? error.message : error,
      stack: error instanceof Error ? error.stack : undefined,
      errorType: error?.constructor?.name,
      fullError: error
    });
    return [];
  }
}

// Get main categories (for browse section)
export async function getMainCategories(): Promise<Category[]> {
  console.log('[Categories] getMainCategories called');
  
  const allCategories = await getCategories();
  
  console.log('[Categories] All categories before filtering:', {
    count: allCategories.length,
    slugs: allCategories.map(c => c.slug)
  });
  
  const mainCategories = allCategories
    .filter(cat => MAIN_CATEGORY_SLUGS.includes(cat.slug))
    .filter(cat => cat.count > 0); // Only show categories with calculators
  
  console.log('[Categories] Main categories after filtering:', {
    count: mainCategories.length,
    slugs: mainCategories.map(c => c.slug),
    MAIN_CATEGORY_SLUGS
  });
  
  return mainCategories;
}

// Get other categories (for other categories page)
export async function getOtherCategories(): Promise<Category[]> {
  console.log('[Categories] getOtherCategories called');
  
  const allCategories = await getCategories();
  
  console.log('[Categories] All categories for other categories page:', {
    total: allCategories.length,
    allSlugs: allCategories.map(c => c.slug),
    mainCategorySlugs: MAIN_CATEGORY_SLUGS
  });
  
  const otherCategories = allCategories
    .filter(cat => !MAIN_CATEGORY_SLUGS.includes(cat.slug))
    .filter(cat => cat.count > 0); // Only show categories with calculators
  
  console.log('[Categories] Other categories filtered:', {
    count: otherCategories.length,
    slugs: otherCategories.map(c => c.slug),
    names: otherCategories.map(c => c.name)
  });
  
  return otherCategories;
}

// Get icon for a category slug
export function getCategoryIcon(slug: string): LucideIcon {
  return categoryIconMap[slug] || Leaf;
}
