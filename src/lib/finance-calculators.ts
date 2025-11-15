import {
  Briefcase,
  TrendingUp,
  PieChart,
  CreditCard,
  LineChart,
  Receipt,
  Home,
  Wallet,
  FileText,
  PiggyBank,
  ShoppingCart,
  Building2,
  Globe,
  Flag,
  Calculator,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export const FINANCE_CALCULATORS_DATA = {
    "title": "Finance Calculators",
    "count": 16,
    "description": "Comprehensive collection of finance calculators covering business planning, investments, equity, debt, derivatives, taxes, mortgages, personal finance, retirement, sales, microeconomics, macroeconomics, and region-specific calculators. From 3D printer cost analysis to Black Scholes options pricing, our finance calculators help you make informed financial decisions.",
    "subcategories": [
        {
            "title": "Business planning calculators",
            "icon": Briefcase,
            "calculators": [
                { "name": "3D Printer - Buy vs Outsource Calculator", "href": "/calculators/finance/3d-printer-buy-vs-outsource-calculator" },
            ]
        },
        {
            "title": "General investment calculators",
            "icon": TrendingUp,
            "calculators": [
                { "name": "Annualized Rate of Return Calculator", "href": "/calculators/finance/annualized-rate-of-return-calculator" },
            ]
        },
        {
            "title": "Equity investment calculators",
            "icon": PieChart,
            "calculators": [
                { "name": "Beta Stock Calculator", "href": "/calculators/finance/beta-stock-calculator" },
            ]
        },
        {
            "title": "Debt investment calculators",
            "icon": CreditCard,
            "calculators": [
                { "name": "After-tax Cost of Debt Calculator", "href": "/calculators/finance/after-tax-cost-of-debt-calculator" },
            ]
        },
        {
            "title": "Derivatives investment calculators",
            "icon": LineChart,
            "calculators": [
                { "name": "Black Scholes Calculator", "href": "/calculators/finance/black-scholes-calculator" },
            ]
        },
        {
            "title": "Tax and salary calculators",
            "icon": Receipt,
            "calculators": [
                { "name": "12-Hour Shift Pay Calculator", "href": "/calculators/finance/12-hour-shift-pay-calculator" },
            ]
        },
        {
            "title": "Mortgage and real estate calculators",
            "icon": Home,
            "calculators": [
                { "name": "3x Rent Calculator", "href": "/calculators/finance/3x-rent-calculator" },
            ]
        },
        {
            "title": "Personal finance calculators",
            "icon": Wallet,
            "calculators": [
                { "name": "403b Calculator", "href": "/calculators/finance/403b-calculator" },
            ]
        },
        {
            "title": "Debt management calculators",
            "icon": FileText,
            "calculators": [
                { "name": "10/1 ARM Calculator", "href": "/calculators/finance/10-1-arm-calculator" },
            ]
        },
        {
            "title": "Retirement calculators",
            "icon": PiggyBank,
            "calculators": [
                { "name": "401k Calculator", "href": "/calculators/finance/401k-calculator" },
            ]
        },
        {
            "title": "Sales calculators",
            "icon": ShoppingCart,
            "calculators": [
                { "name": "Black Friday Calculator", "href": "/calculators/finance/black-friday-calculator" },
            ]
        },
        {
            "title": "Microeconomics calculators",
            "icon": Building2,
            "calculators": [
                { "name": "Accounting Profit Calculator", "href": "/calculators/finance/accounting-profit-calculator" },
            ]
        },
        {
            "title": "Macroeconomics calculators",
            "icon": Globe,
            "calculators": [
                { "name": "Buying Power Calculator", "href": "/calculators/finance/buying-power-calculator" },
            ]
        },
        {
            "title": "UK finance calculators 🇬🇧",
            "icon": Flag,
            "calculators": [
                { "name": "Capital Gains Tax UK Calculator", "href": "/calculators/finance/capital-gains-tax-uk-calculator" },
            ]
        },
        {
            "title": "Indian finance calculators 🇮🇳",
            "icon": Flag,
            "calculators": [
                { "name": "Atal Pension Yojana Calculator", "href": "/calculators/finance/atal-pension-yojana-calculator" },
            ]
        },
        {
            "title": "Other calculators",
            "icon": Calculator,
            "calculators": [
                { "name": "Brexit Calculator", "href": "/calculators/finance/brexit-calculator" },
            ]
        },
    ]
}

