import {
  Ruler,
  Activity,
  Shield,
  Apple,
  Droplet,
  Heart,
  Moon,
  HeartPulse,
  Baby,
  Pill,
  Syringe,
  Wind,
  Brain,
  AlertTriangle,
  UtensilsCrossed,
  AlertCircle,
  Scan,
  Users,
  Syringe as Vaccine,
  Eye,
  Calculator,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export const HEALTH_CALCULATORS_DATA = {
    "title": "Health & Fitness Calculators",
    "count": 25,
    "description": "Comprehensive collection of health and fitness calculators covering body measurements, BMI, army fitness, dietary needs, diabetes, metabolic disorders, sleep, cardiovascular health, gynecology, addiction medicine, urology, electrolytes, hematology, percentiles, pediatrics, dosages, pulmonary health, psychiatry, emergency care, digestive system, epidemiology, radiology, geriatric medicine, COVID-19, and vision. From ABSI to 20/20 vision, our health calculators help you monitor and improve your health.",
    "subcategories": [
        {
            "title": "Body measurements calculators",
            "icon": Ruler,
            "calculators": [
                { "name": "ABSI Calculator", "href": "/calculators/health/absi-calculator" },
            ]
        },
        {
            "title": "BMI calculators",
            "icon": Activity,
            "calculators": [
                { "name": "BMI Calculator – Body Mass Index", "href": "/calculators/health/bmi-calculator" },
            ]
        },
        {
            "title": "Army calculators",
            "icon": Shield,
            "calculators": [
                { "name": "ACFT Calculator", "href": "/calculators/health/acft-calculator" },
            ]
        },
        {
            "title": "Dietary calculators",
            "icon": Apple,
            "calculators": [
                { "name": "Added Sugar Intake Calculator", "href": "/calculators/health/added-sugar-intake-calculator" },
            ]
        },
        {
            "title": "Diabetes calculators",
            "icon": Droplet,
            "calculators": [
                { "name": "Blood Sugar Converter", "href": "/calculators/health/blood-sugar-converter" },
            ]
        },
        {
            "title": "Metabolic disorders calculators",
            "icon": Heart,
            "calculators": [
                { "name": "Cholesterol Ratio Calculator", "href": "/calculators/health/cholesterol-ratio-calculator" },
            ]
        },
        {
            "title": "Sleep calculators",
            "icon": Moon,
            "calculators": [
                { "name": "AHI Calculator | Apnea-Hypopnea Index", "href": "/calculators/health/ahi-calculator" },
            ]
        },
        {
            "title": "Cardiovascular system calculators",
            "icon": HeartPulse,
            "calculators": [
                { "name": "6 Minute Walk Test Calculator", "href": "/calculators/health/6-minute-walk-test-calculator" },
            ]
        },
        {
            "title": "Gynecology & pregnancy calculators",
            "icon": Baby,
            "calculators": [
                { "name": "BBT Calculator | Basal Body Temperature", "href": "/calculators/health/bbt-calculator" },
            ]
        },
        {
            "title": "Addiction medicine calculators",
            "icon": Pill,
            "calculators": [
                { "name": "Addiction Calculator", "href": "/calculators/health/addiction-calculator" },
            ]
        },
        {
            "title": "Urology & nephrology calculators",
            "icon": Droplet,
            "calculators": [
                { "name": "Adrenal Washout Calculator", "href": "/calculators/health/adrenal-washout-calculator" },
            ]
        },
        {
            "title": "Electrolytes & fluids calculators",
            "icon": Droplet,
            "calculators": [
                { "name": "Acid Base Calculator", "href": "/calculators/health/acid-base-calculator" },
            ]
        },
        {
            "title": "Hematology calculators",
            "icon": HeartPulse,
            "calculators": [
                { "name": "4T Score Calculator | HIT", "href": "/calculators/health/4t-score-calculator" },
            ]
        },
        {
            "title": "Percentile calculators",
            "icon": Baby,
            "calculators": [
                { "name": "Baby Percentile Calculator", "href": "/calculators/health/baby-percentile-calculator" },
            ]
        },
        {
            "title": "Pediatric calculators",
            "icon": Baby,
            "calculators": [
                { "name": "Adjusted Age Calculator", "href": "/calculators/health/adjusted-age-calculator" },
            ]
        },
        {
            "title": "Pediatric dosage calculators",
            "icon": Syringe,
            "calculators": [
                { "name": "Amoxicillin Pediatric Dosage Calculator", "href": "/calculators/health/amoxicillin-pediatric-dosage-calculator" },
            ]
        },
        {
            "title": "Dosage calculators",
            "icon": Pill,
            "calculators": [
                { "name": "Adderall Dosage Calculator", "href": "/calculators/health/adderall-dosage-calculator" },
            ]
        },
        {
            "title": "Pulmonary calculators",
            "icon": Wind,
            "calculators": [
                { "name": "Aa Gradient Calculator", "href": "/calculators/health/aa-gradient-calculator" },
            ]
        },
        {
            "title": "Psychiatry & psychology calculators",
            "icon": Brain,
            "calculators": [
                { "name": "Depression Screening by PHQ-2 Calculator", "href": "/calculators/health/depression-screening-phq2-calculator" },
            ]
        },
        {
            "title": "Intensive & emergency care calculators",
            "icon": AlertTriangle,
            "calculators": [
                { "name": "Alvarado Score Calculator", "href": "/calculators/health/alvarado-score-calculator" },
            ]
        },
        {
            "title": "Digestive system calculators",
            "icon": UtensilsCrossed,
            "calculators": [
                { "name": "APRI Calculator", "href": "/calculators/health/apri-calculator" },
            ]
        },
        {
            "title": "Epidemiology calculators",
            "icon": AlertCircle,
            "calculators": [
                { "name": "COVID-19 Mortality Risk Calculator", "href": "/calculators/health/covid19-mortality-risk-calculator" },
            ]
        },
        {
            "title": "Radiology calculators",
            "icon": Scan,
            "calculators": [
                { "name": "BED Calculator", "href": "/calculators/health/bed-calculator" },
            ]
        },
        {
            "title": "Geriatric medicine calculators",
            "icon": Users,
            "calculators": [
                { "name": "Alzheimer's Life Expectancy Calculator", "href": "/calculators/health/alzheimers-life-expectancy-calculator" },
            ]
        },
        {
            "title": "Covid-19 vaccine calculators",
            "icon": Vaccine,
            "calculators": [
                { "name": "Biden's Vaccine Plan Calculator", "href": "/calculators/health/bidens-vaccine-plan-calculator" },
            ]
        },
        {
            "title": "Other calculators",
            "icon": Calculator,
            "calculators": [
                { "name": "20/20 Vision Calculator for 2020", "href": "/calculators/health/20-20-vision-calculator" },
            ]
        },
    ]
}

