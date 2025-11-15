import {
  ChefHat,
  Coffee,
  GlassWater,
  Cake,
  Pizza,
  Gift,
  PartyPopper,
  Calculator,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export const FOOD_CALCULATORS_DATA = {
    "title": "Food Calculators",
    "count": 8,
    "description": "Comprehensive collection of food calculators covering cooking conversions, tea and coffee, drinks, desserts and baking, pizza, Thanksgiving, party planning, and more. From butter measurements to BBQ grill sizing, our food calculators help you with all your culinary needs.",
    "subcategories": [
        {
            "title": "Cooking converters",
            "icon": ChefHat,
            "calculators": [
                { "name": "Butter Calculator - How Much is a Stick of Butter?", "href": "/calculators/food/butter-calculator" },
            ]
        },
        {
            "title": "Tea and coffee calculators",
            "icon": Coffee,
            "calculators": [
                { "name": "Coffee Calculator", "href": "/calculators/food/coffee-calculator" },
            ]
        },
        {
            "title": "Drinks calculators",
            "icon": GlassWater,
            "calculators": [
                { "name": "ABV Calculator (Alcohol by Volume)", "href": "/calculators/food/abv-calculator" },
            ]
        },
        {
            "title": "Desserts and baking calculators",
            "icon": Cake,
            "calculators": [
                { "name": "Baker's Percentage Calculator", "href": "/calculators/food/bakers-percentage-calculator" },
            ]
        },
        {
            "title": "Pizza calculators",
            "icon": Pizza,
            "calculators": [
                { "name": "Perfect Pizza Calculator", "href": "/calculators/food/perfect-pizza-calculator" },
            ]
        },
        {
            "title": "Thanksgiving calculators",
            "icon": Gift,
            "calculators": [
                { "name": "Thanksgiving Calculator", "href": "/calculators/food/thanksgiving-calculator" },
            ]
        },
        {
            "title": "Party calculators",
            "icon": PartyPopper,
            "calculators": [
                { "name": "BBQ Grill Size Calculator", "href": "/calculators/food/bbq-grill-size-calculator" },
            ]
        },
        {
            "title": "Other calculators",
            "icon": Calculator,
            "calculators": [
                { "name": "Bacon Curing Calculator", "href": "/calculators/food/bacon-curing-calculator" },
            ]
        },
    ]
}

