import { getCategories } from '@/lib/categories';
import { api } from '@/lib/api';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowRight } from 'lucide-react';

export default async function CategoryPage({ params }: { params: { category: string } }) {
    const allCategories = await getCategories();
    const category = allCategories.find(c => c.slug === params.category);

    if (!category) {
        return (
            <div className="container py-12">
                <h1 className="text-3xl font-bold">Category not found</h1>
            </div>
        );
    }

    // Fetch calculators for this category
    const calculators = await api.calculators.getAll({ 
        category_id: category.id, 
        is_active: true 
    });

    // Fetch subcategories for this category
    const subcategories = await api.subcategories.getAll(category.id);

    // Group calculators by subcategory
    const calculatorsBySubcategory: Record<number, typeof calculators> = {};
    calculators.forEach(calc => {
        if (!calculatorsBySubcategory[calc.subcategory_id]) {
            calculatorsBySubcategory[calc.subcategory_id] = [];
        }
        calculatorsBySubcategory[calc.subcategory_id].push(calc);
    });

    // Sort subcategories by name
    const sortedSubcategories = [...subcategories].sort((a, b) => 
        a.name.localeCompare(b.name)
    );

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
                            if (subcategoryCalculators.length === 0) return null;
                            
                            return (
                                <div key={subcategory.id}>
                                    <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                                        <ArrowRight className="h-6 w-6 text-primary" />
                                        {subcategory.name}
                                    </h2>
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
                        <p className="text-muted-foreground">
                            There are no calculators available in the {category.name} category yet.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}

export async function generateStaticParams() {
    const categories = await getCategories();
    return categories.map(category => ({
        category: category.slug,
    }));
}
