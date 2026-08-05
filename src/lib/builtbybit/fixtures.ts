import type { BbbResource, BbbVersion } from "@/lib/builtbybit/types";
import { mapBbbResourceToDetail } from "@/lib/builtbybit/mapper";

const FIXTURE_RESOURCES: BbbResource[] = [
  {
    resource_id: 71023,
    title: "RPG Attribute System",
    summary: "A deep RPG attribute and progression framework for Paper and Folia servers.",
    url: "https://builtbybit.com/resources/rpg-attribute-system.71023/",
    creator_id: 617578,
    download_count: 1240,
    purchase_count: 89,
    cover_image_url: "https://builtbybit.com/styles/default/xenforo/logo.png",
    carousel_image_urls: [],
    review_average: 4.8,
    review_count: 12,
    ListPrice: { value: 14.99, currency: "USD", formatted: "$14.99" },
    FinalPrice: { value: 14.99, currency: "USD", formatted: "$14.99" },
    category_id: 1,
    published_at: "2025-06-01T00:00:00Z",
    last_updated_at: "2026-01-15T00:00:00Z",
    Category: { category_id: 1, name: "Plugins" },
    LatestVersion: { version_id: 90001, version: "2.4.0", release_date: "2026-01-15T00:00:00Z", download_count: 320 },
    Description: { html: "<p>Fixture catalog entry for offline development.</p>" },
  },
  {
    resource_id: 68210,
    title: "NightBeam Lobby Setup",
    summary: "Production-ready lobby hub with NPCs, scoreboards, and queue routing.",
    url: "https://builtbybit.com/resources/nightbeam-lobby-setup.68210/",
    creator_id: 617578,
    download_count: 540,
    purchase_count: 34,
    cover_image_url: null,
    carousel_image_urls: [],
    review_average: 4.6,
    review_count: 7,
    ListPrice: { value: 9.99, currency: "USD", formatted: "$9.99" },
    FinalPrice: { value: 7.99, currency: "USD", formatted: "$7.99" },
    category_id: 4,
    published_at: "2025-09-10T00:00:00Z",
    last_updated_at: "2026-02-01T00:00:00Z",
    Category: { category_id: 4, name: "Setups" },
    LatestVersion: { version_id: 90002, version: "1.2.0", release_date: "2026-02-01T00:00:00Z" },
    Description: { html: "<p>Lobby setup fixture for memory-mode store browsing.</p>" },
  },
  {
    resource_id: 65001,
    title: "Starter Config Pack",
    summary: "Free starter configs for Paper servers — economy, permissions, and messages.",
    url: "https://builtbybit.com/resources/starter-config-pack.65001/",
    creator_id: 617578,
    download_count: 3200,
    purchase_count: 0,
    cover_image_url: null,
    carousel_image_urls: [],
    review_average: 4.2,
    review_count: 18,
    ListPrice: { value: 0, currency: "USD", formatted: "Free" },
    FinalPrice: { value: 0, currency: "USD", formatted: "Free" },
    category_id: 3,
    published_at: "2025-03-20T00:00:00Z",
    last_updated_at: "2025-12-01T00:00:00Z",
    Category: { category_id: 3, name: "Configs" },
    LatestVersion: { version_id: 90003, version: "1.0.0", release_date: "2025-12-01T00:00:00Z" },
    Description: { html: "<p>Free fixture product.</p>" },
  },
];

const FIXTURE_VERSIONS: BbbVersion[] = [
  { version_id: 90001, resource_id: 71023, version: "2.4.0", download_count: 320, release_date: "2026-01-15T00:00:00Z" },
  { version_id: 89990, resource_id: 71023, version: "2.3.1", download_count: 210, release_date: "2025-12-01T00:00:00Z" },
  { version_id: 90002, resource_id: 68210, version: "1.2.0", download_count: 88, release_date: "2026-02-01T00:00:00Z" },
  { version_id: 90003, resource_id: 65001, version: "1.0.0", download_count: 3200, release_date: "2025-12-01T00:00:00Z" },
];

export const BBB_FIXTURE_PRODUCTS = FIXTURE_RESOURCES.map((resource) =>
  mapBbbResourceToDetail(
    resource,
    FIXTURE_VERSIONS.filter((v) => v.resource_id === resource.resource_id),
  ),
);

export { FIXTURE_RESOURCES, FIXTURE_VERSIONS };
