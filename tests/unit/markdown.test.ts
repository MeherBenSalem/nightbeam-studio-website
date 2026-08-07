import { describe, expect, it } from "vitest";
import { renderMarkdown } from "@/lib/utils/markdown";

describe("renderMarkdown", () => {
  it("renders links, numbered lists, fences, and tables", () => {
    const html = renderMarkdown(
      [
        "## Title",
        "",
        "See [Modrinth](https://modrinth.com/mod/jauml).",
        "",
        "1. First",
        "2. Second",
        "",
        "```java",
        "ConfigFile c = JaumlConfig.open(\"a\", \"b\");",
        "```",
        "",
        "| Area | Support |",
        "| --- | --- |",
        "| Fabric | Yes |",
      ].join("\n"),
    );

    expect(html).toContain("<h2>Title</h2>");
    expect(html).toContain('href="https://modrinth.com/mod/jauml"');
    expect(html).toContain("<ol>");
    expect(html).toContain("<li>First</li>");
    expect(html).toContain("<pre><code class=\"language-java\">");
    expect(html).toContain("JaumlConfig.open");
    expect(html).toContain("<table>");
    expect(html).toContain("<th>Area</th>");
    expect(html).toContain("<td>Yes</td>");
    expect(html).not.toContain("<script");
  });

  it("rejects link URLs that would break out of href", () => {
    const html = renderMarkdown('[x](https://evil.com"onclick="alert(1))');
    expect(html).not.toContain("onclick");
    expect(html).toContain("x");
  });

  it("escapes raw HTML", () => {
    const html = renderMarkdown("<script>alert(1)</script>");
    expect(html).toContain("&lt;script&gt;");
    expect(html).not.toContain("<script>");
  });
});
