import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import {
  addNote,
  completeTask,
  createTask,
  getPlan,
  getToday,
  listCadence,
  listKpis,
  listProductBets,
  listReminders,
  listTasks,
  listWeeks,
  loadDatabase,
  resolveDbPath,
  scorecard,
  snoozeReminder,
  updateKpi,
  updateProductBet,
  updateTask,
} from "../store/db.js";

function text(data: unknown) {
  return { content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }] };
}

const server = new McpServer({
  name: "nightbeam-ops",
  version: "1.0.0",
});

server.registerTool("ops_get_plan", {
  description: "Get NightBeam growth plan overview, targets, diagnosis, weeks, and data path",
  inputSchema: {},
}, async () => {
  loadDatabase();
  return text({
    dataPath: resolveDbPath(),
    plan: getPlan(),
    weeks: listWeeks(),
    cadence: listCadence(),
  });
});

server.registerTool("ops_list_tasks", {
  description: "List growth-ops tasks with optional filters",
  inputSchema: {
    status: z.enum(["pending", "in_progress", "done", "skipped", "blocked"]).optional(),
    weekId: z.string().optional(),
    tag: z.string().optional(),
    dueDate: z.string().optional(),
    from: z.string().optional(),
    to: z.string().optional(),
  },
}, async (args) => text(listTasks(args)));

server.registerTool("ops_get_today", {
  description: "Get today's due tasks, overdue tasks, and due reminders",
  inputSchema: {},
}, async () => text(getToday()));

server.registerTool("ops_create_task", {
  description: "Create a custom ops task with a 09:00 Europe/Paris reminder",
  inputSchema: {
    title: z.string().min(1),
    dueDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    job: z.string().optional(),
    notes: z.string().optional(),
    priority: z.number().int().min(1).max(5).optional(),
    tags: z.array(z.string()).optional(),
    weekId: z.string().nullable().optional(),
  },
}, async (args) => text(createTask(args)));

server.registerTool("ops_update_task", {
  description: "Update a task fields (status, notes, dueDate, priority, etc.)",
  inputSchema: {
    id: z.string(),
    title: z.string().optional(),
    notes: z.string().optional(),
    dueDate: z.string().optional(),
    priority: z.number().optional(),
    status: z.enum(["pending", "in_progress", "done", "skipped", "blocked"]).optional(),
    job: z.string().optional(),
    tags: z.array(z.string()).optional(),
    weekId: z.string().nullable().optional(),
  },
}, async (args) => {
  const { id, ...patch } = args;
  const updated = updateTask(id, patch);
  if (!updated) return text({ error: "Task not found", id });
  return text(updated);
});

server.registerTool("ops_complete_task", {
  description: "Mark a task done",
  inputSchema: { id: z.string() },
}, async ({ id }) => {
  const updated = completeTask(id);
  if (!updated) return text({ error: "Task not found", id });
  return text(updated);
});

server.registerTool("ops_list_reminders", {
  description: "List reminders; set dueOnly=true for fireable reminders",
  inputSchema: { dueOnly: z.boolean().optional() },
}, async ({ dueOnly }) => text(listReminders({ dueOnly })));

server.registerTool("ops_snooze_reminder", {
  description: "Snooze a reminder until an ISO timestamp",
  inputSchema: {
    id: z.string(),
    untilIso: z.string(),
  },
}, async ({ id, untilIso }) => {
  const rem = snoozeReminder(id, untilIso);
  if (!rem) return text({ error: "Reminder not found", id });
  return text(rem);
});

server.registerTool("ops_list_kpis", {
  description: "List Monday scorecard KPIs",
  inputSchema: {},
}, async () => text(listKpis()));

server.registerTool("ops_update_kpi", {
  description: "Update the current value of a KPI",
  inputSchema: {
    id: z.string(),
    current: z.string(),
  },
}, async ({ id, current }) => {
  const kpi = updateKpi(id, current);
  if (!kpi) return text({ error: "KPI not found", id });
  return text(kpi);
});

server.registerTool("ops_list_product_bets", {
  description: "List product bets (BBB/CF/MR monetization pushes)",
  inputSchema: {},
}, async () => text(listProductBets()));

server.registerTool("ops_update_product_bet", {
  description: "Update product bet status",
  inputSchema: {
    id: z.string(),
    status: z.enum(["planned", "active", "paused", "done"]),
  },
}, async ({ id, status }) => {
  const bet = updateProductBet(id, status);
  if (!bet) return text({ error: "Product bet not found", id });
  return text(bet);
});

server.registerTool("ops_add_note", {
  description: "Add a CEO note, optionally linked to a task",
  inputSchema: {
    body: z.string().min(1),
    taskId: z.string().optional(),
  },
}, async ({ body, taskId }) => text(addNote(body, taskId ?? null)));

server.registerTool("ops_scorecard", {
  description: "Monday-ready scorecard summary for Agent check-ins",
  inputSchema: {},
}, async () => text(scorecard()));

server.registerResource(
  "ops-plan",
  "ops://plan",
  {
    description: "NightBeam growth plan snapshot",
    mimeType: "application/json",
  },
  async () => ({
    contents: [
      {
        uri: "ops://plan",
        mimeType: "application/json",
        text: JSON.stringify({ plan: getPlan(), weeks: listWeeks() }, null, 2),
      },
    ],
  }),
);

server.registerResource(
  "ops-today",
  "ops://today",
  {
    description: "Today due/overdue tasks",
    mimeType: "application/json",
  },
  async () => ({
    contents: [
      {
        uri: "ops://today",
        mimeType: "application/json",
        text: JSON.stringify(getToday(), null, 2),
      },
    ],
  }),
);

async function main() {
  loadDatabase();
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error(`nightbeam-ops MCP ready · ${resolveDbPath()}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
