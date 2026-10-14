// Every ComputerSteps website, and how its pages are named for exercises.
// Exercises refer to page ids like "energy.bills.history", never to buttons or layouts,
// so a page can be redesigned without touching the exercise library.

export type SiteId = "bank" | "shop" | "gp" | "energy" | "council" | "mobile" | "deliveries" | "travel";

export type Site = { id: SiteId; name: string; href: string; bases: string[] };

export const SITES: Site[] = [
  { id: "energy", name: "Westford Energy", href: "/scenarios/energy/", bases: ["/scenarios/energy"] },
  { id: "bank", name: "Practice Bank", href: "/scenarios/practice-bank/", bases: ["/scenarios/practice-bank"] },
  { id: "shop", name: "Practice Shop", href: "/shop/", bases: ["/shop", "/basket", "/checkout"] },
  { id: "gp", name: "Yama Clinic", href: "/scenarios/gp-surgery/", bases: ["/scenarios/gp-surgery"] },
  { id: "council", name: "Westford Council", href: "/scenarios/council/", bases: ["/scenarios/council"] },
  { id: "mobile", name: "Westford Mobile", href: "/scenarios/mobile/", bases: ["/scenarios/mobile"] },
  { id: "deliveries", name: "Westford Deliveries", href: "/scenarios/deliveries/", bases: ["/scenarios/deliveries"] },
  { id: "travel", name: "Westford Travel", href: "/scenarios/travel/", bases: ["/scenarios/travel"] },
];

export function getSite(id: string): Site | undefined {
  return SITES.find((site) => site.id === id);
}

/** "/scenarios/energy/help/direct-debit/" becomes "energy.help.direct-debit". Pages outside the sites give null. */
export function pageIdFor(pathname: string): string | null {
  const path = pathname.replace(/\/+$/, "") || "/";
  for (const site of SITES) {
    for (const base of site.bases) {
      if (path !== base && !path.startsWith(`${base}/`)) continue;
      const rest = path.slice(base.length).split("/").filter(Boolean);
      // The shop's basket and checkout live outside /shop, so their own name is kept.
      const prefix = base === site.bases[0] ? [] : [base.slice(1)];
      const parts = [...prefix, ...rest];
      return [site.id, ...(parts.length ? parts : ["home"])].join(".");
    }
  }
  return null;
}

/** "energy.help.*" matches any help page; anything else must match exactly. */
export function pageMatches(pageId: string, pattern: string): boolean {
  if (pattern.endsWith(".*")) return pageId.startsWith(pattern.slice(0, -1));
  return pageId === pattern;
}
