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

      // Create scope with input values and JavaScript objects/functions
      const scope: Record<string, any> = {
        ...inputValues,
        Math: Math,
        Number: Number,
        Array: Array,
        String: String,
        Object: Object,
        JSON: JSON,
      };
      const computed: Record<string, any> = {};

      // Helper function to evaluate JavaScript code safely
      const evaluateJavaScript = (code: string, currentScope: Record<string, any>): any => {
        const scopeKeys = Object.keys(currentScope);
        const scopeValues = scopeKeys.map(key => currentScope[key]);
        
        // Check if code contains statements (if, for, while, etc.)
        const hasStatements = /^(if|for|while|switch|function|const|let|var|return)\s/.test(code.trim()) || 
                              /;\s*(if|for|while|switch|function|const|let|var|return)/.test(code) ||
                              (code.includes('{') && code.includes('}'));
        
        const functionBody = hasStatements ? code : `return ${code}`;
        
        try {
          const func = new Function(...scopeKeys, functionBody);
          return func(...scopeValues);
        } catch (error: any) {
          throw new Error(`JavaScript evaluation error: ${error.message}`);
        }
      };

      // Evaluate each result formula
      results.forEach((result: any) => {
        if (result.formula) {
          try {
            // Check if formula contains JavaScript syntax (loops, if-else, etc.)
            const hasJavaScriptSyntax = /^(if|for|while|switch|function|const|let|var|return)\s/.test(result.formula.trim()) ||
                                       /;\s*(if|for|while|switch|function|const|let|var|return)/.test(result.formula) ||
                                       (result.formula.includes('{') && result.formula.includes('}')) ||
                                       result.formula.includes('=>');

            let value: any;
            if (hasJavaScriptSyntax) {
              // Use full JavaScript evaluation for complex code
              value = evaluateJavaScript(result.formula, scope);
            } else {
              // For simple expressions, try eval with scope variables
              try {
                // Check if formula contains comma-separated expressions (multiple values)
                const hasComma = result.formula.includes(',');
                const likelyMultipleExpressions = hasComma && (
                  /\)\s*,\s*\(/.test(result.formula) || // Pattern: ), (
                  result.formula.split(',').length > 2 || // Multiple commas
                  /^[^(]*\([^)]+\)\s*,\s*\(/.test(result.formula) // Pattern like: sqrt(x), (y)
                );

                if (likelyMultipleExpressions) {
                  // Wrap in array brackets to evaluate as array literal
                  try {
                    value = evaluateJavaScript(`[${result.formula}]`, scope);
                    if (!Array.isArray(value)) {
                      // Fallback: split and evaluate each part
                      const parts = result.formula.split(',').map(p => p.trim());
                      if (parts.length > 1) {
                        value = parts.map(part => evaluateJavaScript(part, scope));
                      }
                    }
                  } catch {
                    value = evaluateJavaScript(result.formula, scope);
                  }
                } else {
                  value = evaluateJavaScript(result.formula, scope);
                }
              } catch (error: any) {
                throw new Error(`Evaluation failed: ${error.message}`);
              }
            }

            // Store computed result and add to scope for subsequent formulas
            computed[result.key] = value;
            scope[result.key] = value;

            // Format the result
            // Handle arrays (multiple values from comma-separated expressions)
            let formattedValue: string | number | string[];
            const resultValue = computed[result.key];
            
            // Helper to safely convert and format a value
            const safeFormatValue = (val: any, fmt: string): string | number => {
              if (typeof val === 'string') return val;
              if (val === null || val === undefined) return 'N/A';
              
              const numVal = typeof val === 'number' ? val : Number(val);
              if (isNaN(numVal)) {
                if (typeof val === 'boolean') return val.toString();
                return String(val);
              }
              
              if (fmt === 'currency') {
                return new Intl.NumberFormat('en-US', {
                  style: 'currency',
                  currency: 'USD',
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                }).format(numVal);
              } else if (fmt === 'percent') {
                return `${numVal.toFixed(2)}%`;
              } else if (fmt === 'integer') {
                return Math.round(numVal);
              } else {
                return parseFloat(numVal.toFixed(2));
              }
            };
            
            if (Array.isArray(resultValue)) {
              formattedValue = resultValue.map(v => safeFormatValue(v, result.format)).join(', ');
            } else if (typeof resultValue === 'string') {
              // If value is already a string (e.g., from toString(2) for binary), return it as-is
              formattedValue = resultValue;
            } else {
              formattedValue = safeFormatValue(resultValue, result.format);
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

