import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "NightBeam Studio",
    short_name: "NightBeam",
    description:
      "Story-driven Minecraft mods and worlds by NightBeam Studio — home of The Birth of Steve. Explore projects, docs, and membership.",
    start_url: "/",
    display: "standalone",
    background_color: "#05070f",
    theme_color: "#05070f",
    icons: [
      { src: "/icon.png", sizes: "256x256", type: "image/png", purpose: "any" },
      { src: "/nb-logo.png", sizes: "512x512", type: "image/png", purpose: "any" },
    ],
  };
}
