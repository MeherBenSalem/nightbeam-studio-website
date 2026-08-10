---
name: nightbeam-ops
description: >-
  Manage NightBeam Growth Ops todos, reminders, KPIs, and the Aug–Sep 2026
  revenue plan via the nightbeam-ops MCP. Use when the user asks about growth
  tasks, today's ops work, scorecard, product bets, or NightBeam Ops.
---

# NightBeam Ops

Prefer the **nightbeam-ops** MCP tools before inventing task lists.

## Typical flows

- Morning: `ops_get_today` then help complete/snooze items
- Planning: `ops_get_plan` + `ops_list_product_bets`
- Monday: `ops_scorecard` + `ops_update_kpi`
- Shipping day: `ops_list_tasks` filtered by date/week, then `ops_complete_task`

## Data

Shared JSON store (same as the desktop app):

`%APPDATA%/nightbeam-ops/ops.json`

Override with env `NIGHTBEAM_OPS_DATA`.

## Desktop

```bash
cd tools/nightbeam-ops
npm install
npm run seed
npm run dev:app
```
