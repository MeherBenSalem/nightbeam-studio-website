import { requirePermission } from "@/lib/auth/guards";
import { getRepo } from "@/lib/db/repo";
import { HomepageVideoForm, SectionForm, SocialForm } from "@/components/admin/section-forms";

export default async function AdminSectionsPage() {
  const user = await requirePermission("sections.manage");
  if (!user) return null;
  const repo = await getRepo();
  const [sections, socials] = await Promise.all([repo.listAllSections(), repo.listAllSocials()]);

  return (
    <div className="space-y-8">
      <div>
        <h2 className="font-semibold text-white">Homepage sections</h2>
        <p className="mt-2 text-sm text-slate-400">Toggle sections and edit their titles.</p>
        <div className="mt-4">
          <HomepageVideoForm section={sections.find((section) => section.key === "hero") ?? null} />
        </div>
        <div className="mt-4 space-y-4">
          {sections.map((section) => (
            <SectionForm key={section.key} section={section} />
          ))}
        </div>
      </div>
      <div>
        <h2 className="font-semibold text-white">Social links</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          {socials.map((social) => (
            <SocialForm key={social.platform} social={social} />
          ))}
        </div>
      </div>
    </div>
  );
}
