"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/input";
import { EmptyState } from "@/components/ui/state";
import { timeAgo } from "@/lib/utils/format";

interface Comment {
  id: string;
  content: string;
  authorName: string;
  createdAt: string;
}

export function CommentsSection({ slug, initial, loggedIn }: { slug: string; initial: Comment[]; loggedIn: boolean }) {
  const [comments, setComments] = useState(initial);
  const [content, setContent] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    if (!content.trim()) return;
    setSending(true);
    try {
      const response = await fetch(`/api/projects/${slug}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      });
      const data = (await response.json()) as { comment?: Comment; error?: string };
      if (!response.ok || !data.comment) {
        setError(data.error ?? "Could not post comment.");
        return;
      }
      setComments((list) => [data.comment as Comment, ...list]);
      setContent("");
    } finally {
      setSending(false);
    }
  }

  return (
    <div>
      {loggedIn ? (
        <form onSubmit={(event) => void submit(event)} className="pixel-panel rounded-xl p-4">
          <label htmlFor="comment" className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-slate-400">
            Join the discussion
          </label>
          <Textarea
            id="comment"
            value={content}
            onChange={(event) => setContent(event.target.value)}
            placeholder="Share your experience with the mod…"
            maxLength={2000}
          />
          {error ? <p className="mt-2 text-sm text-red-400">{error}</p> : null}
          <div className="mt-3 flex justify-end">
            <Button type="submit" size="sm" disabled={sending || !content.trim()}>
              Post comment
            </Button>
          </div>
        </form>
      ) : (
        <p className="text-sm text-slate-400">
          <a href={`/auth/login?callbackUrl=${encodeURIComponent(`/projects/${slug}`)}`} className="text-pixel-cyan hover:underline">
            Sign in
          </a>{" "}
          to join the discussion.
        </p>
      )}
      <ul className="mt-6 space-y-4">
        {comments.length === 0 ? (
          <EmptyState title="No comments yet" body="Be the first to share your thoughts." />
        ) : (
          comments.map((comment) => (
            <li key={comment.id} className="pixel-panel rounded-xl p-4">
              <div className="flex items-center justify-between gap-3">
                <span className="text-sm font-semibold text-white">{comment.authorName}</span>
                <span className="text-xs text-slate-500">{timeAgo(comment.createdAt)}</span>
              </div>
              <p className="mt-2 whitespace-pre-wrap text-sm text-slate-300">{comment.content}</p>
            </li>
          ))
        )}
      </ul>
    </div>
  );
}
