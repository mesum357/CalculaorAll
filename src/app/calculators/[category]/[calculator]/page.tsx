'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { api, type Calculator } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Heart } from 'lucide-react';
import { CalculatorInfo } from '@/components/calculator-info';
import { AdvancedCalculator } from '@/components/advanced-calculator';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/auth-context';
import { useToast } from '@/hooks/use-toast';

export default function CalculatorPage() {
  const router = useRouter();
  const params = useParams();
  const { user } = useAuth();
  const { toast } = useToast();
  const [calculator, setCalculator] = useState<Calculator | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [inputValues, setInputValues] = useState<Record<string, string>>({});
  const [results, setResults] = useState<Record<string, any>>({});
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [loadingLikes, setLoadingLikes] = useState(true);

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

        // Fetch likes
        if (calc.id) {
          try {
            const likesData = await api.calculatorInteractions.getLikes(calc.id);
            setIsLiked(likesData.isLiked);
            setLikeCount(likesData.likeCount);
          } catch (err) {
            console.error('Error fetching likes:', err);
          } finally {
            setLoadingLikes(false);
          }
        } else {
          setLoadingLikes(false);
        }
      } catch (err) {
        console.error('Error fetching calculator:', err);
        setError('Failed to load calculator');
        setLoadingLikes(false);
      } finally {
        setLoading(false);
      }
    }

    fetchCalculator();
  }, [categorySlug, calculatorSlug, user]);

  const handleLike = async () => {
    if (!calculator) return;

    // Check authentication
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to like calculators.",
        variant: "destructive",
      });
      router.push('/auth');
      return;
    }

    try {
      const data = await api.calculatorInteractions.toggleLike(calculator.id);
      setIsLiked(data.liked);
      
      // Refresh like count
      const likesData = await api.calculatorInteractions.getLikes(calculator.id);
      setLikeCount(likesData.likeCount);

      toast({
        title: data.liked ? "Added to favorites!" : "Removed from favorites",
        description: data.liked ? "You can find it in your profile." : "",
      });
    } catch (error: any) {
      console.error('Error toggling like:', error);
      if (error.message && error.message.includes('Authentication required')) {
        toast({
          title: "Authentication Required",
          description: "Please log in to like calculators.",
          variant: "destructive",
        });
        router.push('/auth');
      } else {
        toast({
          title: "Error",
          description: "Failed to update like. Please try again.",
          variant: "destructive",
        });
      }
    }
  };

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
      // Add Math.js function mappings (sqrt, log, sin, etc.) to Math.* equivalents
      const scope: Record<string, any> = {
        ...inputValues,
        Math: Math,
        Number: Number,
        Array: Array,
        String: String,
        Object: Object,
        JSON: JSON,
        // Math.js function mappings
        sqrt: (x: number) => Math.sqrt(x),
        abs: (x: number) => Math.abs(x),
        exp: (x: number) => Math.exp(x),
        log: (x: number) => Math.log(x),
        log10: (x: number) => Math.log10(x),
        log2: (x: number) => Math.log2(x),
        sin: (x: number) => Math.sin(x),
        cos: (x: number) => Math.cos(x),
        tan: (x: number) => Math.tan(x),
        asin: (x: number) => Math.asin(x),
        acos: (x: number) => Math.acos(x),
        atan: (x: number) => Math.atan(x),
        atan2: (y: number, x: number) => Math.atan2(y, x),
        sinh: (x: number) => Math.sinh(x),
        cosh: (x: number) => Math.cosh(x),
        tanh: (x: number) => Math.tanh(x),
        round: (x: number) => Math.round(x),
        floor: (x: number) => Math.floor(x),
        ceil: (x: number) => Math.ceil(x),
        min: (...args: number[]) => Math.min(...args),
        max: (...args: number[]) => Math.max(...args),
        pow: (x: number, y: number) => Math.pow(x, y),
        mod: (x: number, y: number) => x % y,
        gcd: (a: number, b: number) => {
          let x = Math.abs(a);
          let y = Math.abs(b);
          while (y !== 0) {
            const temp = y;
            y = x % y;
            x = temp;
          }
          return x;
        },
        lcm: (a: number, b: number) => {
          const gcdFunc = (x: number, y: number) => {
            let num1 = Math.abs(x);
            let num2 = Math.abs(y);
            while (num2 !== 0) {
              const temp = num2;
              num2 = num1 % num2;
              num1 = temp;
            }
            return num1;
          };
          return Math.abs(a * b) / (gcdFunc(a, b) || 1);
        },
        // Punnett Square functions
        compute_punnett: (parent1: string, parent2: string) => {
          // Monohybrid cross (e.g., Aa x Aa)
          const normalizeGenotype = (genotype: string) => {
            return String(genotype || '').trim().replace(/\s+/g, '');
          };
          
          const p1 = normalizeGenotype(parent1);
          const p2 = normalizeGenotype(parent2);
          
          if (!p1 || !p2) return 'Invalid genotype';
          
          // Extract alleles (assume single letter alleles like A, a)
          const getAlleles = (genotype: string) => {
            const alleles: string[] = [];
            for (let i = 0; i < genotype.length; i++) {
              const char = genotype[i];
              if (/[A-Za-z]/.test(char)) {
                alleles.push(char);
              }
            }
            return alleles.length === 2 ? alleles : [genotype[0] || 'A', genotype[1] || 'a'];
          };
          
          const p1Alleles = getAlleles(p1);
          const p2Alleles = getAlleles(p2);
          
          // Generate gametes
          const p1Gametes = [...new Set(p1Alleles)];
          const p2Gametes = [...new Set(p2Alleles)];
          
          // Calculate offspring genotypes and probabilities
          const outcomes: Record<string, number> = {};
          let total = 0;
          
          for (const g1 of p1Gametes) {
            for (const g2 of p2Gametes) {
              // Sort alleles to normalize genotype (Aa = aA)
              const genotype = [g1, g2].sort().join('');
              outcomes[genotype] = (outcomes[genotype] || 0) + 1;
              total++;
            }
          }
          
          // Format results
          const results: string[] = [];
          for (const [genotype, count] of Object.entries(outcomes)) {
            const probability = (count / total) * 100;
            results.push(`${genotype}: ${probability.toFixed(1)}%`);
          }
          
          return results.join(', ');
        },
        compute_dihybrid_punnett: (parent1_genotype: string, parent2_genotype: string) => {
          // Dihybrid cross (e.g., AaBb x AaBb)
          const normalizeGenotype = (genotype: string) => {
            return String(genotype || '').trim().replace(/\s+/g, '');
          };
          
          const p1 = normalizeGenotype(parent1_genotype);
          const p2 = normalizeGenotype(parent2_genotype);
          
          if (!p1 || !p2) return 'Invalid genotype';
          
          // Parse dihybrid genotype (e.g., AaBb -> [A,a] and [B,b])
          const parseDihybrid = (genotype: string) => {
            const upper = genotype.match(/[A-Z]/g) || [];
            const lower = genotype.match(/[a-z]/g) || [];
            const pairs: string[][] = [];
            
            // Try to pair uppercase with lowercase
            for (let i = 0; i < Math.max(upper.length, lower.length); i++) {
              const u = upper[i] || '';
              const l = lower[i] || '';
              if (u && l) {
                pairs.push([u, l]);
              }
            }
            
            // If we can't pair, try to extract pairs of 2
            if (pairs.length === 0 && genotype.length >= 4) {
              for (let i = 0; i < genotype.length; i += 2) {
                const pair = genotype.slice(i, i + 2);
                if (pair.length === 2) {
                  pairs.push([pair[0], pair[1]]);
                }
              }
            }
            
            return pairs.length >= 2 ? pairs : [[genotype[0] || 'A', genotype[1] || 'a'], [genotype[2] || 'B', genotype[3] || 'b']];
          };
          
          const p1Pairs = parseDihybrid(p1);
          const p2Pairs = parseDihybrid(p2);
          
          if (p1Pairs.length < 2 || p2Pairs.length < 2) return 'Invalid dihybrid genotype';
          
          // Generate gametes (4 possible combinations for each parent)
          const getGametes = (pairs: string[][]) => {
            const gametes: string[] = [];
            const [pair1, pair2] = pairs;
            for (const a1 of pair1) {
              for (const a2 of pair2) {
                gametes.push(a1 + a2);
              }
            }
            return gametes;
          };
          
          const p1Gametes = getGametes(p1Pairs);
          const p2Gametes = getGametes(p2Pairs);
          
          // Calculate offspring genotypes
          const outcomes: Record<string, number> = {};
          let total = 0;
          
          for (const g1 of p1Gametes) {
            for (const g2 of p2Gametes) {
              // Combine gametes to form genotype
              const genotype = g1 + g2;
              outcomes[genotype] = (outcomes[genotype] || 0) + 1;
              total++;
            }
          }
          
          // Format results (show unique genotypes with probabilities)
          const results: string[] = [];
          for (const [genotype, count] of Object.entries(outcomes)) {
            const probability = (count / total) * 100;
            results.push(`${genotype}: ${probability.toFixed(1)}%`);
          }
          
          return results.join(', ');
        },
        compute_trihybrid_punnett: (parent1_genotype: string, parent2_genotype: string) => {
          // Trihybrid cross (e.g., AaBbCc x AaBbCc)
          const normalizeGenotype = (genotype: string) => {
            return String(genotype || '').trim().replace(/\s+/g, '');
          };
          
          const p1 = normalizeGenotype(parent1_genotype);
          const p2 = normalizeGenotype(parent2_genotype);
          
          if (!p1 || !p2) return 'Invalid genotype';
          
          // Parse trihybrid genotype (e.g., AaBbCc -> [A,a], [B,b], [C,c])
          const parseTrihybrid = (genotype: string) => {
            const pairs: string[][] = [];
            
            // Try to extract pairs of 2
            for (let i = 0; i < genotype.length; i += 2) {
              const pair = genotype.slice(i, i + 2);
              if (pair.length === 2) {
                pairs.push([pair[0], pair[1]]);
              }
            }
            
            // If we don't have 3 pairs, try to infer
            if (pairs.length < 3 && genotype.length >= 6) {
              pairs.length = 0;
              for (let i = 0; i < 6; i += 2) {
                const pair = genotype.slice(i, i + 2);
                if (pair.length === 2) {
                  pairs.push([pair[0], pair[1]]);
                }
              }
            }
            
            return pairs.length >= 3 ? pairs : [
              [genotype[0] || 'A', genotype[1] || 'a'],
              [genotype[2] || 'B', genotype[3] || 'b'],
              [genotype[4] || 'C', genotype[5] || 'c']
            ];
          };
          
          const p1Pairs = parseTrihybrid(p1);
          const p2Pairs = parseTrihybrid(p2);
          
          if (p1Pairs.length < 3 || p2Pairs.length < 3) return 'Invalid trihybrid genotype';
          
          // Generate gametes (8 possible combinations for each parent)
          const getGametes = (pairs: string[][]) => {
            const gametes: string[] = [];
            const [pair1, pair2, pair3] = pairs;
            for (const a1 of pair1) {
              for (const a2 of pair2) {
                for (const a3 of pair3) {
                  gametes.push(a1 + a2 + a3);
                }
              }
            }
            return gametes;
          };
          
          const p1Gametes = getGametes(p1Pairs);
          const p2Gametes = getGametes(p2Pairs);
          
          // Calculate offspring genotypes
          const outcomes: Record<string, number> = {};
          let total = 0;
          
          for (const g1 of p1Gametes) {
            for (const g2 of p2Gametes) {
              // Combine gametes to form genotype
              const genotype = g1 + g2;
              outcomes[genotype] = (outcomes[genotype] || 0) + 1;
              total++;
            }
          }
          
          // Format results (show unique genotypes with probabilities)
          const results: string[] = [];
          for (const [genotype, count] of Object.entries(outcomes)) {
            const probability = (count / total) * 100;
            results.push(`${genotype}: ${probability.toFixed(1)}%`);
          }
          
          return results.join(', ');
        },
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
          // Verify that Math.js functions are in scope
          if (!currentScope.sqrt && code.includes('sqrt')) {
            console.warn('[Calculator] sqrt function not found in scope. Available functions:', Object.keys(currentScope).filter(k => typeof currentScope[k] === 'function'));
          }
          
          const func = new Function(...scopeKeys, functionBody);
          return func(...scopeValues);
        } catch (error: any) {
          // Provide more detailed error message
          const availableFunctions = Object.keys(currentScope).filter(k => typeof currentScope[k] === 'function').join(', ');
          throw new Error(`JavaScript evaluation error: ${error.message}. Available functions: ${availableFunctions}`);
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
        <div className="absolute right-4 top-1/2 -translate-y-1/2">
          <Button 
            variant={isLiked ? "default" : "outline"} 
            onClick={handleLike}
            disabled={loadingLikes}
            size="sm"
          >
            <Heart className={`w-4 h-4 mr-2 ${isLiked ? 'fill-current' : ''}`} />
            {loadingLikes ? "..." : isLiked ? "Liked" : "Like"}
            {likeCount > 0 && ` (${likeCount})`}
          </Button>
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

