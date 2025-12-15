"use client";

import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Calculator, FunctionSquare, History, Delete } from 'lucide-react';
import { useTheme } from 'next-themes';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';

const factorial = (n: number): number => {
  if (n < 0) return NaN;
  if (n === 0) return 1;
  let result = 1;
  for (let i = 2; i <= n; i++) {
    result *= i;
  }
  return result;
};

type CalculatorMode = 'basic' | 'scientific';

type HistoryItem = {
  input: string;
  result: string;
};

export function AdvancedCalculator() {
  const { theme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [expression, setExpression] = useState('');
  const [display, setDisplay] = useState('0');
  const [result, setResult] = useState<string | null>(null);
  const [inputExpression, setInputExpression] = useState<string>('');
  const [mode, setMode] = useState<CalculatorMode>('basic');
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  // Handle hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  const isDark = mounted && (resolvedTheme === 'dark' || theme === 'dark');

  const handleButtonClick = (value: string) => {
    try {
      switch (value) {
        case 'C':
          setExpression('');
          setDisplay('0');
          setResult(null);
          setInputExpression('');
          break;
        case '←':
        case 'DEL':
          if (expression.length > 0) {
            const newExpression = expression.slice(0, -1);
            setExpression(newExpression);
            if (newExpression === '') {
              setDisplay('0');
              setResult(null);
              setInputExpression('');
            } else if (result !== null) {
              // If we're editing a result, clear the result state
              setResult(null);
              setInputExpression('');
            }
          }
          break;
        case '=':
          const currentInput = expression;
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
            .replace(/√\(/g, 'Math.sqrt(')
            .replace(/√/g, 'Math.sqrt(');
          
          // Handle power
          if (evalExpression.includes('^')) {
            evalExpression = evalExpression.replace(/(\d+(?:\.\d+)?)\^(\d+(?:\.\d+)?)/g, 'Math.pow($1, $2)');
          }
          // Handle factorial
          if (evalExpression.includes('!')) {
            evalExpression = evalExpression.replace(/(\d+)!/g, (match, num) => String(factorial(Number(num))));
          }
          // Handle x²
          if (evalExpression.includes('x²') || evalExpression.includes('²')) {
            evalExpression = evalExpression.replace(/(\d+(?:\.\d+)?)x²/g, 'Math.pow($1, 2)');
            evalExpression = evalExpression.replace(/(\d+(?:\.\d+)?)²/g, 'Math.pow($1, 2)');
          }
          // Handle e^x
          if (evalExpression.includes('Math.exp')) {
            // Already handled
          }

          try {
            const calculatedResult = eval(evalExpression);
            const formattedResult = typeof calculatedResult === 'number' 
              ? (calculatedResult % 1 === 0 
                  ? calculatedResult.toString() 
                  : calculatedResult.toFixed(10).replace(/\.?0+$/, ''))
              : String(calculatedResult);
            setDisplay(formattedResult);
            setResult(formattedResult);
            setInputExpression(currentInput);
            
            // Add to history (keep only last 10)
            setHistory((prev) => {
              const newHistory = [{ input: currentInput, result: formattedResult }, ...prev];
              return newHistory.slice(0, 10);
            });
            
            setExpression(formattedResult);
          } catch {
            setDisplay('Error');
            setResult(null);
            setInputExpression('');
            setExpression('');
          }
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
          setExpression((prev) => {
            if (prev === '') return '0²';
            return `(${prev})²`;
          });
          break;
        case 'x!':
          setExpression((prev) => {
            if (prev === '') return '0!';
            return `${prev}!`;
          });
          break;
        case 'x^y':
          setExpression((prev) => prev + '^');
          break;
        case 'e^x':
          setExpression((prev) => {
            if (prev === '') return 'Math.exp(0)';
            return `Math.exp(${prev})`;
          });
          break;
        case '1/x':
          setExpression((prev) => {
            if (prev === '') return '1/';
            return `1/(${prev})`;
          });
          break;
        case '|x|':
          setExpression((prev) => {
            if (prev === '') return 'Math.abs(0)';
            return `Math.abs(${prev})`;
          });
          break;
        case 'Rad':
          // Toggle between Rad and Deg (for now just add Rad indicator)
          break;
        case '÷':
        case '×':
        case '-':
        case '+':
        case '.':
        case '(':
        case ')':
        case '^':
        case '%':
          if (expression === '' && value !== '-' && value !== '(' && value !== '%') return;
          // If we have a result and user is typing an operator, continue from result
          if (result !== null && display === result) {
            // Continue from the result
            setResult(null);
            setInputExpression('');
            setExpression((prev) => prev + value);
          } else {
            setExpression((prev) => prev + value);
          }
          break;
        case '+/-':
          if (expression === '') {
            setExpression('-');
          } else {
            setExpression((prev) => {
              if (prev.startsWith('-')) {
                return prev.slice(1);
              } else {
                return '-' + prev;
              }
            });
          }
          break;
        default: // Numbers
          if (display === 'Error') {
            // If error, start fresh
            setExpression(value);
            setResult(null);
            setInputExpression('');
          } else if (result !== null && display === result) {
            // If we just calculated a result and user types a number, start fresh
            setExpression(value);
            setResult(null);
            setInputExpression('');
          } else if (display === '0' && value !== '.') {
            setExpression(value);
            setResult(null);
          } else {
            // Continue typing
            if (result !== null) {
              // If result exists but we're continuing, clear result state
              setResult(null);
              setInputExpression('');
            }
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
    } else if (result === null) {
      // Show expression while typing
      setDisplay(expression.replace(/\*/g, '×').replace(/\//g, '÷'));
    }
    // If result is set, display is already set to the result
  }, [expression, result]);

  // Basic mode buttons
  const basicButtons = [
    { value: 'C', label: 'C', type: 'operator' }, // C is orange in iOS
    { value: '()', label: '()', type: 'function' },
    { value: '%', label: '%', type: 'function' },
    { value: '÷', label: '÷', type: 'operator' },
    { value: '7', label: '7', type: 'number' },
    { value: '8', label: '8', type: 'number' },
    { value: '9', label: '9', type: 'number' },
    { value: '×', label: '×', type: 'operator' },
    { value: '4', label: '4', type: 'number' },
    { value: '5', label: '5', type: 'number' },
    { value: '6', label: '6', type: 'number' },
    { value: '-', label: '-', type: 'operator' },
    { value: '1', label: '1', type: 'number' },
    { value: '2', label: '2', type: 'number' },
    { value: '3', label: '3', type: 'number' },
    { value: '+', label: '+', type: 'operator' },
    { value: '+/-', label: '+/-', type: 'function' },
    { value: '0', label: '0', type: 'number' },
    { value: '.', label: '.', type: 'number' },
    { value: '=', label: '=', type: 'equals' },
  ];

  // Scientific mode buttons
  const scientificButtons = [
    // Row 1: Shift, Rad, √, |x|
    { value: '←', label: '←', type: 'function' },
    { value: 'Rad', label: 'Rad', type: 'function' },
    { value: '√', label: '√', type: 'function' },
    { value: '|x|', label: '|x|', type: 'function' },
    // Row 2: sin, cos, tan, π
    { value: 'sin', label: 'sin', type: 'function' },
    { value: 'cos', label: 'cos', type: 'function' },
    { value: 'tan', label: 'tan', type: 'function' },
    { value: 'π', label: 'π', type: 'function' },
    // Row 3: ln, log, 1/x, e
    { value: 'ln', label: 'ln', type: 'function' },
    { value: 'log', label: 'log', type: 'function' },
    { value: '1/x', label: '1/x', type: 'function' },
    { value: 'e', label: 'e', type: 'function' },
    // Row 4: e^x, x², x^y, (empty)
    { value: 'e^x', label: 'e^x', type: 'function' },
    { value: 'x²', label: 'x²', type: 'function' },
    { value: 'x^y', label: 'x^y', type: 'function' },
    { value: '', label: '', type: 'empty' },
    // Row 5: C, (, ), %
    { value: 'C', label: 'C', type: 'operator' },
    { value: '(', label: '(', type: 'function' },
    { value: ')', label: ')', type: 'function' },
    { value: '%', label: '%', type: 'function' },
    // Row 6: 7, 8, 9, ÷
    { value: '7', label: '7', type: 'number' },
    { value: '8', label: '8', type: 'number' },
    { value: '9', label: '9', type: 'number' },
    { value: '÷', label: '÷', type: 'operator' },
    // Row 7: 4, 5, 6, ×
    { value: '4', label: '4', type: 'number' },
    { value: '5', label: '5', type: 'number' },
    { value: '6', label: '6', type: 'number' },
    { value: '×', label: '×', type: 'operator' },
    // Row 8: 1, 2, 3, -
    { value: '1', label: '1', type: 'number' },
    { value: '2', label: '2', type: 'number' },
    { value: '3', label: '3', type: 'number' },
    { value: '-', label: '-', type: 'operator' },
    // Row 9: +/-, 0, ., =
    { value: '+/-', label: '+/-', type: 'function' },
    { value: '0', label: '0', type: 'number' },
    { value: '.', label: '.', type: 'number' },
    { value: '=', label: '=', type: 'equals' },
  ];

  const getButtonClassName = (type: string, value?: string) => {
    if (isDark) {
      // Dark mode colors with greenish theme
      switch (type) {
        case 'number':
          return 'bg-[#2a2a2a] hover:bg-[#353535] active:bg-[#1f1f1f] text-white';
        case 'operator':
          return 'bg-primary hover:bg-primary/90 active:bg-primary/80 text-primary-foreground';
        case 'function':
          return 'bg-[#3a3a3a] hover:bg-[#454545] active:bg-[#2f2f2f] text-white';
        case 'equals':
          return 'bg-primary hover:bg-primary/90 active:bg-primary/80 text-primary-foreground';
        case 'empty':
          return 'bg-transparent';
        default:
          return 'bg-[#2a2a2a] hover:bg-[#353535] text-white';
      }
    } else {
      // Light mode colors with greenish theme - white/light backgrounds
      switch (type) {
        case 'number':
          return 'bg-[#f5f5f5] hover:bg-[#e8e8e8] active:bg-[#dcdcdc] text-foreground';
        case 'operator':
          return 'bg-primary hover:bg-primary/90 active:bg-primary/80 text-primary-foreground';
        case 'function':
          return 'bg-[#e8e8e8] hover:bg-[#dcdcdc] active:bg-[#d0d0d0] text-foreground';
        case 'equals':
          return 'bg-primary hover:bg-primary/90 active:bg-primary/80 text-primary-foreground';
        case 'empty':
          return 'bg-transparent';
        default:
          return 'bg-[#f5f5f5] hover:bg-[#e8e8e8] text-foreground';
      }
    }
  };

  const handleParentheses = () => {
    const openCount = (expression.match(/\(/g) || []).length;
    const closeCount = (expression.match(/\)/g) || []).length;
    if (openCount > closeCount) {
      setExpression((prev) => prev + ')');
    } else {
      setExpression((prev) => prev + '(');
    }
  };

  const buttons = mode === 'basic' ? basicButtons : scientificButtons;

  if (!mounted) {
    return (
      <div className="w-full max-w-sm mx-auto">
        <div className="bg-card rounded-3xl overflow-hidden shadow-2xl min-h-[600px]" />
      </div>
    );
  }

  return (
    <div className="w-full max-w-sm mx-auto">
      <div className={cn(
        'rounded-3xl overflow-hidden shadow-2xl border transition-all duration-300 ease-in-out',
        isDark 
          ? 'bg-[#1a1a1a] border-border' 
          : 'bg-white border-border'
      )}>
        {/* Display Area */}
        <div className={cn(
          'px-6 py-6 min-h-[140px] flex flex-col justify-end transition-all duration-300 ease-in-out',
          isDark ? 'bg-[#1a1a1a]' : 'bg-white'
        )}>
          <div className="text-right">
            {result !== null && inputExpression && (
              <div className={cn(
                'text-xl font-light mb-1 break-all leading-tight opacity-70',
                isDark ? 'text-gray-400' : 'text-gray-600'
              )}>
                {inputExpression.length > 20 ? (
                  <div className="text-lg">{inputExpression}</div>
                ) : (
                  inputExpression
                )}
              </div>
            )}
            <div className={cn(
              'text-5xl font-light mb-2 break-all leading-tight',
              isDark ? 'text-white' : 'text-foreground'
            )}>
              {display.length > 12 ? (
                <div className="text-3xl">{display}</div>
              ) : (
                display
              )}
            </div>
          </div>
        </div>

        {/* Mode Toggle, History, and Delete */}
        <div className="px-4 pb-2 flex gap-2 transition-all duration-300 ease-in-out">
          <button
            onClick={() => setMode(mode === 'basic' ? 'scientific' : 'basic')}
            className={cn(
              'py-2.5 px-4 rounded-lg text-sm font-medium transition-all duration-300 ease-in-out flex items-center justify-center gap-2',
              isDark
                ? 'bg-[#2a2a2a] text-foreground hover:bg-[#353535]'
                : 'bg-muted text-foreground hover:bg-muted/80'
            )}
          >
            {mode === 'basic' ? (
              <>
                <FunctionSquare className="h-4 w-4" />
                Scientific
              </>
            ) : (
              <>
                <Calculator className="h-4 w-4" />
                Basic
              </>
            )}
          </button>
          <button
            onClick={() => setIsHistoryOpen(true)}
            className={cn(
              'py-2.5 px-4 rounded-lg text-sm font-medium transition-all duration-300 ease-in-out flex items-center justify-center gap-2',
              isDark
                ? 'bg-[#2a2a2a] text-foreground hover:bg-[#353535]'
                : 'bg-muted text-foreground hover:bg-muted/80'
            )}
          >
            <History className="h-4 w-4" />
          </button>
          <button
            onClick={() => handleButtonClick('←')}
            className={cn(
              'py-2.5 px-4 rounded-lg text-sm font-medium transition-all duration-300 ease-in-out flex items-center justify-center gap-2 ml-auto',
              isDark
                ? 'bg-[#2a2a2a] text-foreground hover:bg-[#353535]'
                : 'bg-muted text-foreground hover:bg-muted/80'
            )}
          >
            <Delete className="h-4 w-4" />
          </button>
        </div>

        {/* Button Grid */}
        <div className={cn(
          'transition-all duration-300 ease-in-out',
          mode === 'basic' ? 'p-2 pb-6' : 'p-1.5 pb-5'
        )}>
          <div className={cn(
            'grid transition-all duration-300 ease-in-out',
            mode === 'basic' 
              ? 'grid-cols-4 gap-2' 
              : 'grid-cols-4 gap-1'
          )}>
            {buttons.map((btn, index) => {
              if (btn.type === 'empty') {
                return <div key={`empty-${index}`} className="col-span-1" />;
              }
              
              const span = btn.span || 1;
              
              return (
                <button
                  key={`${btn.value}-${index}`}
                  onClick={() => {
                    if (btn.value === '()') {
                      handleParentheses();
                    } else if (btn.value !== '') {
                      handleButtonClick(btn.value);
                    }
                  }}
                  className={cn(
                    'rounded-full font-medium transition-all duration-150',
                    'active:scale-95 focus:outline-none',
                    mode === 'basic'
                      ? 'h-16 text-2xl'
                      : 'h-10 text-sm',
                    getButtonClassName(btn.type, btn.value),
                    span === 2 && 'col-span-2',
                    span === 4 && 'col-span-4'
                  )}
                  disabled={btn.value === ''}
                >
                  {btn.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* History Dialog */}
      <Dialog open={isHistoryOpen} onOpenChange={setIsHistoryOpen}>
        <DialogContent className="max-w-md max-h-[80vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle>Calculation History</DialogTitle>
            <DialogDescription>
              Your last {history.length} calculation{history.length !== 1 ? 's' : ''}
            </DialogDescription>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto mt-4">
            {history.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No calculations yet
              </div>
            ) : (
              <div className="space-y-3">
                {history.map((item, index) => (
                  <div
                    key={index}
                    className={cn(
                      'p-3 rounded-lg border cursor-pointer hover:bg-muted/50 transition-colors',
                      isDark ? 'border-gray-700' : 'border-gray-200'
                    )}
                    onClick={() => {
                      setExpression(item.result);
                      setDisplay(item.result);
                      setResult(item.result);
                      setInputExpression(item.input);
                      setIsHistoryOpen(false);
                    }}
                  >
                    <div className={cn(
                      'text-sm mb-1 break-all',
                      isDark ? 'text-gray-400' : 'text-gray-600'
                    )}>
                      {item.input}
                    </div>
                    <div className={cn(
                      'text-lg font-semibold break-all',
                      isDark ? 'text-white' : 'text-foreground'
                    )}>
                      = {item.result}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
