import type { MetadataRoute } from "next";
import { getRepo } from "@/lib/db/repo";
import type { ProjectSummary, StoreProductSummary } from "@/lib/db/types";
import { absoluteUrl, getSiteUrl } from "@/lib/seo/site";

const PAGE_SIZE = 100;

async function listAllProjects(repo: Awaited<ReturnType<typeof getRepo>>): Promise<ProjectSummary[]> {
  const items: ProjectSummary[] = [];
  let page = 1;
  for (;;) {
    const result = await repo.listProjects({ perPage: PAGE_SIZE, page });
    items.push(...result.items);
    if (page >= result.totalPages) break;
    page += 1;
  }
  return items;
}

async function listAllStoreProducts(repo: Awaited<ReturnType<typeof getRepo>>): Promise<StoreProductSummary[]> {
  const items: StoreProductSummary[] = [];
  let page = 1;
  for (;;) {
    const result = await repo.listStoreProducts({ perPage: PAGE_SIZE, page });
    items.push(...result.items);
    if (page >= result.totalPages) break;
    page += 1;
  }
  return items;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const repo = await getRepo();
  const [projects, store] = await Promise.all([listAllProjects(repo), listAllStoreProducts(repo)]);
  const today = new Date();

  return [
    { url: getSiteUrl(), lastModified: today, changeFrequency: "weekly", priority: 1 },
    { url: absoluteUrl("/projects"), lastModified: today, changeFrequency: "daily", priority: 0.9 },
    { url: absoluteUrl("/store"), lastModified: today, changeFrequency: "daily", priority: 0.9 },
    { url: absoluteUrl("/docs"), lastModified: today, changeFrequency: "weekly", priority: 0.6 },
    { url: absoluteUrl("/docs/privacy"), lastModified: today, changeFrequency: "monthly", priority: 0.5 },
    { url: absoluteUrl("/about"), lastModified: today, changeFrequency: "monthly", priority: 0.5 },
    { url: absoluteUrl("/community"), lastModified: today, changeFrequency: "weekly", priority: 0.6 },
    ...projects.map((project) => ({
      url: absoluteUrl(`/projects/${project.slug}`),
      lastModified: project.updatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
    ...store.map((product) => ({
      url: absoluteUrl(`/store/${product.slug}`),
      lastModified: product.updatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
  ];
}
