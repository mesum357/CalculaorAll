"use client";

import { Languages } from "lucide-react";
import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { useTranslation, type Language } from "@/contexts/translation-context";
import { useState, useEffect } from "react";

const languageNames: Record<Language, string> = {
  english: "English",
  spanish: "Español",
  french: "Français",
  chinese: "中文",
  japanese: "日本語",
  arabic: "العربية",
  korean: "한국어",
  german: "Deutsch",
  italian: "Italiano",
  polish: "Polski",
  portuguese: "Português",
  romanian: "Română",
  swedish: "Svenska",
};

export function LanguageSelector() {
  const { currentLanguage, setLanguage, languages } = useTranslation();
  const [isChanging, setIsChanging] = useState(false);

  const handleLanguageChange = async (language: Language) => {
    if (language === currentLanguage) return;
    
    setIsChanging(true);
    try {
      // For English, we need to do a full page navigation to get fresh server-rendered content
      // This is the most reliable way to restore original English text since client-side
      // translation modifies the DOM directly
      if (language === 'english') {
        // Set the cookie first so the server knows the preference
        document.cookie = `preferredLanguage=en;path=/;max-age=${60 * 60 * 24 * 365}`;
        localStorage.setItem('preferredLanguage', 'english');
        
        // Calculate the new English URL and do a full navigation
        const currentPath = window.location.pathname;
        const pathWithoutLang = currentPath.replace(/^\/[a-z]{2}(\/|$)/, '/') || '/';
        const cleanPath = pathWithoutLang === '/' ? '' : pathWithoutLang.slice(1);
        const newPath = `/en/${cleanPath}`;
        
        // Full page navigation to get fresh content
        window.location.href = newPath;
        return;
      }
      
      await setLanguage(language);
      // Clear translated markers so content can be re-translated
      document.querySelectorAll('[data-translated]').forEach(el => {
        el.removeAttribute('data-translated');
      });
      // Trigger translation immediately
      window.dispatchEvent(new Event('languagechange'));
    } catch (error) {
      // Error handled silently
    } finally {
      setIsChanging(false);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon" 
          className="relative"
          disabled={isChanging}
        >
          <Languages className="h-5 w-5" />
          <span className="sr-only">Select language</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56 max-h-[80vh] overflow-y-auto">
        {(() => {
          // Always use the complete list of all 13 languages
          const allLanguages = [
            { code: 'en', name: 'English', key: 'english' },
            { code: 'es', name: 'Spanish', key: 'spanish' },
            { code: 'fr', name: 'French', key: 'french' },
            { code: 'zh', name: 'Chinese', key: 'chinese' },
            { code: 'ja', name: 'Japanese', key: 'japanese' },
            { code: 'ar', name: 'Arabic', key: 'arabic' },
            { code: 'ko', name: 'Korean', key: 'korean' },
            { code: 'de', name: 'German', key: 'german' },
            { code: 'it', name: 'Italian', key: 'italian' },
            { code: 'pl', name: 'Polish', key: 'polish' },
            { code: 'pt', name: 'Portuguese', key: 'portuguese' },
            { code: 'ro', name: 'Romanian', key: 'romanian' },
            { code: 'sv', name: 'Swedish', key: 'swedish' },
          ];
          
          // Use API languages if available and complete (13 languages), otherwise use fallback
          const languagesToShow = (languages.length >= 13) ? languages : allLanguages;
          
          return languagesToShow;
        })().map((lang) => (
          <DropdownMenuItem
            key={lang.key}
            onClick={() => handleLanguageChange(lang.key as Language)}
            className={currentLanguage === lang.key ? "bg-accent" : ""}
          >
            <span className="flex-1">{languageNames[lang.key as Language] || lang.name}</span>
            {currentLanguage === lang.key && (
              <span className="ml-2 text-xs text-muted-foreground">✓</span>
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

