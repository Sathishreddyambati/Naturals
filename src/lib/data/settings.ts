import { db } from "@/db";
import { storeSettings } from "@/db/schema";
import { eq } from "drizzle-orm";

export type HomepageSettings = {
  heroHeadline: string;
  heroSubheadline: string;
  heroBadge: string;
  announcementBar: string;
};

export const DEFAULT_HOMEPAGE_SETTINGS: HomepageSettings = {
  heroHeadline: "Nature, Refined. Goodness, Unlocked.",
  heroSubheadline:
    "Single-ingredient powders crafted from real garlic, ginger, onion and tomato — dried and milled to lock in flavour, nothing else added.",
  heroBadge: "Introducing the Indira Naturals Collection",
  announcementBar: "Free shipping on prepaid orders above ₹999 across India",
};

export async function getHomepageSettings(): Promise<HomepageSettings> {
  const [row] = await db
    .select()
    .from(storeSettings)
    .where(eq(storeSettings.key, "homepage"));
  if (!row) return DEFAULT_HOMEPAGE_SETTINGS;
  return { ...DEFAULT_HOMEPAGE_SETTINGS, ...(row.value as Partial<HomepageSettings>) };
}

export async function setHomepageSettings(value: HomepageSettings) {
  await db
    .insert(storeSettings)
    .values({ key: "homepage", value, updatedAt: new Date() })
    .onConflictDoUpdate({
      target: storeSettings.key,
      set: { value, updatedAt: new Date() },
    });
}
