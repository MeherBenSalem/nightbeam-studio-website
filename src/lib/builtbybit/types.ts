// Minimal typed views of the BuiltByBit API v2 payloads we consume.

export interface BbbPrice {
  value: number;
  currency: string;
  formatted?: string;
}

export interface BbbCategory {
  category_id?: number;
  id?: number;
  name?: string;
  title?: string;
}

export interface BbbLatestVersion {
  version_id?: number;
  version?: string;
  version_string?: string;
  name?: string;
  release_date?: string | number;
  created_at?: string | number;
  download_count?: number;
}

export interface BbbDescription {
  html?: string;
  bbcode?: string;
}

export interface BbbResource {
  resource_id: number;
  title: string;
  summary: string;
  url: string;
  creator_id: number;
  download_count: number;
  purchase_count: number;
  cover_image_url?: string | null;
  carousel_image_urls?: string[];
  review_average?: number;
  review_count?: number;
  ListPrice?: BbbPrice;
  FinalPrice?: BbbPrice;
  category_id?: number;
  published_at?: string | number;
  last_updated_at?: string | number;
  Category?: BbbCategory;
  LatestVersion?: BbbLatestVersion;
  Description?: BbbDescription;
}

export interface BbbVersion {
  version_id: number;
  resource_id: number;
  version?: string;
  version_string?: string;
  download_count?: number;
  release_date?: string | number;
  created_at?: string | number;
  review_average?: number;
  review_count?: number;
}

export interface BbbLicense {
  license_id?: number;
  content_type?: string;
  content_id?: number;
  resource_id?: number;
  buyer_id?: number;
  purchase_date?: string | number;
  permanent?: boolean;
  active?: boolean;
}

export interface BbbStore {
  store_id: number;
  user_id?: number;
  name?: string;
  summary?: string;
  is_default?: boolean;
  created_at?: number;
  url?: string;
}

export interface BbbMemberSelf {
  user_id: number | string;
  username: string;
  avatar_url?: string | null;
}

export interface BbbListStats {
  total: number;
  page: number;
  per_page: number;
  max_page: number;
}

export interface BbbListEnvelope<T> {
  result?: string;
  data?: {
    resources?: T[];
    versions?: T[];
    licenses?: T[];
    stores?: T[];
    stats?: BbbListStats;
  } & Record<string, unknown>;
}
