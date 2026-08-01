"use client";

import { Button } from "@/components/ui/button";

export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="mx-auto flex max-w-xl flex-col items-center px-4 py-28 text-center">
      <div className="font-pixel text-3xl text-red-400" aria-hidden>
        !
      </div>
      <h1 className="mt-6 font-pixel text-lg text-white">SOMETHING WENT WRONG</h1>
      <p className="mt-4 text-slate-400">An unexpected error occurred while rendering this page. Try again.</p>
      <Button className="mt-8" onClick={reset}>
        Try again
      </Button>
    </div>
  );
}
