"use client";

import { Fragment, type ReactNode } from "react";

/**
 * Lightweight, safe markdown renderer for assistant messages.
 * Supports: paragraphs, bold, italic, inline code, fenced code blocks,
 * bullet/numbered lists, links, and h3/h4 headings. Renders React
 * elements only — raw HTML is never injected.
 */

function inline(text: string, keyPrefix: string): ReactNode[] {
  const nodes: ReactNode[] = [];
  // Split on: **bold**, *italic*, `code`, [text](url)
  const pattern = /(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`|\[[^\]]+\]\([^)]+\))/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  let i = 0;
  while ((match = pattern.exec(text)) !== null) {
    if (match.index > lastIndex) nodes.push(text.slice(lastIndex, match.index));
    const token = match[0];
    if (token.startsWith("**")) {
      nodes.push(<strong key={`${keyPrefix}-b${i}`}>{token.slice(2, -2)}</strong>);
    } else if (token.startsWith("`")) {
      nodes.push(
        <code key={`${keyPrefix}-c${i}`} className="rounded bg-night-700 px-1 py-0.5 text-[0.85em] text-pixel-cyan">
          {token.slice(1, -1)}
        </code>,
      );
    } else if (token.startsWith("[")) {
      const linkMatch = token.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
      if (linkMatch) {
        const href = linkMatch[2];
        nodes.push(
          <a
            key={`${keyPrefix}-l${i}`}
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="text-pixel-cyan underline decoration-pixel-cyan/40 hover:text-white"
          >
            {linkMatch[1]}
          </a>,
        );
      } else {
        nodes.push(token);
      }
    } else {
      nodes.push(<em key={`${keyPrefix}-i${i}`}>{token.slice(1, -1)}</em>);
    }
    lastIndex = match.index + token.length;
    i += 1;
  }
  if (lastIndex < text.length) nodes.push(text.slice(lastIndex));
  return nodes;
}

function renderBlock(block: string, index: number): ReactNode {
  const trimmed = block.trim();

  // Fenced code block.
  const fence = trimmed.match(/^```(\w*)\n([\s\S]*?)\n```$/);
  if (fence) {
    return (
      <pre
        key={index}
        className="my-2 overflow-x-auto rounded-lg border border-night-600 bg-night-950 px-3 py-2 text-xs leading-relaxed text-slate-200"
      >
        <code>{fence[2]}</code>
      </pre>
    );
  }

  // Headings.
  const heading = trimmed.match(/^#{3,4}\s+(.+)$/);
  if (heading) {
    return (
      <p key={index} className="mt-3 mb-1 font-semibold text-white">
        {inline(heading[1], `h${index}`)}
      </p>
    );
  }

  // Bullet list.
  if (/^[-*]\s+/m.test(trimmed)) {
    const items = trimmed.split(/\n(?=[-*]\s+)/).map((line) => line.replace(/^[-*]\s+/, ""));
    return (
      <ul key={index} className="my-1.5 list-disc space-y-1 pl-5">
        {items.map((item, i) => (
          <li key={i}>{inline(item, `u${index}-${i}`)}</li>
        ))}
      </ul>
    );
  }

  // Numbered list.
  if (/^\d+[.)]\s+/m.test(trimmed)) {
    const items = trimmed
      .split(/\n(?=\d+[.)]\s+)/)
      .map((line) => line.replace(/^\d+[.)]\s+/, ""));
    return (
      <ol key={index} className="my-1.5 list-decimal space-y-1 pl-5">
        {items.map((item, i) => (
          <li key={i}>{inline(item, `o${index}-${i}`)}</li>
        ))}
      </ol>
    );
  }

  // Paragraph.
  return (
    <p key={index} className="my-1">
      {inline(trimmed, `p${index}`)}
    </p>
  );
}

export function ChatMarkdown({ content }: { content: string }) {
  const blocks = content.split(/\n{2,}/).filter((block) => block.trim().length > 0);
  if (blocks.length === 0) return <>{content}</>;
  return (
    <div className="space-y-0.5">
      {blocks.map((block, index) => (
        <Fragment key={index}>{renderBlock(block, index)}</Fragment>
      ))}
    </div>
  );
}
