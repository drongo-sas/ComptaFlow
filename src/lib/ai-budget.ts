// In-memory token budget tracker — replace Map with Redis/DB in production
const SESSION_LIMIT = 20_000; // tokens per session
const budgets = new Map<string, number>();

export function getRemainingBudget(sessionId: string): number {
  return SESSION_LIMIT - (budgets.get(sessionId) ?? 0);
}

export function consumeBudget(sessionId: string, tokens: number): void {
  budgets.set(sessionId, (budgets.get(sessionId) ?? 0) + tokens);
}
