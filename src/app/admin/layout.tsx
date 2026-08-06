import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth/guards";
import { hasPermission } from "@/lib/auth/permissions";
import { noIndexRobots } from "@/lib/seo/site";
import { cn } from "@/lib/utils/cn";

export const metadata: Metadata = { robots: noIndexRobots };

const LINKS = [
  { href: "/admin", label: "Overview" },
  { href: "/admin/users", label: "Users & roles" },
  { href: "/admin/projects", label: "Projects & overrides" },
  { href: "/admin/sections", label: "Homepage & socials" },
  { href: "/admin/announcements", label: "Announcements" },
  { href: "/admin/sync", label: "Sync & cache" },
  { href: "/admin/analytics", label: "Analytics" },
  { href: "/admin/errors", label: "API errors" },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser();
  if (!user) redirect("/auth/login?callbackUrl=%2Fadmin");
  if (!hasPermission(user.role, "analytics.view")) redirect("/dashboard");

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <div className="mb-8">
        <h1 className="font-pixel text-lg text-pixel-purple text-glow-purple">ADMIN</h1>
        <p className="mt-2 text-sm text-slate-400">Signed in as {user.name ?? user.email} ({user.role}).</p>
      </div>
      <div className="flex flex-col gap-8 lg:flex-row">
        <aside className="lg:w-56">
          <nav aria-label="Admin" className="pixel-panel rounded-xl p-3">
            {LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "block rounded-md px-3 py-2 text-sm text-slate-400 hover:bg-night-800 hover:text-white",
                  link.href === "/admin" && "text-pixel-purple",
                )}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </aside>
        <div className="min-w-0 flex-1">{children}</div>
      </div>
    </div>
  );
}
