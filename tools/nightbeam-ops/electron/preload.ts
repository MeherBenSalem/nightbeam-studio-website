import { contextBridge, ipcRenderer } from "electron";

contextBridge.exposeInMainWorld("nightbeamOps", {
  getSnapshot: () => ipcRenderer.invoke("ops:getSnapshot"),
  completeTask: (id: string) => ipcRenderer.invoke("ops:completeTask", id),
  updateTask: (id: string, patch: Record<string, unknown>) =>
    ipcRenderer.invoke("ops:updateTask", id, patch),
  createTask: (input: Record<string, unknown>) => ipcRenderer.invoke("ops:createTask", input),
  snoozeReminder: (id: string, untilIso: string) =>
    ipcRenderer.invoke("ops:snoozeReminder", id, untilIso),
  updateKpi: (id: string, current: string) => ipcRenderer.invoke("ops:updateKpi", id, current),
  addNote: (body: string, taskId?: string) => ipcRenderer.invoke("ops:addNote", body, taskId),
  updateProductBet: (id: string, status: string) =>
    ipcRenderer.invoke("ops:updateProductBet", id, status),
  getDataPath: () => ipcRenderer.invoke("ops:getDataPath"),
});
