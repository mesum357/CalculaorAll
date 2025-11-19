"use client";

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Delete, Sigma, LineChart, Landmark, BarChart3, FunctionSquare, Triangle, ArrowRightLeft, DollarSign, Binary, Pi, SquareRadical, Calculator } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ScientificCalculator } from '@/components/calculators/scientific-calculator';
import { GraphingCalculator } from '@/components/calculators/graphing-calculator';
import { FinancialCalculator } from '@/components/calculators/financial-calculator';
import { StatisticsCalculator } from '@/components/calculators/statistics-calculator';
import { AlgebraCalculator } from '@/components/calculators/algebra-calculator';
import { GeometryCalculator } from '@/components/calculators/geometry-calculator';
import { UnitConverter } from '@/components/calculators/unit-converter';
import { CurrencyConverter } from '@/components/calculators/currency-converter';
import { ProgrammingCalculator } from '@/components/calculators/programming-calculator';
import { api, type Calculator as CalculatorType } from '@/lib/api';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const CalculatorButton = ({
  value,
  children,
  onClick,
  className,
  gridSpan,
}: {
  value: string;
  children: React.ReactNode;
  onClick: (value: string) => void;
  className?: string;
  gridSpan?: number;
}) => (
  <button
    onClick={() => onClick(value)}
    className={cn(
      'flex items-center justify-center rounded-lg text-xl font-medium focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background transition-all duration-150 active:brightness-90 h-12',
      'bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-foreground',
       gridSpan ? `col-span-${gridSpan}` : 'col-span-1',
      className
    )}
  >
    {children}
  </button>
);

// Icon mapping for categories
const getCategoryIcon = (categoryName: string): LucideIcon => {
  const name = categoryName.toLowerCase();
  if (name.includes('math') || name.includes('scientific')) return Sigma;
  if (name.includes('finance') || name.includes('financial')) return Landmark;
  if (name.includes('statistics') || name.includes('stat')) return BarChart3;
  if (name.includes('algebra')) return FunctionSquare;
  if (name.includes('geometry')) return Triangle;
  if (name.includes('converter') || name.includes('conversion')) return ArrowRightLeft;
  if (name.includes('currency') || name.includes('money')) return DollarSign;
  if (name.includes('programming') || name.includes('code')) return Binary;
  if (name.includes('graph')) return LineChart;
  return Calculator; // Default icon
};

interface CalculatorInput {
  key: string;
  label: string;
  type: string;
  placeholder?: string;
  defaultValue?: string | number;
  min?: number;
  max?: number;
  required?: boolean;
}

interface CalculatorResult {
  key: string;
  label: string;
  formula?: string;
  unit?: string;
  format: string;
}

export function AdvancedCalculator() {
  const [expression, setExpression] = useState('');
  const [display, setDisplay] = useState('0');
  const [currentCalculator, setCurrentCalculator] = useState<string>('basic');
  const [featuredCalculators, setFeaturedCalculators] = useState<CalculatorType[]>([]);
  const [loadingCalculators, setLoadingCalculators] = useState(true);
  const [selectedCalculator, setSelectedCalculator] = useState<CalculatorType | null>(null);
  const [calculatorInputs, setCalculatorInputs] = useState<Record<string, string>>({});
  const [calculatorResults, setCalculatorResults] = useState<Record<string, number | string>>({});

  useEffect(() => {
    // This is to avoid hydration mismatch
    console.log('[AdvancedCalculator] Component mounted');
  }, []);

  // Fetch featured (most used) calculators
  useEffect(() => {
    const fetchFeaturedCalculators = async () => {
      try {
        setLoadingCalculators(true);
        const data = await api.calculators.getAll({ most_used: true, is_active: true });
        setFeaturedCalculators(data.slice(0, 9)); // Limit to 9 calculators for quick access
      } catch (error) {
        console.error('Error fetching featured calculators:', error);
        setFeaturedCalculators([]);
      } finally {
        setLoadingCalculators(false);
      }
    };

    fetchFeaturedCalculators();
  }, []);

    const factorial = (n: number): number => {
        if (n < 0) return NaN;
        if (n === 0) return 1;
        let result = 1;
        for (let i = 2; i <= n; i++) {
            result *= i;
        }
        return result;
    };

  const handleButtonClick = (value: string) => {
    try {
        switch (value) {
        case 'C':
            setExpression('');
            setDisplay('0');
            break;
        case '←':
            if (expression.length > 0) {
                setExpression((prev) => prev.slice(0, -1));
            }
            break;
        case '=':
            // A simple and unsafe eval is used for this demonstration.
            // In a real application, use a proper math expression parser.
            // eslint-disable-next-line no-eval
            let evalExpression = expression
                .replace(/×/g, '*')
                .replace(/÷/g, '/')
                .replace(/π/g, 'Math.PI')
                .replace(/e/g, 'Math.E')
                .replace(/sin\(/g, 'Math.sin(')
                .replace(/cos\(/g, 'Math.cos(')
                .replace(/tan\(/g, 'Math.tan(')
                .replace(/ln\(/g, 'Math.log(')
                .replace(/log\(/g, 'Math.log10(')
                .replace(/√\(/g, 'Math.sqrt(');
            
             // Handle power
            if (evalExpression.includes('^')) {
                evalExpression = evalExpression.replace(/(\d+)\^(\d+)/g, 'Math.pow($1, $2)');
            }
            // Handle factorial
            if (evalExpression.includes('!')) {
                evalExpression = evalExpression.replace(/(\d+)!/g, (match, num) => String(factorial(Number(num))));
            }

            const result = eval(evalExpression);
            setDisplay(String(result));
            setExpression(String(result));
            break;
        case 'sin':
        case 'cos':
        case 'tan':
        case 'ln':
        case 'log':
        case '√':
            setExpression((prev) => prev + value + '(');
            break;
        case 'π':
        case 'e':
            setExpression((prev) => prev + value);
            break;
        case 'x²':
            setExpression((prev) => `(${prev})^2`);
            break;
        case 'x!':
             setExpression((prev) => `${prev}!`);
            break;
        case '÷':
        case '×':
        case '-':
        case '+':
        case '.':
        case '(':
        case ')':
        case '^':
            if (expression === '' && value !== '-' && value !== '(') return;
            setExpression((prev) => prev + value);
            break;
        default: // Numbers
            if (display === 'Error' || (display === '0' && value !== '.')) {
                setExpression(value);
            } else {
                setExpression((prev) => prev + value);
            }
        }
    } catch (error) {
        setDisplay('Error');
        setExpression('');
    }
  };

  useEffect(() => {
    if (expression === '') {
      setDisplay('0');
    } else {
      setDisplay(expression.replace(/\*/g, '×').replace(/\//g, '÷'));
    }
  }, [expression]);
  
  const basicButtons = [
    { value: 'C', label: 'C', className: 'bg-red-500/80 hover:bg-red-500 text-white' },
    { value: '←', label: <Delete />, className: 'bg-muted-foreground/50 hover:bg-muted-foreground/70 text-white' },
    { value: '%', label: '%', className: 'bg-muted-foreground/50 hover:bg-muted-foreground/70 text-white' },
    { value: '÷', label: '÷', className: 'bg-blue-500/80 hover:bg-blue-500 text-white' },
    { value: '7', label: '7' },
    { value: '8', label: '8' },
    { value: '9', label: '9' },
    { value: '×', label: '×', className: 'bg-blue-500/80 hover:bg-blue-500 text-white' },
    { value: '4', label: '4' },
    { value: '5', label: '5' },
    { value: '6', label: '6' },
    { value: '-', label: '-', className: 'bg-blue-500/80 hover:bg-blue-500 text-white' },
    { value: '1', label: '1' },
    { value: '2', label: '2' },
    { value: '3', label: '3' },
    { value: '+', label: '+', className: 'bg-blue-500/80 hover:bg-blue-500 text-white' },
    { value: '0', label: '0', gridSpan: 2 },
    { value: '.', label: '.' },
    { value: '=', label: '=', className: 'bg-primary hover:bg-primary/90 text-primary-foreground' },
  ];

  const scientificButtons = [
    { value: 'sin', label: 'sin' }, { value: 'cos', label: 'cos' }, { value: 'tan', label: 'tan' },
    { value: 'ln', label: 'ln' }, { value: 'log', label: 'log' },
    { value: 'π', label: <Pi/> }, { value: 'e', label: 'e' }, { value: '√', label: <SquareRadical /> },
    { value: '^', label: 'xʸ' }, { value: 'x!', label: 'x!' },
    { value: '(', label: '(' }, { value: ')', label: ')' },
    ...basicButtons
  ];


  // Calculate results for dynamic calculator
  const calculateDynamicResults = () => {
    if (!selectedCalculator) return;
    
    const inputs = Array.isArray(selectedCalculator.inputs) 
      ? selectedCalculator.inputs 
      : (selectedCalculator.inputs ? JSON.parse(selectedCalculator.inputs) : []);
    const results = Array.isArray(selectedCalculator.results) 
      ? selectedCalculator.results 
      : (selectedCalculator.results ? JSON.parse(selectedCalculator.results) : []);
    
    const calculatedResults: Record<string, number | string> = {};
    
    // Convert input values to numbers for formula evaluation
    const inputValues: Record<string, number> = {};
    let hasError = false;
    
    for (const input of inputs) {
      const value = parseFloat(calculatorInputs[input.key] || '0');
      if (isNaN(value) && input.required) {
        hasError = true;
        break;
      }
      inputValues[input.key] = value;
    }
    
    if (hasError) {
      setCalculatorResults({});
      return;
    }
    
    // Evaluate each result formula
    for (const result of results) {
      if (result.formula) {
        try {
          // Replace input keys with their values in the formula
          let formula = result.formula;
          Object.keys(inputValues).forEach(key => {
            const regex = new RegExp(`\\b${key}\\b`, 'g');
            formula = formula.replace(regex, inputValues[key].toString());
          });
          
          // Evaluate the formula (using eval like the basic calculator)
          // eslint-disable-next-line no-eval
          const value = eval(formula);
          
          // Format the result
          let formattedValue: string;
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
            formattedValue = Math.round(value).toString();
          } else {
            formattedValue = value.toFixed(2);
          }
          
          if (result.unit && result.format !== 'currency' && result.format !== 'percent') {
            formattedValue += ` ${result.unit}`;
          }
          
          calculatedResults[result.key] = formattedValue;
        } catch (error) {
          calculatedResults[result.key] = 'Error';
        }
      }
    }
    
    setCalculatorResults(calculatedResults);
  };

  // Recalculate when inputs change
  useEffect(() => {
    if (currentCalculator === 'dynamic' && selectedCalculator) {
      calculateDynamicResults();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [calculatorInputs, currentCalculator, selectedCalculator]);

  // Handle loading a calculator from quick access
  const handleLoadCalculator = (calc: CalculatorType) => {
    setSelectedCalculator(calc);
    setCurrentCalculator('dynamic');
    
    // Initialize input values
    const inputs = Array.isArray(calc.inputs) ? calc.inputs : (calc.inputs ? JSON.parse(calc.inputs) : []);
    const initialInputs: Record<string, string> = {};
    inputs.forEach((input: CalculatorInput) => {
      initialInputs[input.key] = input.defaultValue?.toString() || '';
    });
    setCalculatorInputs(initialInputs);
    setCalculatorResults({});
  };

  // Handle input change for dynamic calculator
  const handleDynamicInputChange = (key: string, value: string) => {
    setCalculatorInputs(prev => ({
      ...prev,
      [key]: value
    }));
  };

  // Render dynamic calculator
  const renderDynamicCalculator = () => {
    if (!selectedCalculator) return null;
    
    const inputs = Array.isArray(selectedCalculator.inputs) 
      ? selectedCalculator.inputs 
      : (selectedCalculator.inputs ? JSON.parse(selectedCalculator.inputs) : []);
    const results = Array.isArray(selectedCalculator.results) 
      ? selectedCalculator.results 
      : (selectedCalculator.results ? JSON.parse(selectedCalculator.results) : []);
    
    return (
      <div className="p-4 space-y-4">
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-xl font-bold">{selectedCalculator.name}</h2>
          <Button variant="link" onClick={() => {
            setCurrentCalculator('basic');
            setSelectedCalculator(null);
            setCalculatorInputs({});
            setCalculatorResults({});
          }} className="text-sm">
            Back to Basic
          </Button>
        </div>
        
        {selectedCalculator.description && (
          <p className="text-sm text-muted-foreground mb-4">{selectedCalculator.description}</p>
        )}
        
        <div className="space-y-3">
          <Label className="text-sm font-semibold">Inputs</Label>
          {inputs.map((input: CalculatorInput) => (
            <div key={input.key} className="space-y-1">
              <Label htmlFor={input.key} className="text-xs">
                {input.label}
                {input.required && <span className="text-red-500 ml-1">*</span>}
              </Label>
              <Input
                id={input.key}
                type={input.type === 'percent' ? 'number' : input.type}
                placeholder={input.placeholder || input.label}
                value={calculatorInputs[input.key] || ''}
                onChange={(e) => handleDynamicInputChange(input.key, e.target.value)}
                min={input.min}
                max={input.max}
                step={input.type === 'integer' ? '1' : 'any'}
                className="w-full"
              />
            </div>
          ))}
        </div>
        
        {Object.keys(calculatorResults).length > 0 && (
          <div className="mt-6 space-y-3 pt-4 border-t">
            <Label className="text-sm font-semibold">Results</Label>
            {results.map((result: CalculatorResult) => (
              calculatorResults[result.key] && (
                <div key={result.key} className="bg-muted p-3 rounded-lg">
                  <Label className="text-xs text-muted-foreground">{result.label}</Label>
                  <p className="text-2xl font-bold text-primary mt-1">
                    {calculatorResults[result.key]}
                  </p>
                </div>
              )
            ))}
          </div>
        )}
      </div>
    );
  };

  const renderCalculator = () => {
    if (currentCalculator === 'dynamic') {
      return renderDynamicCalculator();
    }
    
    switch (currentCalculator) {
      case 'scientific':
        return <ScientificCalculator />;
      case 'graphing':
        return <GraphingCalculator />;
      case 'financial':
        return <FinancialCalculator />;
      case 'statistics':
        return <StatisticsCalculator />;
      case 'algebra':
        return <AlgebraCalculator />;
      case 'geometry':
        return <GeometryCalculator />;
      case 'unit-converter':
        return <UnitConverter />;
      case 'currency':
        return <CurrencyConverter />;
      case 'programming':
        return <ProgrammingCalculator />;
      default:
        // Basic calculator
        const buttons = basicButtons;
        const gridCols = 'grid-cols-4';
        return (
          <>
            <div className="p-4 rounded-t-lg text-right mb-2">
              <div className="flex justify-between items-center mb-2">
                <h2 className="text-xl font-bold text-left">Basic Calculator</h2>
              </div>
              <div className="text-4xl font-bold text-foreground break-all h-12 flex items-end justify-end">{display}</div>
            </div>
            <div className={`grid ${gridCols} gap-2`}>
              {buttons.map((btn, i) => (
                <CalculatorButton
                  key={btn.value + i}
                  onClick={handleButtonClick}
                  value={btn.value}
                  className={cn('h-12 text-lg', btn.className)}
                  gridSpan={btn.gridSpan}
                >
                  {btn.label}
                </CalculatorButton>
              ))}
            </div>
          </>
        );
    }
  };

  const getCalculatorTitle = () => {
    if (currentCalculator === 'dynamic' && selectedCalculator) {
      return selectedCalculator.name;
    }
    // For the old calculator types, keep the same logic
    const oldTypes: Record<string, string> = {
      'scientific': 'Scientific',
      'graphing': 'Graphing',
      'financial': 'Financial',
      'statistics': 'Statistics',
      'algebra': 'Algebra',
      'geometry': 'Geometry',
      'unit-converter': 'Unit Converter',
      'currency': 'Currency',
      'programming': 'Programming',
    };
    return oldTypes[currentCalculator] || 'Basic Calculator';
  };
  
  return (
    <Card className="w-full max-w-md mx-auto shadow-2xl overflow-hidden bg-card/80 backdrop-blur-sm border-white/20">
      <CardContent className="p-2">
        {renderCalculator()}
        {featuredCalculators.length > 0 && (
          <div className="mt-4 p-2 bg-background/50 rounded-lg">
            <h3 className="text-xs font-semibold text-muted-foreground mb-2 px-1">Most Used</h3>
            <div className="grid grid-cols-3 gap-2">
              {loadingCalculators ? (
                // Loading skeleton
                Array.from({ length: 6 }).map((_, i) => (
                  <div
                    key={i}
                    className="flex flex-col items-center justify-center p-2 rounded-lg bg-muted/50 animate-pulse"
                  >
                    <div className="h-5 w-5 rounded bg-muted mb-1" />
                    <div className="h-3 w-full rounded bg-muted" />
                  </div>
                ))
              ) : (
                featuredCalculators.map((calc) => {
                  const Icon = getCategoryIcon(calc.category_name);
                  return (
                    <button
                      key={calc.id}
                      onClick={() => handleLoadCalculator(calc)}
                      className={cn(
                        "cursor-pointer flex flex-col items-center justify-center p-2 rounded-lg hover:bg-accent/80 text-center transition-colors h-full group",
                        selectedCalculator?.id === calc.id && "bg-accent"
                      )}
                      title={calc.name}
                    >
                      <Icon className={cn(
                        "h-5 w-5 mb-1 text-primary group-hover:scale-110 transition-all",
                        "group-hover:text-white",
                        selectedCalculator?.id === calc.id && "text-white"
                      )}/>
                      <span className={cn(
                        "text-xs font-medium line-clamp-2 text-foreground",
                        "group-hover:text-white",
                        selectedCalculator?.id === calc.id && "text-white"
                      )}>{calc.name}</span>
                    </button>
                  );
                })
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
