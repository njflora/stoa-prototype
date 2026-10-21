// Fetches JSON from the data API. There are two modes, set by VITE_API_MODE:
//
// - "laravel": the Laravel API in backend/, the source of truth. In
//   development Vite passes /api through to it (see vite.config.ts).
// - "static" (the default): the snapshot of that API in public/data, written
//   by `php artisan stoa:export`. It needs no server, so it works on GitHub
//   Pages. It is a snapshot, and anyone can read every file in it.

export const API_MODE: 'laravel' | 'static' = import.meta.env.VITE_API_MODE === 'laravel' ? 'laravel' : 'static'

const API_BASE = API_MODE === 'laravel' ? '/api/' : `${import.meta.env.BASE_URL}data/`

/** The request for the current mode: an API path, or the static file that stands in for it. */
export const pick = (api: string, file: string) => (API_MODE === 'laravel' ? api : file)

/** "show=chronos&page=2", leaving out anything not set. */
export function query(params: Record<string, string | number | undefined>): string {
  const set = Object.entries(params).filter((entry): entry is [string, string | number] => entry[1] !== undefined)
  return new URLSearchParams(set.map(([key, value]) => [key, String(value)])).toString()
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const response = await fetch(API_BASE + path, {
    ...init,
    headers: { Accept: 'application/json', ...(init.body ? { 'Content-Type': 'application/json' } : {}), ...init.headers },
  })
  if (!response.ok) throw new ApiError(response.status, `Could not load ${path} (${response.status})`)
  return response.json() as Promise<T>
}

export class ApiError extends Error {
  constructor(
    readonly status: number,
    message: string,
  ) {
    super(message)
  }
}

/**
 * Data that depends on who is signed in (threads, the account), so it is
 * never cached: switching viewer and asking again gives the new answer.
 */
export function getFresh<T>(path: string): Promise<T> {
  return request<T>(path)
}

// Laravel protects every change against cross-site requests (CSRF): it
// sets an XSRF-TOKEN cookie, and each change sends it back in a header.
let csrfReady: Promise<unknown> | null = null
function xsrfToken(): string {
  const cookie = document.cookie.split('; ').find((c) => c.startsWith('XSRF-TOKEN='))
  return cookie ? decodeURIComponent(cookie.slice('XSRF-TOKEN='.length)) : ''
}

/** A change, such as posting a comment: POST (or DELETE) with a JSON body. Laravel mode only. */
export async function send<T>(method: 'POST' | 'DELETE', path: string, body?: unknown): Promise<T> {
  csrfReady ??= fetch('/sanctum/csrf-cookie').catch(() => (csrfReady = null))
  await csrfReady
  return request<T>(path, {
    method,
    body: body === undefined ? undefined : JSON.stringify(body),
    headers: { 'X-XSRF-TOKEN': xsrfToken() },
  })
}

// Each file is fetched at most once per visit. Storing the promise (not the
// result) means two components asking at the same moment share one request.
const cache = new Map<string, Promise<unknown>>()
/** Enough for any page and the way back, without growing for ever on a long visit. */
const CACHE_LIMIT = 200

export function getJson<T>(path: string): Promise<T> {
  let request = cache.get(path) as Promise<T> | undefined
  if (request) {
    // Used again: move it to the end, so the oldest unused files go first.
    cache.delete(path)
    cache.set(path, request)
  }
  if (!request) {
    request = fetch(API_BASE + path, { headers: { Accept: 'application/json' } }).then((response) => {
      if (!response.ok) throw new ApiError(response.status, `Could not load ${path} (${response.status})`)
      return response.json() as Promise<T>
    })
    // A failed request is forgotten, so "Try again" really tries again.
    request.catch(() => cache.delete(path))
    cache.set(path, request)
    if (cache.size > CACHE_LIMIT) cache.delete(cache.keys().next().value!)
  }
  return request
}
