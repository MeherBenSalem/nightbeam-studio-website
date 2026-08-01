import Link from "next/link";
import { getDataBackendLabel, getRepo } from "@/lib/db/repo";
import { getServerEnv } from "@/lib/config/env";

export async function Footer() {
  const repo = await getRepo();
  const [socials, backend] = await Promise.all([repo.getSocialLinks(), getDataBackendLabel()]);
  const env = getServerEnv();

  return (
    <footer className="border-t border-night-600/50 bg-night-950">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        <div className="grid gap-10 md:grid-cols-4">
          <div className="md:col-span-2">
            <div className="flex items-center gap-2.5">
              <span className="grid h-8 w-8 place-items-center rounded-md bg-gradient-to-br from-purple-600 to-cyan-500 font-pixel text-xs text-white">
                NB
              </span>
              <span className="font-pixel text-sm text-white">NIGHTBEAM STUDIO</span>
            </div>
            <p className="mt-4 max-w-md text-sm text-slate-400">
              Story-driven Minecraft mods and worlds, crafted by Mahou. Home of <em>The Birth of Steve</em>.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              {socials.map((social) => (
                <a
                  key={social.platform}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-md border border-night-500/60 bg-night-900 px-3 py-1.5 text-xs text-slate-300 hover:border-pixel-cyan/60 hover:text-white"
                >
                  {social.label ?? social.platform}
                </a>
              ))}
            </div>
          </div>

          <nav aria-label="Footer">
            <h2 className="font-pixel text-xs text-pixel-cyan">SITE</h2>
            <ul className="mt-4 space-y-2 text-sm">
              <li><Link className="text-slate-400 hover:text-white" href="/projects">Projects</Link></li>
              <li><Link className="text-slate-400 hover:text-white" href="/docs">Documentation</Link></li>
              <li><Link className="text-slate-400 hover:text-white" href="/about">About</Link></li>
              <li><Link className="text-slate-400 hover:text-white" href="/community">Community</Link></li>
            </ul>
          </nav>

          <div>
            <h2 className="font-pixel text-xs text-pixel-cyan">ACCOUNT</h2>
            <ul className="mt-4 space-y-2 text-sm">
              <li><Link className="text-slate-400 hover:text-white" href="/auth/login">Sign in</Link></li>
              <li><Link className="text-slate-400 hover:text-white" href="/auth/register">Create account</Link></li>
              <li><Link className="text-slate-400 hover:text-white" href="/dashboard">Dashboard</Link></li>
              <li><Link className="text-slate-400 hover:text-white" href="/docs/privacy">Privacy</Link></li>
            </ul>
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-3 border-t border-night-600/40 pt-6 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} {env.APP_NAME}. All rights reserved.</p>
          <p className="flex items-center gap-2">
            <span aria-hidden className={`h-2 w-2 rounded-full ${backend === "postgres" ? "bg-pixel-green" : "bg-pixel-amber"}`} />
            data backend: {backend === "postgres" ? "PostgreSQL" : "seeded in-memory fallback"}
          </p>
        </div>
      </div>
    </footer>
  );
}
