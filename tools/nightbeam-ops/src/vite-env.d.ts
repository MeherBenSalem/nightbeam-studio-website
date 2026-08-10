/// <reference types="vite/client" />

interface NightbeamOpsApi {
  getSnapshot: () => Promise<unknown>;
  completeTask: (id: string) => Promise<unknown>;
  updateTask: (id: string, patch: Record<string, unknown>) => Promise<unknown>;
  createTask: (input: Record<string, unknown>) => Promise<unknown>;
  snoozeReminder: (id: string, untilIso: string) => Promise<unknown>;
  updateKpi: (id: string, current: string) => Promise<unknown>;
  addNote: (body: string, taskId?: string) => Promise<unknown>;
  updateProductBet: (id: string, status: string) => Promise<unknown>;
  getDataPath: () => Promise<string>;
}

interface Window {
  nightbeamOps: NightbeamOpsApi;
}
