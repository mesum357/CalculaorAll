'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { api, type Calculator as CalculatorType } from '@/lib/api';
import { getCategoryIcon } from '@/lib/categories';
import { LucideIcon } from 'lucide-react';

export function PopularCalculators() {
  const [calculators, setCalculators] = useState<CalculatorType[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPopular = async () => {
      try {
        setLoading(true);
        const data = await api.calculators.getAll({ popular: true, is_active: true });
        setCalculators(data.slice(0, 12)); // Limit to 12 calculators
      } catch (error) {
        console.error('Error fetching popular calculators:', error);
        setCalculators([]);
      } finally {
        setLoading(false);
      }
    };

    fetchPopular();
  }, []);

  if (loading) {
    return (
      <>
        <h2 className="text-3xl font-bold text-center font-headline mb-8">
          Popular Calculators
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <Card key={i} className="flex flex-col animate-pulse">
              <CardHeader className="flex-row items-center gap-4">
                <div className="w-10 h-10 bg-muted rounded" />
                <div className="flex-1">
                  <div className="h-5 bg-muted rounded mb-2" />
                  <div className="h-4 bg-muted rounded w-3/4" />
                </div>
              </CardHeader>
            </Card>
          ))}
        </div>
      </>
    );
  }

  if (calculators.length === 0) {
    return null; // Don't show section if no calculators
  }

  return (
    <>
      <h2 className="text-3xl font-bold text-center font-headline mb-8">
        Popular Calculators
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {calculators.map((calc) => {
          const IconComponent = getCategoryIcon(calc.category_slug) as LucideIcon;
          
          return (
            <Link 
              key={calc.id} 
              href={`/calculators/${calc.category_slug}/${calc.slug}`}
              className="block"
            >
              <Card className="flex flex-col h-full hover:shadow-lg transition-shadow cursor-pointer">
                <CardHeader className="flex-row items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    {IconComponent && <IconComponent className="w-6 h-6 text-primary" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-lg mb-1 line-clamp-2">
                      {calc.name}
                    </CardTitle>
                    <CardDescription className="line-clamp-2 text-sm">
                      {calc.description || 'No description available.'}
                    </CardDescription>
                  </div>
                </CardHeader>
              </Card>
            </Link>
          );
        })}
      </div>
    </>
  );
}

