import Link from "next/link";
import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth/guards";
import { cn } from "@/lib/utils/cn";

const LINKS = [
  { href: "/dashboard", label: "Overview" },
  { href: "/dashboard/favorites", label: "Favorites" },
  { href: "/dashboard/follows", label: "Following" },
  { href: "/dashboard/history", label: "Recently viewed" },
  { href: "/dashboard/downloads", label: "Downloads" },
  { href: "/dashboard/notifications", label: "Notifications" },
  { href: "/dashboard/settings", label: "Settings" },
];

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser();
  if (!user) redirect("/auth/login?callbackUrl=%2Fdashboard");

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <div className="flex flex-col gap-8 lg:flex-row">
        <aside className="lg:w-56">
          <div className="pixel-panel rounded-xl p-4">
            <div className="flex items-center gap-3">
              <span className="grid h-10 w-10 place-items-center rounded-full bg-gradient-to-br from-purple-600 to-cyan-500 font-pixel text-xs text-white">
                {(user.name ?? "U").slice(0, 1).toUpperCase()}
              </span>
              <div className="min-w-0">
                <div className="truncate text-sm font-semibold text-white">{user.name ?? "Player"}</div>
                <div className="truncate text-xs text-slate-500">{user.email}</div>
              </div>
            </div>
            <nav aria-label="Dashboard" className="mt-4 space-y-0.5">
              {LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "block rounded-md px-3 py-2 text-sm text-slate-400 hover:bg-night-800 hover:text-white",
                    link.href === "/dashboard" && "text-pixel-cyan",
                  )}
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>
        </aside>
        <div className="min-w-0 flex-1">{children}</div>
      </div>
    </div>
  );
}
