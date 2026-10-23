// A page's view kept in the address, such as ?sort=popular&period=week&page=2,
// so it can be shared and Back returns to it. Each field says how to read
// its value from the address and how to write it back. Defaults are left
// out, so the address stays short. useAddressState connects this to the router.

export interface AddressField<T, V> {
  /** The value from the address. Anything missing or unknown becomes the default. */
  read: (raw: unknown) => T
  /** The text for the address, or undefined to leave the field out. */
  write: (value: T, view: V) => string | undefined
}

export type AddressFields<V> = { [K in keyof V]: AddressField<V[K], V> }

/**
 * One of a fixed set of values, such as a sort order. The fallback is left
 * out of the address, and so is the field when `when` says it does not apply
 * (a period only matters when sorting by popular).
 */
export function oneOf<T extends string, V = unknown>(
  values: readonly T[],
  fallback: T,
  when?: (view: V) => boolean,
): AddressField<T, V> {
  return {
    read: (raw) => values.find((value) => value === raw) ?? fallback,
    write: (value, view) => (value === fallback || (when && !when(view)) ? undefined : value),
  }
}

/** A page number: counted from 1 in the address, from 0 in the code. Page 1 is left out. */
export function pageField<V = unknown>(): AddressField<number, V> {
  return {
    read: (raw) => Math.max(0, (Number(raw) || 1) - 1),
    write: (page) => (page > 0 ? String(page + 1) : undefined),
  }
}

/** Every field's value, from the address's query. */
export function readView<V>(fields: AddressFields<V>, query: Record<string, unknown>): V {
  const view = {} as V
  for (const key in fields) view[key] = fields[key].read(query[key])
  return view
}

/** The query for a view, in the order the fields are listed, without defaults. */
export function writeQuery<V>(fields: AddressFields<V>, view: V): Record<string, string> {
  const query: Record<string, string> = {}
  for (const key in fields) {
    const text = fields[key].write(view[key], view)
    if (text !== undefined) query[key] = text
  }
  return query
}
