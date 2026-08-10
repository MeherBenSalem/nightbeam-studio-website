import { useCallback, useEffect, useMemo, useState } from "react";

type Tab = "today" | "plan" | "tasks" | "products" | "cadence" | "kpis" | "reminders";

interface Snapshot {
  dataPath: string;
  plan: {
    title: string;
    windowStart: string;
    windowEnd: string;
    diagnosis: string;
    ultimateTask: string;
    targets: string[];
    funnel: string;
  };
  weeks: Array<{ id: string; label: string; theme: string; goal: string }>;
  tasks: Array<{
    id: string;
    dueDate: string;
    job: string;
    title: string;
    notes: string;
    status: string;
    priority: number;
    tags: string[];
    weekId: string | null;
  }>;
  productBets: Array<{
    id: string;
    platform: string;
    name: string;
    why: string;
    action: string;
    price: string;
    status: string;
  }>;
  cadence: Array<{ id: string; whenLabel: string; type: string; what: string; recurring: boolean }>;
  reminders: Array<{
    id: string;
    taskId: string;
    remindAt: string;
    sentAt: string | null;
    snoozeUntil: string | null;
    taskTitle: string | null;
  }>;
  kpis: Array<{ id: string; name: string; baseline: string; target: string; current: string; ritual: string }>;
  notes: Array<{ id: string; body: string; taskId: string | null; createdAt: string }>;
  today: {
    today: string;
    dueToday: Snapshot["tasks"];
    overdue: Snapshot["tasks"];
  };
}

async function api(): Promise<NightbeamOpsApi> {
  if (window.nightbeamOps) return window.nightbeamOps;
  throw new Error("NightBeam Ops API unavailable. Open this UI inside the Electron app.");
}

function statusPill(status: string) {
  if (status === "done") return "ok";
  if (status === "blocked") return "danger";
  if (status === "in_progress") return "warn";
  return "";
}

function hoursFromNow(h: number) {
  return new Date(Date.now() + h * 3600_000).toISOString();
}

function tomorrowNine() {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  d.setHours(9, 0, 0, 0);
  return d.toISOString();
}

export function App() {
  const [tab, setTab] = useState<Tab>("today");
  const [snap, setSnap] = useState<Snapshot | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState("all");
  const [weekFilter, setWeekFilter] = useState("all");
  const [noteBody, setNoteBody] = useState("");
  const [newTitle, setNewTitle] = useState("");
  const [newDue, setNewDue] = useState("");

  const refresh = useCallback(async () => {
    try {
      const client = await api();
      const data = (await client.getSnapshot()) as Snapshot;
      setSnap(data);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    }
  }, []);

  useEffect(() => {
    void refresh();
    const t = setInterval(() => void refresh(), 15_000);
    return () => clearInterval(t);
  }, [refresh]);

  const filteredTasks = useMemo(() => {
    if (!snap) return [];
    return snap.tasks.filter((t) => {
      if (statusFilter !== "all" && t.status !== statusFilter) return false;
      if (weekFilter !== "all" && t.weekId !== weekFilter) return false;
      return true;
    });
  }, [snap, statusFilter, weekFilter]);

  async function complete(id: string) {
    const client = await api();
    await client.completeTask(id);
    await refresh();
  }

  async function setStatus(id: string, status: string) {
    const client = await api();
    await client.updateTask(id, { status });
    await refresh();
  }

  async function snooze(id: string, until: string) {
    const client = await api();
    await client.snoozeReminder(id, until);
    await refresh();
  }

  async function saveKpi(id: string, current: string) {
    const client = await api();
    await client.updateKpi(id, current);
    await refresh();
  }

  async function saveBet(id: string, status: string) {
    const client = await api();
    await client.updateProductBet(id, status);
    await refresh();
  }

  async function submitNote() {
    if (!noteBody.trim()) return;
    const client = await api();
    await client.addNote(noteBody.trim());
    setNoteBody("");
    await refresh();
  }

  async function submitTask() {
    if (!newTitle.trim() || !newDue) return;
    const client = await api();
    await client.createTask({ title: newTitle.trim(), dueDate: newDue, job: "Custom" });
    setNewTitle("");
    setNewDue("");
    await refresh();
  }

  const tabs: Array<{ id: Tab; label: string }> = [
    { id: "today", label: "Today" },
    { id: "plan", label: "Plan" },
    { id: "tasks", label: "Tasks" },
    { id: "products", label: "Products" },
    { id: "cadence", label: "Cadence" },
    { id: "kpis", label: "KPIs" },
    { id: "reminders", label: "Reminders" },
  ];

  return (
    <div className="app">
      <nav className="nav">
        <div className="brand">NIGHTBEAM OPS</div>
        {tabs.map((t) => (
          <button key={t.id} type="button" className={tab === t.id ? "active" : ""} onClick={() => setTab(t.id)}>
            {t.label}
          </button>
        ))}
        <div style={{ flex: 1 }} />
        <button type="button" onClick={() => void refresh()}>
          Refresh
        </button>
      </nav>

      <main className="main">
        {error ? <div className="card" style={{ borderColor: "var(--danger)" }}>{error}</div> : null}
        {!snap && !error ? <div className="empty">Loading…</div> : null}

        {snap && tab === "today" ? (
          <>
            <h1>Today · {snap.today.today}</h1>
            <p className="sub">{snap.plan.title}</p>
            <div className="stats">
              <div className="stat"><div className="v">{snap.today.dueToday.length}</div><div className="l">Due today</div></div>
              <div className="stat"><div className="v">{snap.today.overdue.length}</div><div className="l">Overdue</div></div>
              <div className="stat"><div className="v">{snap.tasks.filter((t) => t.status === "done").length}</div><div className="l">Done</div></div>
              <div className="stat"><div className="v">{snap.tasks.length}</div><div className="l">Total tasks</div></div>
            </div>

            <div className="grid two">
              <section className="card">
                <h2>Due today</h2>
                {snap.today.dueToday.length === 0 ? <div className="empty">Nothing due — ship something anyway.</div> : null}
                {snap.today.dueToday.map((t) => (
                  <div className="task" key={t.id}>
                    <div>
                      <div className="title">{t.title}</div>
                      <div className="muted"><span className="pill">{t.job}</span> · {t.dueDate}</div>
                    </div>
                    <div className="row">
                      <button type="button" className="btn" onClick={() => void setStatus(t.id, "in_progress")}>Start</button>
                      <button type="button" className="btn ok" onClick={() => void complete(t.id)}>Done</button>
                    </div>
                  </div>
                ))}
              </section>
              <section className="card">
                <h2>Overdue</h2>
                {snap.today.overdue.length === 0 ? <div className="empty">Clear — nice.</div> : null}
                {snap.today.overdue.map((t) => (
                  <div className="task" key={t.id}>
                    <div>
                      <div className="title">{t.title}</div>
                      <div className="muted"><span className={`pill ${statusPill(t.status)}`}>{t.status}</span> · {t.dueDate}</div>
                    </div>
                    <div className="row">
                      <button type="button" className="btn ok" onClick={() => void complete(t.id)}>Done</button>
                      <button type="button" className="btn" onClick={() => void setStatus(t.id, "skipped")}>Skip</button>
                    </div>
                  </div>
                ))}
              </section>
            </div>
          </>
        ) : null}

        {snap && tab === "plan" ? (
          <>
            <h1>Growth plan</h1>
            <p className="sub">{snap.plan.windowStart} → {snap.plan.windowEnd}</p>
            <div className="grid">
              <section className="card">
                <h3>Diagnosis</h3>
                <p className="muted">{snap.plan.diagnosis}</p>
              </section>
              <section className="card">
                <h3>Ultimate task</h3>
                <p>{snap.plan.ultimateTask}</p>
              </section>
              <section className="card">
                <h3>Funnel</h3>
                <p className="muted">{snap.plan.funnel}</p>
              </section>
              <section className="card">
                <h3>North-star targets</h3>
                <ul>{snap.plan.targets.map((t) => <li key={t}>{t}</li>)}</ul>
              </section>
              <section className="card">
                <h3>Weeks</h3>
                {snap.weeks.map((w) => (
                  <div key={w.id} style={{ marginBottom: 12 }}>
                    <div className="title">{w.label} — {w.theme}</div>
                    <div className="muted">{w.goal}</div>
                  </div>
                ))}
              </section>
              <section className="card">
                <h3>CEO notes</h3>
                <textarea rows={3} value={noteBody} onChange={(e) => setNoteBody(e.target.value)} placeholder="Add a note…" />
                <div className="row" style={{ marginTop: 8 }}>
                  <button type="button" className="btn primary" onClick={() => void submitNote()}>Save note</button>
                </div>
                {snap.notes.map((n) => (
                  <div key={n.id} style={{ marginTop: 10 }}>
                    <div className="muted">{new Date(n.createdAt).toLocaleString()}</div>
                    <div>{n.body}</div>
                  </div>
                ))}
              </section>
              <section className="card">
                <div className="muted">Data file: {snap.dataPath}</div>
              </section>
            </div>
          </>
        ) : null}

        {snap && tab === "tasks" ? (
          <>
            <h1>Tasks</h1>
            <p className="sub">Full Aug–Sep calendar + custom work</p>
            <div className="row" style={{ marginBottom: 12 }}>
              <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} style={{ width: 160 }}>
                <option value="all">All statuses</option>
                <option value="pending">pending</option>
                <option value="in_progress">in_progress</option>
                <option value="done">done</option>
                <option value="skipped">skipped</option>
                <option value="blocked">blocked</option>
              </select>
              <select value={weekFilter} onChange={(e) => setWeekFilter(e.target.value)} style={{ width: 180 }}>
                <option value="all">All weeks</option>
                {snap.weeks.map((w) => <option key={w.id} value={w.id}>{w.label}</option>)}
              </select>
            </div>
            <section className="card" style={{ marginBottom: 12 }}>
              <h3>Create task</h3>
              <div className="row">
                <input style={{ flex: 1 }} placeholder="Title" value={newTitle} onChange={(e) => setNewTitle(e.target.value)} />
                <input style={{ width: 160 }} type="date" value={newDue} onChange={(e) => setNewDue(e.target.value)} />
                <button type="button" className="btn primary" onClick={() => void submitTask()}>Add</button>
              </div>
            </section>
            <section className="card">
              {filteredTasks.map((t) => (
                <div className="task" key={t.id}>
                  <div>
                    <div className="title">{t.title}</div>
                    <div className="muted">
                      <span className={`pill ${statusPill(t.status)}`}>{t.status}</span>{" "}
                      <span className="pill">{t.job}</span> · {t.dueDate}
                    </div>
                  </div>
                  <div className="row">
                    <button type="button" className="btn" onClick={() => void setStatus(t.id, "in_progress")}>Start</button>
                    <button type="button" className="btn ok" onClick={() => void complete(t.id)}>Done</button>
                    <button type="button" className="btn" onClick={() => void setStatus(t.id, "blocked")}>Block</button>
                  </div>
                </div>
              ))}
            </section>
          </>
        ) : null}

        {snap && tab === "products" ? (
          <>
            <h1>Product bets</h1>
            <p className="sub">Push / pause revenue SKUs</p>
            <section className="card">
              <table>
                <thead>
                  <tr>
                    <th>Platform</th>
                    <th>Product</th>
                    <th>Action</th>
                    <th>Price</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {snap.productBets.map((b) => (
                    <tr key={b.id}>
                      <td>{b.platform}</td>
                      <td>
                        <div className="title">{b.name}</div>
                        <div className="muted">{b.why}</div>
                      </td>
                      <td className="muted">{b.action}</td>
                      <td>{b.price}</td>
                      <td>
                        <select value={b.status} onChange={(e) => void saveBet(b.id, e.target.value)}>
                          <option value="planned">planned</option>
                          <option value="active">active</option>
                          <option value="paused">paused</option>
                          <option value="done">done</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </section>
          </>
        ) : null}

        {snap && tab === "cadence" ? (
          <>
            <h1>Scheduled cadence</h1>
            <p className="sub">Recurring rituals + campaign dates</p>
            <section className="card">
              <table>
                <thead>
                  <tr><th>When</th><th>Type</th><th>What</th><th></th></tr>
                </thead>
                <tbody>
                  {snap.cadence.map((c) => (
                    <tr key={c.id}>
                      <td>{c.whenLabel}</td>
                      <td><span className="pill">{c.type}</span></td>
                      <td>{c.what}</td>
                      <td>{c.recurring ? <span className="pill ok">recurring</span> : <span className="pill">one-shot</span>}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </section>
          </>
        ) : null}

        {snap && tab === "kpis" ? (
          <>
            <h1>Scorecard</h1>
            <p className="sub">Update currents every Monday</p>
            <section className="card">
              <table>
                <thead>
                  <tr><th>KPI</th><th>Baseline</th><th>Target</th><th>Current</th><th>Ritual</th></tr>
                </thead>
                <tbody>
                  {snap.kpis.map((k) => (
                    <tr key={k.id}>
                      <td>{k.name}</td>
                      <td className="muted">{k.baseline}</td>
                      <td>{k.target}</td>
                      <td>
                        <input
                          defaultValue={k.current}
                          onBlur={(e) => {
                            if (e.target.value !== k.current) void saveKpi(k.id, e.target.value);
                          }}
                        />
                      </td>
                      <td className="muted">{k.ritual}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </section>
          </>
        ) : null}

        {snap && tab === "reminders" ? (
          <>
            <h1>Reminders</h1>
            <p className="sub">Default 09:00 Europe/Paris · OS notifications while the app is running</p>
            <section className="card">
              {snap.reminders.map((r) => (
                <div className="task" key={r.id}>
                  <div>
                    <div className="title">{r.taskTitle ?? r.taskId}</div>
                    <div className="muted">
                      remind {r.remindAt}
                      {r.snoozeUntil ? ` · snoozed until ${r.snoozeUntil}` : ""}
                      {r.sentAt ? ` · sent ${r.sentAt}` : ""}
                    </div>
                  </div>
                  <div className="row">
                    <button type="button" className="btn" onClick={() => void snooze(r.id, hoursFromNow(1))}>+1h</button>
                    <button type="button" className="btn" onClick={() => void snooze(r.id, tomorrowNine())}>Tomorrow</button>
                  </div>
                </div>
              ))}
            </section>
          </>
        ) : null}
      </main>
    </div>
  );
}
