import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/state";
import { StoreCta } from "@/components/store/store-cta";
import { requireUser } from "@/lib/auth/guards";
import { getRepo } from "@/lib/db/repo";
import { formatDate, formatNumber } from "@/lib/utils/format";

export const revalidate = 60;

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const repo = await getRepo();
  const product = await repo.getStoreProductBySlug(slug);
  if (!product) return { title: "Product not found" };
  return {
    title: product.name,
    description: product.summary,
    openGraph: {
      title: `${product.name} — NightBeam Store`,
      description: product.summary,
      type: "website",
    },
  };
}

export default async function StoreProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const repo = await getRepo();
  const user = await requireUser();
  const product = await repo.getStoreProductBySlug(slug, user?.id);
  if (!product) notFound();

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <div className="flex flex-wrap items-start gap-6">
        {product.iconUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={product.iconUrl} alt="" className="h-20 w-20 rounded-xl border border-night-500/60 object-cover" />
        ) : (
          <div className="grid h-20 w-20 place-items-center rounded-xl border border-night-500/60 bg-gradient-to-br from-amber-600/40 via-night-800 to-cyan-500/30 font-pixel text-2xl text-white">
            {product.name.slice(0, 1)}
          </div>
        )}
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="font-pixel text-lg text-white sm:text-xl">{product.name.toUpperCase()}</h1>
            <Badge tone="amber">{product.categoryLabel ?? product.category}</Badge>
            {product.isOwned ? <Badge tone="green">Owned</Badge> : null}
            {product.isFree ? <Badge tone="green">Free</Badge> : null}
          </div>
          <p className="mt-2 max-w-2xl text-slate-400">{product.summary}</p>
          <div className="mt-3 flex flex-wrap gap-4 text-xs text-slate-500">
            <span>⬇ {formatNumber(product.downloads)} downloads</span>
            <span>★ {product.rating.toFixed(1)} ({formatNumber(product.reviewCount)} reviews)</span>
            <span>{formatNumber(product.purchases)} purchases</span>
          </div>
        </div>
        <StoreCta product={product} />
      </div>

      {product.bannerUrl ? (
        <div className="mt-8 overflow-hidden rounded-xl border border-night-500/40">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={product.bannerUrl} alt="" className="max-h-72 w-full object-cover" />
        </div>
      ) : null}

      <div className="mt-10 grid gap-8 lg:grid-cols-[2fr_1fr]">
        <section>
          <h2 className="font-pixel text-sm text-pixel-cyan">Description</h2>
          <div
            className="prose prose-invert mt-4 max-w-none text-sm text-slate-300 prose-p:leading-relaxed"
            dangerouslySetInnerHTML={{ __html: product.description }}
          />
        </section>

        <section>
          <h2 className="font-pixel text-sm text-pixel-cyan">Versions</h2>
          <div className="mt-4 space-y-4">
            {product.versions.length === 0 ? (
              <EmptyState title="No versions listed" body="Version history appears after sync from BuiltByBit." />
            ) : (
              product.versions.map((version) => (
                <Card key={version.id}>
                  <CardHeader>
                    <div>
                      <CardTitle>v{version.version}</CardTitle>
                      <p className="mt-1 text-xs text-slate-500">
                        {formatDate(version.releaseDate)} · {formatNumber(version.downloadCount)} downloads
                      </p>
                    </div>
                    {version.isLatest ? <Badge tone="green">Latest</Badge> : null}
                  </CardHeader>
                  <CardBody>
                    <p className="text-xs text-slate-500">Downloads are handled on BuiltByBit.</p>
                  </CardBody>
                </Card>
              ))
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
