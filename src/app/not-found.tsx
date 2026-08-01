import Link from "next/link";
import { PixelHeading } from "@/components/ui/pixel-heading";

export default function NotFound() {
  return (
    <div className="mx-auto flex max-w-xl flex-col items-center px-4 py-28 text-center">
      <div className="font-pixel text-5xl text-pixel-purple text-glow-purple" aria-hidden>
        404
      </div>
      <PixelHeading as="h1" className="mt-6">
        Block Not Found
      </PixelHeading>
      <p className="mt-4 text-slate-400">This page was mined out or never generated. The world may never know.</p>
      <Link href="/" className="mt-8 rounded-md bg-gradient-to-r from-purple-600 to-blue-600 px-6 py-3 text-sm font-medium text-white">
        Return home
      </Link>
    </div>
  );
}
