import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "NightBeam Studio",
    short_name: "NightBeam",
    description: "Story-driven Minecraft mods and worlds by NightBeam Studio. Home of The Birth of Steve.",
    start_url: "/",
    display: "standalone",
    background_color: "#05070f",
    theme_color: "#05070f",
    icons: [
      { src: "/nb-logo.png", sizes: "512x512", type: "image/png" },
      { src: "/favicon.ico", sizes: "any", type: "image/x-icon" },
    ],
  };
}
