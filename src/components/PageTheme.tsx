"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

export type PageThemeId = "site" | "hof" | "admin";

export function themeFromPath(pathname: string): PageThemeId {
  if (pathname.startsWith("/pro-shop")) return "hof";
  if (pathname.startsWith("/admin")) return "admin";
  return "site";
}

/** Syncs body data-page-theme so header, tabs, and backgrounds match the page. */
export default function PageTheme() {
  const pathname = usePathname();

  useEffect(() => {
    const theme = themeFromPath(pathname);
    document.body.dataset.pageTheme = theme;
    return () => {
      delete document.body.dataset.pageTheme;
    };
  }, [pathname]);

  return null;
}
