"use client";

import { useEffect, useSyncExternalStore } from "react";
import { useLocale } from "@/components/locale-provider";

type Theme = "dark" | "light";
const storageKey = "cortez-theme";
const themeChangedEvent = "cortez-theme-changed";

function getTheme(): Theme {
  return window.localStorage.getItem(storageKey) === "light" ? "light" : "dark";
}

function subscribe(callback: () => void) {
  window.addEventListener("storage", callback);
  window.addEventListener(themeChangedEvent, callback);
  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener(themeChangedEvent, callback);
  };
}

export function ThemeToggle() {
  const { t } = useLocale();
  const theme = useSyncExternalStore(subscribe, getTheme, () => "dark");

  useEffect(() => {
    const saved = window.localStorage.getItem(storageKey);
    const nextTheme: Theme = saved === "light" ? "light" : "dark";
    document.documentElement.dataset.theme = nextTheme;
  }, []);

  function toggleTheme() {
    const nextTheme: Theme = theme === "dark" ? "light" : "dark";
    document.documentElement.dataset.theme = nextTheme;
    window.localStorage.setItem(storageKey, nextTheme);
    window.dispatchEvent(new Event(themeChangedEvent));
  }

  const isLight = theme === "light";
  return (
    <button className="theme-toggle" type="button" onClick={toggleTheme} aria-pressed={isLight} aria-label={isLight ? t("darkMode") : t("lightMode")}>
      <span aria-hidden="true">{isLight ? "☾" : "☼"}</span>
      <span>{isLight ? t("dark") : t("light")}</span>
    </button>
  );
}
