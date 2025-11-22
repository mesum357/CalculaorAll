'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { api, type Calculator } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { CalculatorInfo } from '@/components/calculator-info';
import { AdvancedCalculator } from '@/components/advanced-calculator';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/auth-context';

export default function CalculatorPage() {
  const router = useRouter();
  const params = useParams();
  const { user } = useAuth();
  const [calculator, setCalculator] = useState<Calculator | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [inputValues, setInputValues] = useState<Record<string, string>>({});
  const [results, setResults] = useState<Record<string, any>>({});

  const categorySlug = params?.category as string;
  const calculatorSlug = params?.calculator as string;

  // Fetch calculator data
  useEffect(() => {
    async function fetchCalculator() {
      if (!categorySlug || !calculatorSlug) return;

      try {
        setLoading(true);
        setError(null);

        // First, get the category to find its ID
        const categories = await api.categories.getAll();
        const category = categories.find((c: any) => c.slug === categorySlug);

        if (!category) {
          setError('Category not found');
          setLoading(false);
          return;
        }

        // Fetch calculators for this category
        const calculators = await api.calculators.getAll({
          category_id: category.id,
          is_active: true,
        });

        // Find the calculator by slug
        const calc = calculators.find((c: Calculator) => c.slug === calculatorSlug);

        if (!calc) {
          setError('Calculator not found');
          setLoading(false);
          return;
        }

        setCalculator(calc);

        // Initialize input values
        let inputs: any[] = [];
        try {
          if (calc.inputs) {
            if (Array.isArray(calc.inputs)) {
              inputs = calc.inputs;
            } else if (typeof calc.inputs === 'string') {
              inputs = JSON.parse(calc.inputs);
            }
          }
        } catch (e) {
          console.error('Error parsing inputs:', e);
          inputs = [];
        }

        const initialValues: Record<string, string> = {};
        inputs.forEach((input: any) => {
          const inputName = input.name || input.label || input.key || `input_${input.id}`;
          initialValues[inputName] = input.defaultValue?.toString() || '';
        });
        setInputValues(initialValues);

        // Track view if user is authenticated
        if (user && calc.id) {
          try {
            await api.calculatorInteractions.trackView(calc.id);
          } catch (err) {
            // Silently fail - view tracking is not critical
            console.error('Error tracking view:', err);
          }
        }
      } catch (err) {
        console.error('Error fetching calculator:', err);
        setError('Failed to load calculator');
      } finally {
        setLoading(false);
      }
    }

    fetchCalculator();
  }, [categorySlug, calculatorSlug, user]);

  const calculateResults = (values: Record<string, string>) => {
    if (!calculator || !calculator.results) return;

    try {
      const calculatedResults: Record<string, any> = {};

      // Parse inputs and results if they're strings
      const inputs = Array.isArray(calculator.inputs)
        ? calculator.inputs
        : calculator.inputs
        ? JSON.parse(calculator.inputs)
        : [];
      const results = Array.isArray(calculator.results)
        ? calculator.results
        : calculator.results
        ? JSON.parse(calculator.results)
        : [];

      // Convert input values to numbers
      const inputValues: Record<string, number> = {};
      inputs.forEach((input: any) => {
        const inputName = input.name || input.label || input.key || `input_${input.id}`;
        const value = parseFloat(values[inputName] || '0');
        const key = input.key || inputName;
        inputValues[key] = isNaN(value) ? 0 : value;
      });

      // Evaluate each result formula
      results.forEach((result: any) => {
        if (result.formula) {
          try {
            // Replace input keys with their values in the formula
            let formula = result.formula;
            Object.keys(inputValues).forEach((key) => {
              const regex = new RegExp(`\\b${key}\\b`, 'g');
              formula = formula.replace(regex, inputValues[key].toString());
            });

            // Evaluate the formula
            // eslint-disable-next-line no-eval
            const value = eval(formula);

            // Format the result
            let formattedValue: string | number = value;
            if (result.format === 'currency') {
              formattedValue = new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: 'USD',
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              }).format(value);
            } else if (result.format === 'percent') {
              formattedValue = `${value.toFixed(2)}%`;
            } else if (result.format === 'integer') {
              formattedValue = Math.round(value);
            } else {
              formattedValue = parseFloat(value.toFixed(2));
            }

            const resultKey = result.key || result.name || result.label || `result_${result.id}`;
            calculatedResults[resultKey] = {
              value: formattedValue,
              label: result.label || result.name || resultKey,
              unit: result.unit || '',
              format: result.format || 'number',
            };
          } catch (err) {
            console.error('Error calculating result:', err);
            const resultKey = result.key || result.name || result.label || `result_${result.id}`;
            calculatedResults[resultKey] = {
              value: 'Error',
              label: result.label || result.name || resultKey,
              unit: result.unit || '',
            };
          }
        }
      });

      setResults(calculatedResults);
    } catch (err) {
      console.error('Error calculating results:', err);
    }
  };

  const handleInputChange = (name: string, value: string) => {
    const newValues = {
      ...inputValues,
      [name]: value,
    };
    setInputValues(newValues);
  };

  // Recalculate results when input values change
  useEffect(() => {
    if (calculator && Object.keys(inputValues).length > 0) {
      // Only calculate if at least one input has a value
      const hasValue = Object.values(inputValues).some(v => v && v.trim() !== '');
      if (hasValue) {
        calculateResults(inputValues);
      } else {
        setResults({});
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inputValues, calculator]);


  if (loading) {
    return (
      <div className="container py-12">
        <div className="animate-pulse space-y-4">
          <div className="h-12 bg-muted rounded w-1/3"></div>
          <div className="h-64 bg-muted rounded"></div>
        </div>
      </div>
    );
  }

  if (error || !calculator) {
    return (
      <div className="container py-12">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-4">Calculator Not Found</h1>
          <p className="text-muted-foreground mb-8">{error || 'The calculator you are looking for does not exist.'}</p>
          <Button onClick={() => router.back()}>Go Back</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-12">
      <div className="relative flex items-center justify-between mb-8 bg-card p-4 rounded-lg shadow-sm">
        <Button variant="ghost" size="icon" className="absolute left-4 top-1/2 -translate-y-1/2" onClick={() => router.back()}>
          <ArrowLeft className="h-6 w-6" />
          <span className="sr-only">Back</span>
        </Button>
        <div className="flex-1 text-center">
          <h1 className="text-2xl md:text-3xl font-bold font-headline">{calculator.name}</h1>
        </div>
      </div>

      {/* Calculator Body */}
      <div className="max-w-4xl mx-auto mb-8">
        <Card>
          <CardContent className="p-6 space-y-6">
            {/* Parse inputs - handle both array and JSON string */}
            {(() => {
              let inputs: any[] = [];
              try {
                if (calculator.inputs) {
                  if (Array.isArray(calculator.inputs)) {
                    inputs = calculator.inputs;
                  } else if (typeof calculator.inputs === 'string') {
                    inputs = JSON.parse(calculator.inputs);
                  }
                }
              } catch (e) {
                console.error('Error parsing inputs:', e);
                inputs = [];
              }

              return inputs.length > 0 ? (
                <>
                  {/* Input Fields */}
                  <div className="space-y-4">
                    {inputs.map((input: any, index: number) => {
                      const inputName = input.name || input.label || input.key || `input_${input.id || index}`;
                      return (
                        <div key={index} className="space-y-2">
                          <Label htmlFor={inputName}>
                            {input.label || input.name || `Input ${index + 1}`}
                            {input.unit && <span className="text-muted-foreground ml-1">({input.unit})</span>}
                            {input.required && <span className="text-red-500 ml-1">*</span>}
                          </Label>
                          <Input
                            id={inputName}
                            type={input.type || 'number'}
                            placeholder={input.placeholder || `Enter ${input.label || input.name}`}
                            value={inputValues[inputName] || ''}
                            onChange={(e) => handleInputChange(inputName, e.target.value)}
                          />
                          {input.description && (
                            <p className="text-sm text-muted-foreground">{input.description}</p>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Results */}
                  {Object.keys(results).length > 0 && (
                    <div className="mt-6 space-y-4">
                      <h3 className="text-lg font-semibold">Results</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {Object.entries(results).map(([key, result]: [string, any]) => (
                          <div key={key} className="p-4 bg-muted rounded-lg">
                            <div className="text-sm text-muted-foreground mb-1">{result.label || key}</div>
                            <div className="text-2xl font-bold">
                              {result.format === 'currency'
                                ? result.value
                                : typeof result.value === 'number'
                                ? result.value.toFixed(2)
                                : result.value}
                              {result.unit && result.format !== 'currency' && result.format !== 'percent' && (
                                <span className="text-lg ml-1">{result.unit}</span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              ) : (
                /* Fallback to Advanced Calculator if no inputs defined */
                <div className="flex justify-center">
                  <AdvancedCalculator />
                </div>
              );
            })()}
          </CardContent>
        </Card>
      </div>

      <CalculatorInfo calculator={calculator} />
    </div>
  );
}

