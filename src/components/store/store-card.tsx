import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import type { StoreProductSummary } from "@/lib/db/types";
import { formatNumber, formatPrice } from "@/lib/utils/format";

export function StoreCard({ product }: { product: StoreProductSummary }) {
  const onSale = product.finalPrice < product.listPrice && product.listPrice > 0;

  return (
    <Link
      href={`/store/${product.slug}`}
      className="pixel-panel group block rounded-xl p-5 transition-transform hover:-translate-y-0.5 focus-visible:-translate-y-0.5"
    >
      <div className="flex items-start gap-4">
        {product.iconUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={product.iconUrl} alt={product.name} className="h-14 w-14 rounded-lg border border-night-500/60 object-cover" />
        ) : (
          <div className="grid h-14 w-14 shrink-0 place-items-center rounded-lg border border-night-500/60 bg-gradient-to-br from-amber-600/40 via-night-800 to-cyan-500/30 font-pixel text-xl text-white">
            {product.name.slice(0, 1)}
          </div>
        )}
        <div className="min-w-0 flex-1">
          <h3 className="truncate font-semibold text-white group-hover:text-pixel-cyan">{product.name}</h3>
          <p className="text-xs text-slate-500">
            {product.categoryLabel ?? product.category}
            {product.latestVersion ? ` · v${product.latestVersion}` : ""}
          </p>
        </div>
      </div>
      <p className="mt-3 line-clamp-2 text-sm text-slate-400">{product.summary}</p>
      <div className="mt-3 flex flex-wrap gap-1.5">
        <Badge tone="amber">{product.categoryLabel ?? product.category}</Badge>
        {product.isFree ? <Badge tone="green">Free</Badge> : null}
        {onSale ? <Badge tone="pink">Sale</Badge> : null}
      </div>
      <div className="mt-4 flex items-center justify-between gap-3 text-xs text-slate-400">
        <div className="flex gap-4">
          <span>⬇ {formatNumber(product.downloads)}</span>
          <span>★ {product.rating.toFixed(1)}</span>
        </div>
        <div className="text-right">
          {product.isFree ? (
            <span className="font-medium text-pixel-green">Free</span>
          ) : onSale ? (
            <span>
              <span className="mr-2 text-slate-500 line-through">{formatPrice(product.listPrice, product.currency)}</span>
              <span className="font-medium text-pixel-cyan">{formatPrice(product.finalPrice, product.currency)}</span>
            </span>
          ) : (
            <span className="font-medium text-white">{formatPrice(product.finalPrice, product.currency)}</span>
          )}
        </div>
      </div>
    </Link>
  );
}
