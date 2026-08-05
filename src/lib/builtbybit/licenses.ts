import "server-only";
import { getCreatorLicenses } from "@/lib/builtbybit/client";

export async function getLicensedResourceIds(buyerId: string | number): Promise<Set<number>> {
  const numericId = typeof buyerId === "string" ? Number(buyerId) : buyerId;
  if (!Number.isFinite(numericId)) return new Set();

  try {
    const licenses = await getCreatorLicenses({ buyerIds: [numericId] });
    const ids = new Set<number>();
    for (const license of licenses) {
      if (license.content_type && license.content_type !== "resource") continue;
      const id = license.resource_id ?? license.content_id;
      if (typeof id === "number" && Number.isFinite(id)) ids.add(id);
    }
    return ids;
  } catch {
    return new Set();
  }
}
