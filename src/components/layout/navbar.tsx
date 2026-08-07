"use client";

import Link from "next/link";
import { useState } from "react";
import { CloseIcon, MenuIcon, SearchIcon } from "@/components/icons";
import { NotificationCenter } from "@/components/layout/notification-center";
import { SearchModal } from "@/components/layout/search-modal";
import { ThemeToggle } from "@/components/theme-toggle";
import { UserMenu } from "@/components/layout/user-menu";
import { cn } from "@/lib/utils/cn";

export interface NavUser {
  id: string;
  name: string | null;
  email: string | null;
  image: string | null;
  role: string;
}

const LINKS = [
  { href: "/projects", label: "Projects" },
  { href: "/store", label: "Store" },
  { href: "/about", label: "About" },
  { href: "/community", label: "Membership" },
];

function openChatWidget() {
  window.dispatchEvent(new CustomEvent("nightbeam:open-chat"));
}

export function Navbar({ user, chatbotEnabled }: { user: NavUser | null; chatbotEnabled?: boolean }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-night-600/50 bg-night-950/85 backdrop-blur">
      <nav aria-label="Main" className="mx-auto flex h-16 max-w-7xl items-center gap-3 px-4 sm:px-6">
        <Link href="/" className="group flex items-center gap-2.5" aria-label="NightBeam Studio home">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/nb-logo.png" alt="" className="h-9 w-9 rounded-md object-contain" />
          <span className="font-pixel text-sm text-white group-hover:text-pixel-cyan">NIGHTBEAM</span>
        </Link>

        <div className="ml-6 hidden items-center gap-1 md:flex">
          {LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-md px-3 py-2 text-sm font-medium text-slate-300 hover:bg-night-800 hover:text-white"
            >
              {link.label}
            </Link>
          ))}
          {chatbotEnabled ? (
            <button
              type="button"
              onClick={openChatWidget}
              className="flex items-center gap-1.5 rounded-md px-3 py-2 text-sm font-medium text-slate-300 hover:bg-night-800 hover:text-white"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4" aria-hidden>
                <path d="M12 3c-4.5 0-8 2.9-8 6.5 0 1.9 1 3.6 2.6 4.8L6 19l3.4-2c.8.2 1.7.3 2.6.3 4.5 0 8-2.9 8-6.5S16.5 3 12 3Z" />
              </svg>
              Chat
            </button>
          ) : null}
        </div>

        <div className="ml-auto flex items-center gap-2">
          <ThemeToggle />
          <button
            type="button"
            onClick={() => setSearchOpen(true)}
            className="group flex h-10 min-w-0 items-center gap-2 rounded-lg border border-night-500/60 bg-night-900/80 px-3 text-sm text-slate-400 shadow-[inset_0_1px_0_rgb(255_255_255/0.06)] transition-colors hover:border-pixel-cyan/60 hover:bg-night-800 hover:text-white focus-visible:border-pixel-cyan/70"
            aria-label="Search projects"
          >
            <SearchIcon className="shrink-0 text-slate-500 group-hover:text-pixel-cyan" />
            <span className="hidden truncate sm:inline">Search projects</span>
            <kbd className="hidden rounded border border-night-500/60 bg-night-950 px-1.5 py-0.5 text-[10px] text-slate-500 md:inline">
              /
            </kbd>
          </button>

          {user ? (
            <>
              <NotificationCenter userId={user.id} />
              <UserMenu user={user} />
            </>
          ) : (
            <div className="hidden items-center gap-2 sm:flex">
              <Link
                href="/auth/login"
                className="rounded-md px-3 py-2 text-sm font-medium text-slate-300 hover:bg-night-800 hover:text-white"
              >
                Sign in
              </Link>
              <Link
                href="/auth/register"
                className="inline-flex h-8 items-center rounded-md bg-gradient-to-r from-purple-600 to-blue-600 px-3 text-sm font-medium text-white shadow-[0_0_18px_rgb(255_255_255/0.2)] hover:from-purple-500 hover:to-blue-500"
              >
                Join
              </Link>
            </div>
          )}

          <button
            type="button"
            className="rounded-md p-2 text-slate-300 hover:bg-night-800 md:hidden"
            onClick={() => setMobileOpen((open) => !open)}
            aria-expanded={mobileOpen}
            aria-label="Toggle navigation menu"
          >
            {mobileOpen ? <CloseIcon /> : <MenuIcon />}
          </button>
        </div>
      </nav>

      <div
        className={cn(
          "overflow-hidden border-t border-night-600/50 transition-[max-height] duration-200 md:hidden",
          mobileOpen ? "max-h-80" : "max-h-0 border-t-0",
        )}
      >
        <div className="space-y-1 px-4 py-3">
          {LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMobileOpen(false)}
              className="block rounded-md px-3 py-2 text-sm font-medium text-slate-300 hover:bg-night-800 hover:text-white"
            >
              {link.label}
            </Link>
          ))}
          {chatbotEnabled ? (
            <button
              type="button"
              onClick={() => {
                setMobileOpen(false);
                openChatWidget();
              }}
              className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm font-medium text-slate-300 hover:bg-night-800 hover:text-white"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4" aria-hidden>
                <path d="M12 3c-4.5 0-8 2.9-8 6.5 0 1.9 1 3.6 2.6 4.8L6 19l3.4-2c.8.2 1.7.3 2.6.3 4.5 0 8-2.9 8-6.5S16.5 3 12 3Z" />
              </svg>
              Chat
            </button>
          ) : null}
          {!user ? (
            <div className="flex gap-2 pt-2">
              <Link href="/auth/login" className="flex-1 rounded-md border border-night-500/60 bg-night-900 px-3 py-2 text-center text-sm text-slate-200">
                Sign in
              </Link>
              <Link href="/auth/register" className="flex-1 rounded-md bg-gradient-to-r from-purple-600 to-blue-600 px-3 py-2 text-center text-sm font-medium text-white">
                Join
              </Link>
            </div>
          ) : null}
        </div>
      </div>

      </header>

      <SearchModal open={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}
