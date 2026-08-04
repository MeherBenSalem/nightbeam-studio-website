import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { ChatMarkdown } from "@/components/chat/chat-markdown";

function render(content: string): string {
  return renderToStaticMarkup(<ChatMarkdown content={content} />);
}

describe("chat markdown renderer", () => {
  it("renders bold and inline code", () => {
    const html = render("Set **max_player_level** in `config/ras/main.json`.");
    expect(html).toContain("<strong>max_player_level</strong>");
    expect(html).toContain("<code");
    expect(html).toContain("config/ras/main.json");
  });

  it("renders fenced code blocks", () => {
    const html = render("Example:\n\n```json\n{\"mana\": true}\n```");
    expect(html).toContain("<pre");
    expect(html).toContain("{&quot;mana&quot;: true}");
  });

  it("renders bullet and numbered lists", () => {
    const html = render("Steps:\n\n- one\n- two\n\n1. first\n2. second");
    expect(html).toContain("<ul");
    expect(html).toContain("<ol");
    expect(html).toContain("<li>one</li>");
    expect(html).toContain("<li>first</li>");
  });

  it("never renders raw HTML", () => {
    const html = render("Hello <script>alert(1)</script> and <img src=x onerror=y>");
    expect(html).not.toContain("<script>");
    expect(html).not.toContain("<img");
  });

  it("renders links as anchors", () => {
    const html = render("See [the docs](https://nightbeam.dev/docs).");
    expect(html).toContain('href="https://nightbeam.dev/docs"');
  });

  it("renders plain text unchanged", () => {
    const html = render("Just a simple sentence.");
    expect(html).toContain("Just a simple sentence.");
  });
});
