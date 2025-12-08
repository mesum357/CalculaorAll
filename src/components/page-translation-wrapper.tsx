"use client";

import { usePageTranslation } from "@/hooks/use-page-translation";
import { TranslationLoader } from "@/components/translation-loader";
import { ReactNode } from "react";

export function PageTranslationWrapper({ children }: { children: ReactNode }) {
  usePageTranslation();
  return (
    <>
      {children}
      <TranslationLoader />
    </>
  );
}

