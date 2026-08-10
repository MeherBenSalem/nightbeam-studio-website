import { reseedDatabase, resolveDbPath } from "../store/db.js";

const force = process.argv.includes("--force");
const db = reseedDatabase(force);
console.log(`Seeded NightBeam Ops DB at ${resolveDbPath()}`);
console.log(`Tasks: ${db.tasks.length}, Weeks: ${db.weeks.length}, Reminders: ${db.reminders.length}`);
console.log(`KPIs: ${db.kpis.length}, Product bets: ${db.productBets.length}, Cadence: ${db.cadence.length}`);
