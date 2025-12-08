"use client";

import { useTranslation } from "@/contexts/translation-context";
import { Loader2, Languages } from "lucide-react";
import { useEffect, useState } from "react";

const languageNames: Record<string, string> = {
  english: "English",
  spanish: "Spanish",
  french: "French",
  chinese: "Chinese",
  japanese: "Japanese",
  arabic: "Arabic",
  korean: "Korean",
  german: "German",
  italian: "Italian",
  polish: "Polish",
  portuguese: "Portuguese",
  romanian: "Romanian",
  swedish: "Swedish",
};

export function TranslationLoader() {
  const { isTranslatingPage, currentLanguage } = useTranslation();
  const [showLoader, setShowLoader] = useState(false);

  useEffect(() => {
    if (isTranslatingPage) {
      setShowLoader(true);
    } else {
      // Delay hiding loader slightly for smooth transition
      const timer = setTimeout(() => {
        setShowLoader(false);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [isTranslatingPage]);

  if (!showLoader) return null;

  const languageName = languageNames[currentLanguage] || currentLanguage;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-background/80 backdrop-blur-sm">
      <div className="flex flex-col items-center gap-4 p-8 bg-card rounded-lg shadow-lg border">
        <div className="relative">
          <Languages className="h-12 w-12 text-primary animate-pulse" />
          <Loader2 className="h-6 w-6 text-primary animate-spin absolute -top-1 -right-1" />
        </div>
        <div className="text-center">
          <p className="text-lg font-semibold">Translating page...</p>
          <p className="text-sm text-muted-foreground mt-1">
            Please wait while we translate the content to {languageName}
          </p>
        </div>
        <div className="w-64 h-1 bg-muted rounded-full overflow-hidden">
          <div className="h-full bg-primary rounded-full animate-pulse" style={{ width: '60%' }} />
        </div>
      </div>
    </div>
  );
}

