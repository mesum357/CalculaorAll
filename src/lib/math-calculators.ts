import {
  Percent,
  Calculator,
  FunctionSquare,
  AreaChart,
  Divide,
  Sigma,
  Triangle,
  Circle,
  Ruler,
  Box,
  GitCommitHorizontal,
  Lightbulb
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export const MATH_CALCULATORS_DATA = {
    "title": "Math Calculators",
    "count": 15,
    "description": "Comprehensive collection of math calculators covering percentages, algebra, arithmetic, coordinate geometry, fractions, linear algebra, trigonometry, 2D geometry, triangles, circles, angles, 3D geometry, sequences, exponents and logarithms, and other mathematical calculations. From average percentage to Babylonian numbers conversion, our math calculators help you solve mathematical problems with precision.",
    "subcategories": [
        {
            "title": "Percentages calculators",
            "icon": Percent,
            "calculators": [
                { "name": "Average Percentage Calculator", "href": "/calculators/math/average-percentage-calculator" },
            ]
        },
        {
            "title": "Algebra calculators",
            "icon": FunctionSquare,
            "calculators": [
                { "name": "Absolute Value Equation Calculator", "href": "/calculators/math/absolute-value-equation-calculator" },
            ]
        },
        {
            "title": "Arithmetic calculators",
            "icon": Divide,
            "calculators": [
                { "name": "Absolute Change Calculator", "href": "/calculators/math/absolute-change-calculator" },
            ]
        },
        {
            "title": "Coordinate geometry calculators",
            "icon": AreaChart,
            "calculators": [
                { "name": "Average Rate of Change Calculator", "href": "/calculators/math/average-rate-of-change-calculator" },
            ]
        },
        {
            "title": "Fractions calculators",
            "icon": Sigma,
            "calculators": [
                { "name": "Adding Fractions Calculator", "href": "/calculators/math/adding-fractions-calculator" },
            ]
        },
        {
            "title": "Linear algebra calculators",
            "icon": FunctionSquare,
            "calculators": [
                { "name": "Adjoint Matrix Calculator", "href": "/calculators/math/adjoint-matrix-calculator" },
            ]
        },
        {
            "title": "Trigonometry calculators",
            "icon": Triangle,
            "calculators": [
                { "name": "Arccos Calculator (Inverse Cosine)", "href": "/calculators/math/arccos-calculator" },
            ]
        },
        {
            "title": "2D geometry calculators",
            "icon": Triangle,
            "calculators": [
                { "name": "Area Calculator", "href": "/calculators/math/area-calculator" },
            ]
        },
        {
            "title": "Triangle calculators",
            "icon": Triangle,
            "calculators": [
                { "name": "30 60 90 Triangle Calculator", "href": "/calculators/math/30-60-90-triangle-calculator" },
            ]
        },
        {
            "title": "Circle calculators",
            "icon": Circle,
            "calculators": [
                { "name": "Arc Length Calculator", "href": "/calculators/math/arc-length-calculator" },
            ]
        },
        {
            "title": "Angle calculators",
            "icon": Ruler,
            "calculators": [
                { "name": "Angle Between Two Vectors Calculator", "href": "/calculators/math/angle-between-two-vectors-calculator" },
            ]
        },
        {
            "title": "3D geometry calculators",
            "icon": Box,
            "calculators": [
                { "name": "Surface Area of a Hemisphere Calculator", "href": "/calculators/math/surface-area-of-hemisphere-calculator" },
            ]
        },
        {
            "title": "Sequences calculators",
            "icon": GitCommitHorizontal,
            "calculators": [
                { "name": "Arithmetic Sequence Calculator", "href": "/calculators/math/arithmetic-sequence-calculator" },
            ]
        },
        {
            "title": "Exponents and logarithms calculators",
            "icon": FunctionSquare,
            "calculators": [
                { "name": "Antilog Calculator – Antilogarithm", "href": "/calculators/math/antilog-calculator" },
            ]
        },
        {
            "title": "Other calculators",
            "icon": Lightbulb,
            "calculators": [
                { "name": "Babylonian Numbers Converter", "href": "/calculators/math/babylonian-numbers-converter" },
            ]
        },
    ]
}
