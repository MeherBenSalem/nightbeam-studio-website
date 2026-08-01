import Link from "next/link";
import { ChevronLeftIcon, ChevronRightIcon } from "@/components/icons";
import { cn } from "@/lib/utils/cn";

export function Pagination({ page, totalPages, buildHref }: { page: number; totalPages: number; buildHref: (page: number) => string }) {
  if (totalPages <= 1) return null;
  const pages = Array.from({ length: totalPages }, (_, index) => index + 1).filter(
    (p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1,
  );
  const items: Array<number | "…"> = [];
  for (const p of pages) {
    if (items.length && typeof items[items.length - 1] === "number" && (items[items.length - 1] as number) + 1 < p) {
      items.push("…");
    }
    items.push(p);
  }

  return (
    <nav aria-label="Pagination" className="flex items-center justify-center gap-1">
      <Link
        href={buildHref(page - 1)}
        aria-disabled={page <= 1}
        tabIndex={page <= 1 ? -1 : 0}
        className={cn(
          "rounded-md border border-night-500/50 bg-night-800 p-2 text-slate-300 hover:border-pixel-cyan/60",
          page <= 1 && "pointer-events-none opacity-40",
        )}
      >
        <ChevronLeftIcon />
      </Link>
      {items.map((item, index) =>
        typeof item === "number" ? (
          <Link
            key={`${item}-${index}`}
            href={buildHref(item)}
            aria-current={item === page ? "page" : undefined}
            className={cn(
              "min-w-9 rounded-md border px-2 py-1.5 text-center text-sm",
              item === page
                ? "border-pixel-cyan/60 bg-cyan-500/10 font-semibold text-pixel-cyan"
                : "border-night-500/50 bg-night-800 text-slate-300 hover:border-pixel-cyan/60",
            )}
          >
            {item}
          </Link>
        ) : (
          <span key={`ellipsis-${index}`} className="px-1 text-slate-500">
            …
          </span>
        ),
      )}
      <Link
        href={buildHref(page + 1)}
        aria-disabled={page >= totalPages}
        tabIndex={page >= totalPages ? -1 : 0}
        className={cn(
          "rounded-md border border-night-500/50 bg-night-800 p-2 text-slate-300 hover:border-pixel-cyan/60",
          page >= totalPages && "pointer-events-none opacity-40",
        )}
      >
        <ChevronRightIcon />
      </Link>
    </nav>
  );
}
