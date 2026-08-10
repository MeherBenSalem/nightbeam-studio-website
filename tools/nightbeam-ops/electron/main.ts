import {
  app,
  BrowserWindow,
  Notification,
  Tray,
  Menu,
  nativeImage,
  ipcMain,
  shell,
} from "electron";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  addNote,
  completeTask,
  createTask,
  getSnapshot,
  listReminders,
  loadDatabase,
  markReminderSent,
  resolveDbPath,
  snoozeReminder,
  updateKpi,
  updateProductBet,
  updateTask,
} from "../src/store/db.js";
import type { ProductBetStatus, TaskStatus } from "../src/store/types.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const isDev = process.env.ELECTRON_DEV === "1";

let mainWindow: BrowserWindow | null = null;
let tray: Tray | null = null;
let reminderTimer: NodeJS.Timeout | null = null;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1180,
    height: 800,
    minWidth: 900,
    minHeight: 600,
    backgroundColor: "#0b0f1a",
    title: "NightBeam Ops",
    webPreferences: {
      preload: path.join(__dirname, "preload.cjs"),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  if (isDev) {
    void mainWindow.loadURL("http://127.0.0.1:5179");
  } else {
    void mainWindow.loadFile(path.join(__dirname, "..", "dist", "index.html"));
  }

  mainWindow.on("closed", () => {
    mainWindow = null;
  });
}

function createTray() {
  const icon = nativeImage.createEmpty();
  tray = new Tray(icon);
  tray.setToolTip("NightBeam Ops");
  tray.setContextMenu(
    Menu.buildFromTemplate([
      {
        label: "Open Ops",
        click: () => {
          if (!mainWindow) createWindow();
          else mainWindow.show();
        },
      },
      {
        label: "Open data folder",
        click: () => void shell.showItemInFolder(resolveDbPath()),
      },
      { type: "separator" },
      { label: "Quit", click: () => app.quit() },
    ]),
  );
}

function pollReminders() {
  const due = listReminders({ dueOnly: true });
  for (const rem of due) {
    if (!Notification.isSupported()) break;
    const n = new Notification({
      title: "NightBeam Ops reminder",
      body: rem.taskTitle ?? rem.taskId,
    });
    n.show();
    markReminderSent(rem.id);
  }
}

function registerIpc() {
  ipcMain.handle("ops:getSnapshot", () => getSnapshot());
  ipcMain.handle("ops:completeTask", (_e, id: string) => completeTask(id));
  ipcMain.handle("ops:updateTask", (_e, id: string, patch: Record<string, unknown>) =>
    updateTask(id, patch as Partial<{ title: string; notes: string; dueDate: string; priority: number; status: TaskStatus; job: string; tags: string[]; weekId: string | null }>),
  );
  ipcMain.handle("ops:createTask", (_e, input: Record<string, unknown>) =>
    createTask(input as { title: string; dueDate: string; job?: string; notes?: string; priority?: number; tags?: string[]; weekId?: string | null }),
  );
  ipcMain.handle("ops:snoozeReminder", (_e, id: string, untilIso: string) => snoozeReminder(id, untilIso));
  ipcMain.handle("ops:updateKpi", (_e, id: string, current: string) => updateKpi(id, current));
  ipcMain.handle("ops:addNote", (_e, body: string, taskId?: string) => addNote(body, taskId ?? null));
  ipcMain.handle("ops:updateProductBet", (_e, id: string, status: string) =>
    updateProductBet(id, status as ProductBetStatus),
  );
  ipcMain.handle("ops:getDataPath", () => resolveDbPath());
}

app.whenReady().then(() => {
  loadDatabase();
  registerIpc();
  createWindow();
  createTray();
  pollReminders();
  reminderTimer = setInterval(pollReminders, 60_000);

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    // keep tray alive on Windows — don't quit
  }
});

app.on("before-quit", () => {
  if (reminderTimer) clearInterval(reminderTimer);
});
