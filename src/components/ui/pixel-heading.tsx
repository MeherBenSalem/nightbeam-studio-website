import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils/cn";

export function PixelHeading({
  children,
  className,
  as: Tag = "h2",
  ...props
}: HTMLAttributes<HTMLHeadingElement> & { as?: "h1" | "h2" | "h3" | "h4" }) {
  return (
    <Tag
      className={cn(
        "font-pixel text-glow-cyan uppercase leading-relaxed text-pixel-cyan",
        Tag === "h1" ? "text-xl sm:text-2xl lg:text-3xl" : Tag === "h2" ? "text-base sm:text-lg lg:text-xl" : "text-sm",
        className,
      )}
      {...props}
    >
      {children}
    </Tag>
  );
}
