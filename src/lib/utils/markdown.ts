// Tiny, safe markdown-ish renderer for seeded docs and changelogs.
// Escapes HTML first, then applies a small set of line transforms.

export function renderMarkdown(source: string): string {
  const escaped = source
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

  const lines = escaped.split("\n");
  const html: string[] = [];
  let inUl = false;
  let inOl = false;
  let inCode: string | null = null;
  let codeLines: string[] = [];
  let tableRows: string[][] | null = null;

  function closeLists() {
    if (inUl) {
      html.push("</ul>");
      inUl = false;
    }
    if (inOl) {
      html.push("</ol>");
      inOl = false;
    }
  }

  function flushTable() {
    if (!tableRows || tableRows.length === 0) {
      tableRows = null;
      return;
    }
    closeLists();
    const rows = tableRows.filter((row, index) => {
      if (index === 1 && row.every((cell) => /^:?-{3,}:?$/.test(cell.trim()))) return false;
      return true;
    });
    if (rows.length === 0) {
      tableRows = null;
      return;
    }
    const [header, ...body] = rows;
    html.push("<table>");
    html.push("<thead><tr>");
    for (const cell of header) html.push(`<th>${inline(cell.trim())}</th>`);
    html.push("</tr></thead>");
    if (body.length > 0) {
      html.push("<tbody>");
      for (const row of body) {
        html.push("<tr>");
        for (const cell of row) html.push(`<td>${inline(cell.trim())}</td>`);
        html.push("</tr>");
      }
      html.push("</tbody>");
    }
    html.push("</table>");
    tableRows = null;
  }

  function closeBlocks() {
    flushTable();
    closeLists();
  }

  for (const rawLine of lines) {
    const line = rawLine.trimEnd();

    if (inCode !== null) {
      if (line.trim().startsWith("```")) {
        html.push(`<pre><code class="language-${inCode}">${codeLines.join("\n")}</code></pre>`);
        inCode = null;
        codeLines = [];
      } else {
        codeLines.push(line);
      }
      continue;
    }

    const fence = line.trim().match(/^```(\w*)$/);
    if (fence) {
      closeBlocks();
      inCode = fence[1] || "text";
      codeLines = [];
      continue;
    }

    if (!line.trim()) {
      closeBlocks();
      continue;
    }

    if (line.includes("|") && line.trim().startsWith("|")) {
      const cells = line
        .trim()
        .replace(/^\|/, "")
        .replace(/\|$/, "")
        .split("|")
        .map((cell) => cell.trim());
      if (!tableRows) {
        closeLists();
        tableRows = [];
      }
      tableRows.push(cells);
      continue;
    }
    if (tableRows) flushTable();

    const heading = line.match(/^(#{1,3})\s+(.*)$/);
    if (heading) {
      closeLists();
      const level = heading[1].length;
      html.push(`<h${level}>${inline(heading[2])}</h${level}>`);
      continue;
    }

    const ulItem = line.match(/^[-*]\s+(.*)$/);
    if (ulItem) {
      if (inOl) {
        html.push("</ol>");
        inOl = false;
      }
      if (!inUl) {
        html.push("<ul>");
        inUl = true;
      }
      html.push(`<li>${inline(ulItem[1])}</li>`);
      continue;
    }

    const olItem = line.match(/^\d+\.\s+(.*)$/);
    if (olItem) {
      if (inUl) {
        html.push("</ul>");
        inUl = false;
      }
      if (!inOl) {
        html.push("<ol>");
        inOl = true;
      }
      html.push(`<li>${inline(olItem[1])}</li>`);
      continue;
    }

    const quote = line.match(/^>\s?(.*)$/);
    if (quote) {
      closeLists();
      html.push(`<blockquote>${inline(quote[1])}</blockquote>`);
      continue;
    }

    closeLists();
    html.push(`<p>${inline(line)}</p>`);
  }

  if (inCode !== null) {
    html.push(`<pre><code class="language-${inCode}">${codeLines.join("\n")}</code></pre>`);
  }
  closeBlocks();
  return html.join("\n");
}

function inline(text: string): string {
  return text
    .replace(/\[([^\]]+)\]\((https?:\/\/[^)\s]+)\)/g, (_match, label: string, url: string) => {
      if (/["'<>]/.test(url)) return label;
      const safeHref = url.replace(/&/g, "&amp;");
      return `<a href="${safeHref}" rel="noopener noreferrer" target="_blank">${label}</a>`;
    })
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.+?)\*/g, "<em>$1</em>")
    .replace(/`([^`]+)`/g, "<code>$1</code>");
}
