import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { ChatWidget } from "@/components/chat/chat-widget";
import { CookieConsent } from "@/components/layout/cookie-consent";
import { Footer } from "@/components/layout/footer";
import { Navbar } from "@/components/layout/navbar";
import { Providers } from "@/components/providers";
import { auth } from "@/lib/auth/auth";
import { getServerEnv, isChatbotEnabled } from "@/lib/config/env";
import "./globals.css";

const minecraft = localFont({
  src: [
    { path: "../assets/fonts/Monocraft.ttf", weight: "400", style: "normal" },
    { path: "../assets/fonts/Monocraft-Bold.ttf", weight: "700", style: "normal" },
  ],
  variable: "--font-minecraft",
  display: "swap",
});

const siteUrl = process.env.APP_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "NightBeam Studio — Game Mods & Worlds",
    template: "%s · NightBeam Studio",
  },
  description:
    "NightBeam Studio crafts story-driven Minecraft mods and worlds. Explore projects, documentation, and membership.",
  keywords: ["NightBeam Studio", "Minecraft mods", "NeoForge", "Fabric", "Minecraft worlds"],
  openGraph: {
    type: "website",
    url: siteUrl,
    siteName: "NightBeam Studio",
    title: "NightBeam Studio — Game Mods & Worlds",
    description: "Story-driven Minecraft mods and worlds by NightBeam Studio.",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "NightBeam Studio",
    description: "Story-driven Minecraft mods and worlds by NightBeam Studio.",
  },
  robots: { index: true, follow: true },
  alternates: { canonical: siteUrl },
  verification: process.env.GOOGLE_SITE_VERIFICATION
    ? { google: process.env.GOOGLE_SITE_VERIFICATION }
    : undefined,
};

export const viewport: Viewport = {
  themeColor: "#05070f",
  colorScheme: "dark",
};

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const session = await auth();
  const env = getServerEnv();
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": `${siteUrl}/#org`,
        name: env.APP_NAME,
        url: siteUrl,
        description: "Story-driven Minecraft mods and worlds.",
      },
      {
        "@type": "WebSite",
        "@id": `${siteUrl}/#website`,
        url: siteUrl,
        name: env.APP_NAME,
        publisher: { "@id": `${siteUrl}/#org` },
      },
    ],
  };

  const user = session?.user
    ? {
        id: session.user.id,
        name: session.user.name ?? null,
        email: session.user.email ?? null,
        image: session.user.image ?? null,
        role: session.user.role ?? "USER",
      }
    : null;

  return (
    <html lang="en" data-scroll-behavior="smooth" className={minecraft.variable}>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `try{if(localStorage.getItem("nba-theme")==="light"){document.documentElement.classList.add("light");document.querySelector("meta[name=theme-color]")?.setAttribute("content","#f7f7f8")}}catch(e){}`,
          }}
        />
      </head>
      <body className="min-h-screen bg-night-950 text-slate-200">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
        <a
          href="#main-content"
          className="sr-only z-[100] rounded-md bg-pixel-cyan px-4 py-2 font-semibold text-night-950 focus:not-sr-only focus:fixed focus:left-4 focus:top-4"
        >
          Skip to content
        </a>
        <Providers session={user}>
          <Navbar user={user} chatbotEnabled={isChatbotEnabled()} />
          <main id="main-content" tabIndex={-1}>{children}</main>
          <Footer />
          <CookieConsent />
          {isChatbotEnabled() ? <ChatWidget user={user} /> : null}
        </Providers>
      </body>
    </html>
  );
}
