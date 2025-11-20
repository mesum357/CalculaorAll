import { getCategories } from '@/lib/categories';
import { api } from '@/lib/api';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowRight } from 'lucide-react';

export default async function CategoryPage({ params }: { params: { category: string } }) {
    try {
        const allCategories = await getCategories();
        const category = allCategories.find(c => c.slug === params.category);

        if (!category) {
            return (
                <div className="container py-12">
                    <h1 className="text-3xl font-bold">Category not found</h1>
                </div>
            );
        }

        console.log('[CategoryPage] Fetching data for category:', {
            categoryId: category.id,
            categoryName: category.name,
            categorySlug: category.slug
        });

        // Fetch calculators and subcategories in parallel
        let calculators: any[] = [];
        let subcategories: any[] = [];

        try {
            calculators = await api.calculators.getAll({ 
                category_id: category.id, 
                is_active: true 
            });
            console.log('[CategoryPage] Calculators fetched:', {
                count: calculators.length,
                calculators: calculators.map(c => ({ id: c.id, name: c.name, subcategory_id: c.subcategory_id }))
            });
        } catch (error) {
            console.error('[CategoryPage] Error fetching calculators:', error);
            // Continue with empty array
        }

        try {
            subcategories = await api.subcategories.getAll(category.id);
            console.log('[CategoryPage] Subcategories fetched:', {
                count: subcategories.length,
                subcategories: subcategories.map(s => ({ id: s.id, name: s.name, category_id: s.category_id }))
            });
        } catch (error) {
            console.error('[CategoryPage] Error fetching subcategories:', error);
            // Continue with empty array
        }

        // Group calculators by subcategory
        const calculatorsBySubcategory: Record<number, any[]> = {};
        calculators.forEach(calc => {
            if (!calculatorsBySubcategory[calc.subcategory_id]) {
                calculatorsBySubcategory[calc.subcategory_id] = [];
            }
            calculatorsBySubcategory[calc.subcategory_id].push(calc);
        });

        // Sort subcategories by name
        const sortedSubcategories = Array.isArray(subcategories) 
            ? [...subcategories].sort((a, b) => a.name.localeCompare(b.name))
            : [];

        console.log('[CategoryPage] Final data:', {
            subcategoriesCount: sortedSubcategories.length,
            calculatorsCount: calculators.length,
            calculatorsBySubcategory: Object.keys(calculatorsBySubcategory).map(key => ({
                subcategoryId: parseInt(key),
                calculatorCount: calculatorsBySubcategory[parseInt(key)].length
            }))
        });

        return (
            <div className="container mx-auto px-4 py-8">
                <h1 className="text-4xl font-bold mb-2 text-primary">{category.name} Calculators</h1>
                <p className="text-muted-foreground mb-8">
                    Browse through our collection of {calculators.length} free {category.name.toLowerCase()} calculators.
                </p>
                
                <div className="bg-card p-6 rounded-lg shadow-sm">
                    {sortedSubcategories.length > 0 ? (
                        <div className="space-y-12 mt-8">
                            {sortedSubcategories.map(subcategory => {
                                const subcategoryCalculators = calculatorsBySubcategory[subcategory.id] || [];
                                
                                // Show subcategory even if it has no calculators (but with a message)
                                return (
                                    <div key={subcategory.id}>
                                        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                                            <ArrowRight className="h-6 w-6 text-primary" />
                                            {subcategory.name}
                                            <span className="text-sm font-normal text-muted-foreground">
                                                ({subcategoryCalculators.length} {subcategoryCalculators.length === 1 ? 'calculator' : 'calculators'})
                                            </span>
                                        </h2>
                                        {subcategoryCalculators.length > 0 ? (
                                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                                                {subcategoryCalculators.map(calc => (
                                                    <Link 
                                                        href={`/calculators/${category.slug}/${calc.slug}`} 
                                                        key={calc.id} 
                                                        className="group"
                                                    >
                                                        <Card className="h-full transition-all group-hover:shadow-md group-hover:-translate-y-0.5">
                                                            <CardContent className="p-4 flex items-center justify-between">
                                                                <h3 className="font-semibold text-base">{calc.name}</h3>
                                                                <ArrowRight className="h-4 w-4 text-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                                                            </CardContent>
                                                        </Card>
                                                    </Link>
                                                ))}
                                            </div>
                                        ) : (
                                            <p className="text-muted-foreground text-sm">
                                                No calculators available in this subcategory yet.
                                            </p>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    ) : calculators.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                            {calculators.map(calc => (
                                <Link 
                                    href={`/calculators/${category.slug}/${calc.slug}`} 
                                    key={calc.id} 
                                    className="group"
                                >
                                    <Card className="h-full transition-all group-hover:shadow-md group-hover:-translate-y-0.5">
                                        <CardContent className="p-4 flex items-center justify-between">
                                            <h3 className="font-semibold text-base">{calc.name}</h3>
                                            <ArrowRight className="h-4 w-4 text-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                                        </CardContent>
                                    </Card>
                                </Link>
                            ))}
                        </div>
                    ) : (
                        <div>
                            <h2 className="text-2xl font-bold mb-4">No calculators found</h2>
                            <p className="text-muted-foreground mb-4">
                                There are no calculators available in the {category.name} category yet.
                            </p>
                            {sortedSubcategories.length > 0 && (
                                <div className="mt-6">
                                    <h3 className="text-lg font-semibold mb-2">Subcategories in this category:</h3>
                                    <ul className="list-disc list-inside space-y-1">
                                        {sortedSubcategories.map(sub => (
                                            <li key={sub.id} className="text-muted-foreground">{sub.name}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        );
    } catch (error) {
        console.error('[CategoryPage] Error:', error);
        return (
            <div className="container py-12">
                <h1 className="text-3xl font-bold mb-4">Error loading category</h1>
                <p className="text-muted-foreground">
                    {error instanceof Error ? error.message : 'An unexpected error occurred'}
                </p>
            </div>
        );
    }
}

export async function generateStaticParams() {
    const categories = await getCategories();
    return categories.map(category => ({
        category: category.slug,
    }));
}
