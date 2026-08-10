import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import type {
  Kpi,
  Note,
  OpsDatabase,
  ProductBet,
  ProductBetStatus,
  Reminder,
  Task,
  TaskFilters,
  TaskStatus,
} from "./types.js";
import { buildSeedDatabase } from "../seed/growth-plan.js";

const DB_VERSION = 1;

export function resolveDataDir(): string {
  if (process.env.NIGHTBEAM_OPS_DATA) {
    return process.env.NIGHTBEAM_OPS_DATA.replace(
      /%APPDATA%/gi,
      process.env.APPDATA ?? path.join(os.homedir(), "AppData", "Roaming"),
    );
  }
  const appData = process.env.APPDATA ?? path.join(os.homedir(), "AppData", "Roaming");
  return path.join(appData, "nightbeam-ops");
}

export function resolveDbPath(): string {
  return path.join(resolveDataDir(), "ops.json");
}

function ensureDir(dir: string) {
  fs.mkdirSync(dir, { recursive: true });
}

export function loadDatabase(): OpsDatabase {
  const dbPath = resolveDbPath();
  ensureDir(path.dirname(dbPath));
  if (!fs.existsSync(dbPath)) {
    const seeded = buildSeedDatabase();
    saveDatabase(seeded);
    return seeded;
  }
  const raw = fs.readFileSync(dbPath, "utf8");
  const parsed = JSON.parse(raw) as OpsDatabase;
  if (!parsed.version || !parsed.plan || !Array.isArray(parsed.tasks)) {
    const seeded = buildSeedDatabase();
    saveDatabase(seeded);
    return seeded;
  }
  return parsed;
}

export function saveDatabase(db: OpsDatabase): void {
  const dbPath = resolveDbPath();
  ensureDir(path.dirname(dbPath));
  const tmp = `${dbPath}.tmp`;
  fs.writeFileSync(tmp, JSON.stringify(db, null, 2), "utf8");
  fs.renameSync(tmp, dbPath);
}

export function reseedDatabase(force = false): OpsDatabase {
  const dbPath = resolveDbPath();
  if (!force && fs.existsSync(dbPath)) {
    const existing = loadDatabase();
    const seeded = buildSeedDatabase();
    // Idempotent upsert: keep user status/notes/kpi currents; fill missing seed rows
    const taskMap = new Map(existing.tasks.map((t) => [t.id, t]));
    for (const t of seeded.tasks) {
      const prev = taskMap.get(t.id);
      if (prev) {
        taskMap.set(t.id, {
          ...t,
          status: prev.status,
          notes: prev.notes || t.notes,
          updatedAt: prev.updatedAt,
        });
      } else {
        taskMap.set(t.id, t);
      }
    }
    const reminderMap = new Map(existing.reminders.map((r) => [r.id, r]));
    for (const r of seeded.reminders) {
      if (!reminderMap.has(r.id)) reminderMap.set(r.id, r);
    }
    const kpiMap = new Map(existing.kpis.map((k) => [k.id, k]));
    for (const k of seeded.kpis) {
      const prev = kpiMap.get(k.id);
      kpiMap.set(k.id, prev ? { ...k, current: prev.current } : k);
    }
    const betMap = new Map(existing.productBets.map((b) => [b.id, b]));
    for (const b of seeded.productBets) {
      const prev = betMap.get(b.id);
      betMap.set(b.id, prev ? { ...b, status: prev.status } : b);
    }
    const merged: OpsDatabase = {
      ...seeded,
      version: DB_VERSION,
      tasks: [...taskMap.values()].sort((a, b) => a.dueDate.localeCompare(b.dueDate)),
      reminders: [...reminderMap.values()],
      kpis: [...kpiMap.values()],
      productBets: [...betMap.values()],
      notes: existing.notes,
    };
    saveDatabase(merged);
    return merged;
  }
  const seeded = buildSeedDatabase();
  saveDatabase(seeded);
  return seeded;
}

function touch(task: Task): Task {
  return { ...task, updatedAt: new Date().toISOString() };
}

export function getPlan(db = loadDatabase()) {
  return db.plan;
}

export function listWeeks(db = loadDatabase()) {
  return [...db.weeks].sort((a, b) => a.sortOrder - b.sortOrder);
}

export function listTasks(filters: TaskFilters = {}, db = loadDatabase()): Task[] {
  let tasks = [...db.tasks];
  if (filters.status) tasks = tasks.filter((t) => t.status === filters.status);
  if (filters.weekId) tasks = tasks.filter((t) => t.weekId === filters.weekId);
  if (filters.tag) tasks = tasks.filter((t) => t.tags.includes(filters.tag!));
  if (filters.dueDate) tasks = tasks.filter((t) => t.dueDate === filters.dueDate);
  if (filters.from) tasks = tasks.filter((t) => t.dueDate >= filters.from!);
  if (filters.to) tasks = tasks.filter((t) => t.dueDate <= filters.to!);
  return tasks.sort((a, b) => a.dueDate.localeCompare(b.dueDate) || a.priority - b.priority);
}

export function todayIso(timeZone = "Europe/Paris"): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

export function getToday(db = loadDatabase()) {
  const today = todayIso();
  const open = db.tasks.filter((t) => t.status === "pending" || t.status === "in_progress" || t.status === "blocked");
  const dueToday = open.filter((t) => t.dueDate === today);
  const overdue = open.filter((t) => t.dueDate < today);
  const reminders = db.reminders
    .filter((r) => {
      const effective = r.snoozeUntil ?? r.remindAt;
      return effective.slice(0, 10) <= today && !r.sentAt;
    })
    .map((r) => ({ reminder: r, task: db.tasks.find((t) => t.id === r.taskId) ?? null }));
  return { today, dueToday, overdue, reminders };
}

export function createTask(
  input: {
    title: string;
    dueDate: string;
    job?: string;
    notes?: string;
    priority?: number;
    tags?: string[];
    weekId?: string | null;
  },
  db = loadDatabase(),
): Task {
  const now = new Date().toISOString();
  const task: Task = {
    id: `task-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    dueDate: input.dueDate,
    job: input.job ?? "Custom",
    title: input.title,
    notes: input.notes ?? "",
    status: "pending",
    priority: input.priority ?? 3,
    tags: input.tags ?? [],
    weekId: input.weekId ?? null,
    createdAt: now,
    updatedAt: now,
  };
  db.tasks.push(task);
  const remindAt = `${input.dueDate}T09:00:00+02:00`;
  db.reminders.push({
    id: `rem-${task.id}`,
    taskId: task.id,
    remindAt,
    sentAt: null,
    snoozeUntil: null,
  });
  saveDatabase(db);
  return task;
}

export function updateTask(
  id: string,
  patch: Partial<Pick<Task, "title" | "notes" | "dueDate" | "priority" | "status" | "job" | "tags" | "weekId">>,
  db = loadDatabase(),
): Task | null {
  const idx = db.tasks.findIndex((t) => t.id === id);
  if (idx < 0) return null;
  const next = touch({ ...db.tasks[idx], ...patch });
  db.tasks[idx] = next;
  saveDatabase(db);
  return next;
}

export function completeTask(id: string, db = loadDatabase()): Task | null {
  return updateTask(id, { status: "done" }, db);
}

export function listReminders(
  opts: { dueOnly?: boolean } = {},
  db = loadDatabase(),
): Array<Reminder & { taskTitle: string | null }> {
  const now = Date.now();
  return db.reminders
    .map((r) => ({
      ...r,
      taskTitle: db.tasks.find((t) => t.id === r.taskId)?.title ?? null,
    }))
    .filter((r) => {
      if (!opts.dueOnly) return true;
      const at = new Date(r.snoozeUntil ?? r.remindAt).getTime();
      return at <= now && !r.sentAt;
    })
    .sort((a, b) => (a.snoozeUntil ?? a.remindAt).localeCompare(b.snoozeUntil ?? b.remindAt));
}

export function snoozeReminder(id: string, untilIso: string, db = loadDatabase()): Reminder | null {
  const idx = db.reminders.findIndex((r) => r.id === id);
  if (idx < 0) return null;
  db.reminders[idx] = {
    ...db.reminders[idx],
    snoozeUntil: untilIso,
    sentAt: null,
  };
  saveDatabase(db);
  return db.reminders[idx];
}

export function markReminderSent(id: string, db = loadDatabase()): Reminder | null {
  const idx = db.reminders.findIndex((r) => r.id === id);
  if (idx < 0) return null;
  db.reminders[idx] = { ...db.reminders[idx], sentAt: new Date().toISOString() };
  saveDatabase(db);
  return db.reminders[idx];
}

export function listKpis(db = loadDatabase()): Kpi[] {
  return db.kpis;
}

export function updateKpi(id: string, current: string, db = loadDatabase()): Kpi | null {
  const idx = db.kpis.findIndex((k) => k.id === id);
  if (idx < 0) return null;
  db.kpis[idx] = { ...db.kpis[idx], current };
  saveDatabase(db);
  return db.kpis[idx];
}

export function listProductBets(db = loadDatabase()): ProductBet[] {
  return db.productBets;
}

export function updateProductBet(id: string, status: ProductBetStatus, db = loadDatabase()): ProductBet | null {
  const idx = db.productBets.findIndex((b) => b.id === id);
  if (idx < 0) return null;
  db.productBets[idx] = { ...db.productBets[idx], status };
  saveDatabase(db);
  return db.productBets[idx];
}

export function listCadence(db = loadDatabase()) {
  return db.cadence;
}

export function addNote(body: string, taskId: string | null = null, db = loadDatabase()): Note {
  const note: Note = {
    id: `note-${Date.now()}`,
    body,
    taskId,
    createdAt: new Date().toISOString(),
  };
  db.notes.unshift(note);
  saveDatabase(db);
  return note;
}

export function listNotes(db = loadDatabase()) {
  return db.notes;
}

export function scorecard(db = loadDatabase()) {
  const today = getToday(db);
  const byStatus = (status: TaskStatus) => db.tasks.filter((t) => t.status === status).length;
  return {
    generatedAt: new Date().toISOString(),
    today: today.today,
    dueTodayCount: today.dueToday.length,
    overdueCount: today.overdue.length,
    dueToday: today.dueToday,
    overdue: today.overdue,
    taskCounts: {
      pending: byStatus("pending"),
      in_progress: byStatus("in_progress"),
      done: byStatus("done"),
      skipped: byStatus("skipped"),
      blocked: byStatus("blocked"),
      total: db.tasks.length,
    },
    kpis: db.kpis,
    plan: db.plan,
    activeBets: db.productBets.filter((b) => b.status === "active" || b.status === "planned"),
  };
}

export function getSnapshot() {
  const db = loadDatabase();
  return {
    dataPath: resolveDbPath(),
    plan: db.plan,
    weeks: listWeeks(db),
    tasks: listTasks({}, db),
    productBets: listProductBets(db),
    cadence: listCadence(db),
    reminders: listReminders({}, db),
    kpis: listKpis(db),
    notes: listNotes(db),
    today: getToday(db),
  };
}
