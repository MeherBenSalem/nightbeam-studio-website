import Link from "next/link";
import { Card, CardBody } from "@/components/ui/card";
import { PixelHeading } from "@/components/ui/pixel-heading";
import { requireUser } from "@/lib/auth/guards";
import { getRepo } from "@/lib/db/repo";

export default async function DashboardOverview() {
  const user = await requireUser();
  if (!user) return null;
  const repo = await getRepo();
  const [favorites, follows, unread, recent] = await Promise.all([
    repo.listFavorites(user.id),
    repo.listFollows(user.id),
    repo.getUnreadCount(user.id),
    repo.listRecentlyViewed(user.id),
  ]);

  const stats = [
    { label: "Favorites", value: favorites.length, href: "/dashboard/favorites" },
    { label: "Following", value: follows.length, href: "/dashboard/follows" },
    { label: "Unread", value: unread, href: "/dashboard/notifications" },
    { label: "Viewed", value: recent.length, href: "/dashboard/history" },
  ];

  return (
    <div>
      <PixelHeading as="h1">Dashboard</PixelHeading>
      <p className="mt-2 text-sm text-slate-400">Welcome back, {user.name ?? "player"}.</p>
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Link key={stat.label} href={stat.href} className="pixel-panel rounded-xl p-5 transition-colors hover:border-pixel-cyan/60">
            <div className="font-pixel text-2xl text-pixel-cyan">{stat.value}</div>
            <div className="mt-2 text-xs uppercase tracking-widest text-slate-400">{stat.label}</div>
          </Link>
        ))}
      </div>
      {recent.length > 0 ? (
        <Card className="mt-8">
          <CardBody>
            <h2 className="font-semibold text-white">Recently viewed</h2>
            <ul className="mt-3 space-y-2">
              {recent.slice(0, 5).map((project) => (
                <li key={project.id}>
                  <Link href={`/projects/${project.slug}`} className="text-sm text-slate-300 hover:text-pixel-cyan">
                    {project.name}
                  </Link>
                </li>
              ))}
            </ul>
          </CardBody>
        </Card>
      ) : null}
    </div>
  );
}
