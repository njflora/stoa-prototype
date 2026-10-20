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

// Each file is fetched at most once per visit. Storing the promise (not the
// result) means two components asking at the same moment share one request.
const cache = new Map<string, Promise<unknown>>()

export function getJson<T>(path: string): Promise<T> {
  let request = cache.get(path) as Promise<T> | undefined
  if (!request) {
    request = fetch(API_BASE + path, { headers: { Accept: 'application/json' } }).then((response) => {
      if (!response.ok) throw new Error(`Could not load ${path} (${response.status})`)
      return response.json() as Promise<T>
    })
    // A failed request is forgotten, so "Try again" really tries again.
    request.catch(() => cache.delete(path))
    cache.set(path, request)
  }
  return request
}
