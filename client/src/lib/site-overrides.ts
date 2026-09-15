import { siteDefaults, type SiteConfig, type UserPrefs } from "@/config/site";
import { applyThemeToDocument, getTheme } from "@/config/themes";

const STORAGE_KEY = "ane_kortrijk_user_prefs";

export function loadUserPrefs(): UserPrefs {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    return sanitizePrefs(JSON.parse(raw) as Record<string, unknown>);
  } catch {
    return {};
  }
}

function sanitizePrefs(raw: Record<string, unknown>): UserPrefs {
  const prefs: UserPrefs = {};
  if (typeof raw.themeId === "string") prefs.themeId = raw.themeId as UserPrefs["themeId"];
  if (raw.modules && typeof raw.modules === "object") {
    prefs.modules = raw.modules as UserPrefs["modules"];
  }
  return prefs;
}

export function saveUserPrefs(prefs: UserPrefs) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(sanitizePrefs(prefs as Record<string, unknown>)));
}

export function clearUserPrefs() {
  localStorage.removeItem(STORAGE_KEY);
}

export function resolveSite(prefs: UserPrefs = loadUserPrefs()): SiteConfig {
  const merged: SiteConfig = {
    ...siteDefaults,
    academy: { ...siteDefaults.academy },
    spinalLogbook: { ...siteDefaults.spinalLogbook },
    externalHomeLink: { ...siteDefaults.externalHomeLink },
    modules: { ...siteDefaults.modules, ...prefs.modules },
    themeId: prefs.themeId ?? siteDefaults.themeId,
  };
  const theme = getTheme(merged.themeId);
  merged.themeColor = theme.hex;
  return merged;
}

export function applySiteChrome(config: SiteConfig) {
  applyThemeToDocument(getTheme(config.themeId));
}
