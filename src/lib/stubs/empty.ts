// Empty stand-in for the "server-only" / "client-only" marker packages so
// worker and CLI scripts can run under plain Node (tsx). Next.js resolves
// the same paths; boundary discipline is enforced by convention + lint.
export {};
