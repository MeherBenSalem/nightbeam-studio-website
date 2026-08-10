# NightBeam Ops

Local **desktop + Cursor MCP** control plane for the NightBeam Aug–Sep 2026 growth plan.

## Features

- Today / Plan / Tasks / Products / Cadence / KPIs / Reminders
- Shared JSON store (`%APPDATA%/nightbeam-ops/ops.json`)
- OS notification reminders while the Electron app is running (poll every 60s)
- Cursor MCP tools (`ops_get_today`, `ops_complete_task`, `ops_scorecard`, …)

## Setup

```bash
cd tools/nightbeam-ops
npm install
npm run seed
```

### Desktop

```bash
npm run dev:app
```

Or production-ish:

```bash
npm run build
npm start
```

### Cursor MCP

Already registered in the repo [`.cursor/mcp.json`](../../.cursor/mcp.json).

Reload MCP in Cursor (Settings → MCP), or add the same block to `~/.cursor/mcp.json`.

Then ask Agent: “What’s on my NightBeam Ops today list?”

## Scripts

| Script | Purpose |
|--------|---------|
| `npm run seed` | Upsert growth plan into the DB (keeps done status) |
| `npm run seed -- --force` | Full reset |
| `npm run mcp` | Run MCP server on stdio |
| `npm run typecheck` | TypeScript checks |
| `npm run dist` | Windows electron-builder dir output |

## Env

- `NIGHTBEAM_OPS_DATA` — directory for `ops.json` (default `%APPDATA%/nightbeam-ops`)
