import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import type { StoreProductDetail } from "@/lib/db/types";
import { formatPrice } from "@/lib/utils/format";
import { cn } from "@/lib/utils/cn";

const buttonClass =
  "inline-flex h-10 items-center justify-center rounded-md bg-gradient-to-r from-purple-600 to-blue-600 px-4 text-sm font-medium text-white shadow-[0_0_18px_rgb(255_255_255/0.2)] transition-colors hover:from-purple-500 hover:to-blue-500";

const secondaryClass =
  "inline-flex h-10 items-center justify-center rounded-md border border-night-500/60 bg-night-800 px-4 text-sm font-medium text-slate-200 transition-colors hover:border-pixel-cyan/60 hover:text-white";

export function StoreCta({ product }: { product: StoreProductDetail }) {
  const onSale = product.finalPrice < product.listPrice && product.listPrice > 0;

  if (product.isOwned) {
    return (
      <div className="flex flex-col items-end gap-2">
        <Badge tone="green">Owned</Badge>
        <Link href={product.url} target="_blank" rel="noopener noreferrer" className={cn(secondaryClass)}>
          View on BuiltByBit
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-end gap-2">
      <div className="text-right">
        {product.isFree ? (
          <div className="font-pixel text-sm text-pixel-green">Free</div>
        ) : onSale ? (
          <div>
            <div className="text-xs text-slate-500 line-through">{formatPrice(product.listPrice, product.currency)}</div>
            <div className="font-pixel text-sm text-pixel-cyan">{formatPrice(product.finalPrice, product.currency)}</div>
          </div>
        ) : (
          <div className="font-pixel text-sm text-white">{formatPrice(product.finalPrice, product.currency)}</div>
        )}
      </div>
      <Link href={product.url} target="_blank" rel="noopener noreferrer" className={buttonClass}>
        {product.isFree ? "View on BuiltByBit" : "Buy on BuiltByBit"}
      </Link>
    </div>
  );
}
