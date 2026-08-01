import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";

export const alt = "NightBeam Studio — The Birth of Steve";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OgImage() {
  const fontData = await readFile(join(process.cwd(), "src/assets/fonts/Monocraft.ttf"));
  const logoData = await readFile(join(process.cwd(), "public/nb-logo.png"));
  const logoSrc = `data:image/png;base64,${logoData.toString("base64")}`;
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: 72,
          background: "linear-gradient(135deg, #000000 0%, #0a0a0a 45%, #141414 70%, #000000 100%)",
          color: "#e2e8f0",
          fontFamily: "Monocraft",
          position: "relative",
        }}
      >
        <div style={{ display: "flex", gap: 16, alignItems: "center", marginBottom: 48 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={logoSrc} alt="" width={56} height={56} style={{ borderRadius: 12, objectFit: "contain" }} />
          <div style={{ fontSize: 28, letterSpacing: 4, color: "#ffffff" }}>NIGHTBEAM STUDIO</div>
        </div>
        <div style={{ fontSize: 58, lineHeight: 1.3, color: "#ffffff", display: "flex", flexDirection: "column" }}>
          <span>THE BIRTH OF</span>
          <span style={{ background: "linear-gradient(90deg, #ffffff, #d4d4d4, #8a8a8a)", backgroundClip: "text", color: "transparent" }}>
            STEVE
          </span>
        </div>
        <div style={{ marginTop: 40, fontSize: 20, color: "#94a3b8", lineHeight: 1.6 }}>
          A story-driven Minecraft mod by Mahou · v0.4.0 · NeoForge + Fabric · MC 26.1.2 / 26.2
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [{ name: "Monocraft", data: fontData, weight: 400 }],
    },
  );
}
