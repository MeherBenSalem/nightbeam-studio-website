import { readFileSync } from "node:fs";
const { buildSystemPrompt } = await import("./.prompt-mod.mjs");
const kb = process.env.KB ?? "";
const prompt = buildSystemPrompt(
  "- rpg-attribute-system: Minecraft RPG attribute and progression mod\n  Available documentation: api/overview, api/examples, commands/command-reference, compatibility, configuration/*, faq, getting-started, glossary, guides/*, installation, migration, performance, permissions/*, troubleshooting, updating, features, support",
  kb,
);
process.stdout.write(prompt);
