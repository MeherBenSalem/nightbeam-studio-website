"use client";

import { useEffect, useRef } from "react";
import { trackEventClient } from "@/lib/analytics/client";

export function ViewTracker({ slug }: { slug: string }) {
  const tracked = useRef(false);
  useEffect(() => {
    if (tracked.current) return;
    tracked.current = true;
    trackEventClient("VIEW", { projectSlug: slug });
  }, [slug]);
  return null;
}
