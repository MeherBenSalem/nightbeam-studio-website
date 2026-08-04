import { readFileSync } from "node:fs";
const { buildSystemPrompt } = await import("./.prompt-mod.mjs");
const kb = readFileSync(".kb-block.txt", "utf8");
const prompt = buildSystemPrompt("CATALOG", kb) + process.env.EXTRA ?? "";
const key = readFileSync(".env", "utf8").split("\n").find((l) => l.startsWith("DEEPSEEK_API_KEY=")).split("=").slice(1).join("=").trim();
const question = process.argv[2] ?? "How Can I Setup a RPG Mana Stats With another mod";
const res = await fetch("https://api.deepseek.com/chat/completions", {
  method: "POST",
  headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` },
  body: JSON.stringify({
    model: "deepseek-chat",
    messages: [{ role: "system", content: prompt }, { role: "user", content: question }],
    max_tokens: 400,
    temperature: 0.3,
    stream: false,
  }),
});
const data = await res.json();
console.log("=== ANSWER ===");
console.log(data.choices?.[0]?.message?.content ?? JSON.stringify(data).slice(0, 300));
