// Client-side session ID — persisted in sessionStorage for budget tracking
let _id: string | null = null;

export function getSessionId(): string {
  if (!_id) {
    _id = sessionStorage.getItem("cf_sid") ?? crypto.randomUUID();
    sessionStorage.setItem("cf_sid", _id);
  }
  return _id;
}
