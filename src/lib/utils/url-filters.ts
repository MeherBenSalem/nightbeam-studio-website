import type { Loader, ProjectFilters, ProjectType } from "@/lib/db/types";

export const PROJECT_TYPES: ProjectType[] = ["MOD", "MODPACK", "PLUGIN", "DATAPACK", "RESOURCEPACK", "SHADER", "TOOL"];
export const LOADERS: Loader[] = ["NEOFORGE", "FABRIC", "FORGE", "QUILT", "SPIGOT", "PAPER", "VELOCITY", "VANILLA"];
export const MC_VERSIONS = ["26.2", "26.1.2", "26.1", "26.0", "25.12", "25.11"];
export const SORTS = [
  { value: "downloads", label: "Most downloaded" },
  { value: "followers", label: "Most followed" },
  { value: "views", label: "Most viewed" },
  { value: "updated", label: "Recently updated" },
  { value: "newest", label: "Newest" },
  { value: "name", label: "Name A–Z" },
] as const;

export const SORT_VALUES = SORTS.map((s) => s.value);

const SINGLE = new Set<keyof ProjectFilters>(["type", "version", "loader", "platform", "category", "search", "sort", "view", "page", "perPage"]);

export function parseFilterParams(params: URLSearchParams): ProjectFilters {
  const filters: ProjectFilters = { page: 1, perPage: 12, view: "grid" };
  for (const [key, value] of params.entries()) {
    if (!value) continue;
    if (SINGLE.has(key as keyof ProjectFilters)) {
      const k = key as keyof ProjectFilters;
      if (k === "page") filters.page = Math.max(1, parseInt(value, 10) || 1);
      else if (k === "perPage") filters.perPage = Math.min(48, Math.max(6, parseInt(value, 10) || 12));
      else if (k === "sort" && SORT_VALUES.includes(value as (typeof SORT_VALUES)[number])) {
        filters.sort = value as ProjectFilters["sort"];
      } else if (k === "view" && (value === "grid" || value === "list")) filters.view = value;
      else if (k === "type" && PROJECT_TYPES.includes(value as ProjectType)) filters.type = value as ProjectType;
      else if (k === "loader" && LOADERS.includes(value as Loader)) filters.loader = value as Loader;
      else if (k === "version") filters.version = value;
      else if (k === "platform") filters.platform = value;
      else if (k === "category") filters.category = value;
      else if (k === "search") filters.search = value.slice(0, 120);
    }
  }
  return filters;
}

export function serializeFilterParams(filters: ProjectFilters): string {
  const params = new URLSearchParams();
  const entries: Array<[keyof ProjectFilters, string | number | undefined]> = [
    ["type", filters.type],
    ["version", filters.version],
    ["loader", filters.loader],
    ["platform", filters.platform],
    ["category", filters.category],
    ["search", filters.search],
    ["sort", filters.sort],
    ["view", filters.view],
    ["page", filters.page && filters.page > 1 ? filters.page : undefined],
  ];
  for (const [key, value] of entries) {
    if (value !== undefined && value !== "" && value !== "grid") params.set(key, String(value));
  }
  const serialized = params.toString();
  return serialized ? `?${serialized}` : "";
}
