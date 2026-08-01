"use client";

import { useEffect, useRef } from "react";
import { publicConfig } from "@/lib/public-config";

declare global {
  interface Window {
    turnstile?: {
      render: (element: HTMLElement, options: { sitekey: string; callback: (token: string) => void; "expired-callback"?: () => void }) => string;
    };
  }
}

export function Turnstile({ onToken, onExpire }: { onToken: (token: string) => void; onExpire?: () => void }) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!publicConfig.turnstileSiteKey || !containerRef.current) return;
    let rendered = false;
    function render() {
      if (!rendered && window.turnstile && containerRef.current) {
        rendered = true;
        window.turnstile.render(containerRef.current, {
          sitekey: publicConfig.turnstileSiteKey,
          callback: onToken,
          "expired-callback": onExpire,
        });
      }
    }
    if (window.turnstile) {
      render();
      return;
    }
    const script = document.createElement("script");
    script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js";
    script.async = true;
    script.onload = render;
    document.head.appendChild(script);
    return () => {
      script.remove();
    };
  }, [onToken, onExpire]);

  if (!publicConfig.turnstileSiteKey) return null;
  return (
    <div className="mb-4">
      <div ref={containerRef} className="turnstile-widget" />
    </div>
  );
}
