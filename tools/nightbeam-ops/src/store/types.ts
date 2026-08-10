export type TaskStatus = "pending" | "in_progress" | "done" | "skipped" | "blocked";
export type ProductBetStatus = "planned" | "active" | "paused" | "done";

export interface PlanMeta {
  id: string;
  title: string;
  windowStart: string;
  windowEnd: string;
  diagnosis: string;
  ultimateTask: string;
  targets: string[];
  funnel: string;
}

export interface Week {
  id: string;
  label: string;
  theme: string;
  goal: string;
  sortOrder: number;
}

export interface Task {
  id: string;
  dueDate: string;
  job: string;
  title: string;
  notes: string;
  status: TaskStatus;
  priority: number;
  tags: string[];
  weekId: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ProductBet {
  id: string;
  platform: string;
  name: string;
  why: string;
  action: string;
  price: string;
  status: ProductBetStatus;
}

export interface CadenceEvent {
  id: string;
  whenLabel: string;
  type: string;
  what: string;
  recurring: boolean;
}

export interface Reminder {
  id: string;
  taskId: string;
  remindAt: string;
  sentAt: string | null;
  snoozeUntil: string | null;
}

export interface Kpi {
  id: string;
  name: string;
  baseline: string;
  target: string;
  current: string;
  ritual: string;
}

export interface Note {
  id: string;
  body: string;
  taskId: string | null;
  createdAt: string;
}

export interface OpsDatabase {
  version: number;
  plan: PlanMeta;
  weeks: Week[];
  tasks: Task[];
  productBets: ProductBet[];
  cadence: CadenceEvent[];
  reminders: Reminder[];
  kpis: Kpi[];
  notes: Note[];
}

export interface TaskFilters {
  status?: TaskStatus;
  weekId?: string;
  tag?: string;
  dueDate?: string;
  from?: string;
  to?: string;
}
