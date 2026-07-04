// ─────────────────────────────────────────────────────────────
// Schema barrel export
// ─────────────────────────────────────────────────────────────

// ── Core (shared) ─────────────────────────────────────────────
export * from "./companies";
export * from "./locations";
export * from "./users";
export * from "./audit";

// ── CRM ───────────────────────────────────────────────────────
export * from "./contacts";
export * from "./conversations";
export * from "./appointments";
export * from "./pipelines";
export * from "./automations";

// ── Support ───────────────────────────────────────────────────
export * from "./tickets";

// ── POS (deprecated — kept for data history) ──────────────────
export * from "./items";
export * from "./orders";
export * from "./fiscal";

