/**
 * Kleurenthema's voor de app.
 * Primary is HSL zonder hsl() — past bij CSS-variabelen in index.css.
 */
export type ThemeId = "teal" | "blue" | "emerald" | "indigo" | "rose" | "slate";

export interface ThemePreset {
  id: ThemeId;
  label: string;
  /** Hex voor PWA theme-color / preview swatches */
  hex: string;
  /** HSL components: "H S% L%" for --primary */
  primaryHsl: string;
  primaryForegroundHsl: string;
  accentHsl: string;
  accentForegroundHsl: string;
  ringHsl: string;
}

export const THEME_PRESETS: ThemePreset[] = [
  {
    id: "teal",
    label: "Teal",
    hex: "#0d9488",
    primaryHsl: "173 58% 39%",
    primaryForegroundHsl: "0 0% 100%",
    accentHsl: "173 50% 94%",
    accentForegroundHsl: "173 58% 30%",
    ringHsl: "173 58% 39%",
  },
  {
    id: "blue",
    label: "Blauw",
    hex: "#2563eb",
    primaryHsl: "217 91% 53%",
    primaryForegroundHsl: "0 0% 100%",
    accentHsl: "214 95% 93%",
    accentForegroundHsl: "217 91% 40%",
    ringHsl: "217 91% 53%",
  },
  {
    id: "emerald",
    label: "Smaragd",
    hex: "#059669",
    primaryHsl: "160 84% 30%",
    primaryForegroundHsl: "0 0% 100%",
    accentHsl: "152 76% 94%",
    accentForegroundHsl: "160 84% 25%",
    ringHsl: "160 84% 30%",
  },
  {
    id: "indigo",
    label: "Indigo",
    hex: "#4f46e5",
    primaryHsl: "239 84% 57%",
    primaryForegroundHsl: "0 0% 100%",
    accentHsl: "226 100% 95%",
    accentForegroundHsl: "239 84% 45%",
    ringHsl: "239 84% 57%",
  },
  {
    id: "rose",
    label: "Rose",
    hex: "#e11d48",
    primaryHsl: "347 77% 50%",
    primaryForegroundHsl: "0 0% 100%",
    accentHsl: "356 100% 95%",
    accentForegroundHsl: "347 77% 40%",
    ringHsl: "347 77% 50%",
  },
  {
    id: "slate",
    label: "Slate",
    hex: "#475569",
    primaryHsl: "215 19% 35%",
    primaryForegroundHsl: "0 0% 100%",
    accentHsl: "210 20% 96%",
    accentForegroundHsl: "215 19% 25%",
    ringHsl: "215 19% 35%",
  },
];

export function getTheme(id: ThemeId | string | undefined): ThemePreset {
  return THEME_PRESETS.find((t) => t.id === id) ?? THEME_PRESETS[0];
}

export function applyThemeToDocument(theme: ThemePreset) {
  const root = document.documentElement;
  root.style.setProperty("--primary", theme.primaryHsl);
  root.style.setProperty("--primary-foreground", theme.primaryForegroundHsl);
  root.style.setProperty("--accent", theme.accentHsl);
  root.style.setProperty("--accent-foreground", theme.accentForegroundHsl);
  root.style.setProperty("--ring", theme.ringHsl);
  root.style.setProperty("--brand", theme.hex);

  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.setAttribute("content", theme.hex);
}
