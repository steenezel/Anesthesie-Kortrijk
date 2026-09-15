/**
 * Branding AZ Groeninge Kortrijk (admin/deploy).
 * Eindgebruikers: enkel thema + modules via /settings.
 */
import type { ThemeId } from "./themes";

export interface SiteConfig {
  shortName: string;
  highlightName: string;
  appName: string;
  hospitalName: string;
  department: string;
  tagline: string;
  pwaShortName: string;
  pwaDescription: string;
  themeId: ThemeId;
  themeColor: string;
  authStorageKey: string;
  phonePrefix: string;
  academy: {
    name: string;
    acronym: string;
    bannerSrc: string;
  };
  spinalLogbook: {
    title: string;
    subtitle: string;
    description: string;
    href: string;
  };
  externalHomeLink: {
    enabled: boolean;
    title: string;
    description: string;
    href: string;
  };
  modules: {
    protocols: boolean;
    blocks: boolean;
    logbook: boolean;
    pocus: boolean;
    journal: boolean;
    calculators: boolean;
    contacts: boolean;
    onboarding: boolean;
    marketplace: boolean;
    spinalLogbook: boolean;
    games: boolean;
  };
}

export const siteDefaults: SiteConfig = {
  shortName: "ANE",
  highlightName: "Kortrijk",
  appName: "Anesthesie Kortrijk",
  hospitalName: "AZ Groeninge",
  department: "Anesthesie & Reanimatie",
  tagline: "Metiri est Scire",
  pwaShortName: "Ane Kortrijk",
  pwaDescription: "Clinical Decision Support voor AZ Groeninge",
  themeId: "teal",
  themeColor: "#0d9488",
  authStorageKey: "ane_kortrijk_auth",
  phonePrefix: "+325663",
  academy: {
    name: "Kortrijk Academy for Regional Anesthesia",
    acronym: "KARA",
    bannerSrc: "/images/blocks/kara-banner.png",
  },
  spinalLogbook: {
    title: "SMASH",
    subtitle: "Scandicaine versus Marcaine: Anesthesia Spinal Hip",
    description:
      "Scandicaine versus Marcaine: Anesthesia Spinal Hip — registreer na THP of scandicaine een valabel alternatief is voor isobare marcaine.",
    href: "/smash",
  },
  externalHomeLink: {
    enabled: true,
    title: "E17 Bridginglink",
    description: "Beleid bloedverdunners.",
    href: "https://e17bridginglinkbloedverdunners.be/",
  },
  modules: {
    protocols: true,
    blocks: true,
    logbook: true,
    pocus: true,
    journal: true,
    calculators: true,
    contacts: true,
    onboarding: true,
    marketplace: true,
    spinalLogbook: true,
    games: true,
  },
};

export const site = siteDefaults;

export type UserPrefs = Partial<{
  themeId: ThemeId;
  modules: Partial<SiteConfig["modules"]>;
}>;
