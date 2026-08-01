import { Card } from "@/components/ui/card";

export function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse rounded-md bg-night-700/60 ${className}`} aria-hidden />;
}

export function EmptyState({ title, body }: { title: string; body?: string }) {
  return (
    <Card className="flex flex-col items-center justify-center px-6 py-14 text-center">
      <div className="font-pixel text-3xl text-night-500" aria-hidden>
        []
      </div>
      <h3 className="mt-4 font-semibold text-slate-200">{title}</h3>
      {body ? <p className="mt-2 max-w-sm text-sm text-slate-400">{body}</p> : null}
    </Card>
  );
}

export function ErrorState({ title = "Something went wrong", body, retry }: { title?: string; body?: string; retry?: () => void }) {
  return (
    <Card className="flex flex-col items-center justify-center px-6 py-14 text-center">
      <div className="font-pixel text-2xl text-red-400" aria-hidden>
        !
      </div>
      <h3 className="mt-4 font-semibold text-slate-200">{title}</h3>
      {body ? <p className="mt-2 max-w-sm text-sm text-slate-400">{body}</p> : null}
      {retry ? (
        <button
          type="button"
          onClick={retry}
          className="mt-5 rounded-md border border-night-500 bg-night-800 px-4 py-2 text-sm text-slate-200 hover:border-pixel-cyan/60"
        >
          Try again
        </button>
      ) : null}
    </Card>
  );
}
