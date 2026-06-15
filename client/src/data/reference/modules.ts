import type { ReferenceModuleCard } from "@/data/reference/types";

export const REFERENCE_MODULES: ReferenceModuleCard[] = [
  {
    id: "dermatomes",
    title: "Dermatomen",
    description: "Dermatoomverloop en klinische landmarks (C2–S5).",
    href: "/blocks/referentie/dermatomen",
    status: "available",
  },
  {
    id: "plexus",
    title: "Plexus-anatomie",
    description: "Brachiaal, cervicaal, lumbaal en sacraal plexus.",
    href: "/blocks/referentie/plexus",
    status: "available",
  },
  {
    id: "motor",
    title: "Motorische innervatie",
    description: "Myotomen, klinische testen en uitvalbeelden.",
    href: "/blocks/referentie/innervatie",
    status: "coming_soon",
  },
  {
    id: "nerve-atlas",
    title: "Zenuwatlas",
    description: "Regionale kaarten met volledige zenuwmonografieën.",
    href: "/blocks/referentie/regio",
    status: "coming_soon",
  },
];
