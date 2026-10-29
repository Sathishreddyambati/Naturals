import { getHomepageSettings } from "@/lib/data/settings";
import HomepageSettingsForm from "@/components/admin/HomepageSettingsForm";

export const dynamic = "force-dynamic";

export default async function AdminSettingsPage() {
  const settings = await getHomepageSettings();
  return (
    <div>
      <h1 className="font-display text-2xl font-semibold text-white">Homepage Content</h1>
      <p className="mt-1 text-sm text-white/50">Edit the hero section and announcement bar shown on the storefront.</p>
      <div className="mt-8">
        <HomepageSettingsForm initial={settings} />
      </div>
    </div>
  );
}
