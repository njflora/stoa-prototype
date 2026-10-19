// Small wrappers around localStorage. Storage can be missing or blocked
// (private windows, strict settings), so every call is guarded and the
// site falls back to defaults instead of breaking.

export function readJson<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : fallback
  } catch {
    return fallback
  }
}

export function writeJson(key: string, value: unknown): void {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    // Nothing to do: the value simply will not persist.
  }
}
