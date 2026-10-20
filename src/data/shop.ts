// The merch shop, in the reference store's format: "Design | Product Region"
// with a price. Prices are the real stores' prices for each product type
// (checked October 2026). The designs are our public-domain paintings.

export type Region = 'uk' | 'global' | 'us'
export type ProductKind = 'tshirt' | 'mug' | 'two-tone-mug'

export const regions: { id: Region; label: string; suffix: string; currency: string }[] = [
  { id: 'uk', label: 'UK', suffix: 'UK', currency: 'GBP' },
  { id: 'global', label: 'Europe and Worldwide', suffix: 'Global', currency: 'USD' },
  { id: 'us', label: 'USA and Canada', suffix: 'US', currency: 'USD' },
]

const prices: Record<ProductKind, Record<Region, number>> = {
  tshirt: { uk: 22.99, global: 27.99, us: 27.99 },
  mug: { uk: 14.99, global: 20.99, us: 20.99 },
  'two-tone-mug': { uk: 14.99, global: 25.99, us: 27.99 },
}

const kindLabel: Record<ProductKind, string> = {
  tshirt: 'T-Shirt',
  mug: 'Mug',
  'two-tone-mug': 'Two-Tone | Mug',
}

export interface Product {
  id: string
  /** The design's name, the first part of the title. */
  design: string
  kind: ProductKind
  /** An artwork id from media.generated.json. */
  artId: string
}

export const products: Product[] = [
  { id: 'agincourt-tee', design: 'Agincourt', kind: 'tshirt', artId: 'agincourt' },
  { id: 'thumbs-down-tee', design: 'Thumbs Down', kind: 'tshirt', artId: 'pollice-verso' },
  { id: 'norham-tee', design: 'Norham Castle', kind: 'tshirt', artId: 'norham-castle' },
  { id: 'geographer-tee', design: 'The Geographer', kind: 'tshirt', artId: 'geographer' },
  { id: 'hagia-sophia-mug', design: 'Hagia Sophia', kind: 'two-tone-mug', artId: 'hagia-sophia' },
  { id: 'school-of-athens-mug', design: 'School of Athens', kind: 'two-tone-mug', artId: 'school-of-athens' },
  { id: 'sunrise-mug', design: 'Sunrise', kind: 'mug', artId: 'impression-sunrise' },
  { id: 'moneylender-mug', design: 'The Moneylender', kind: 'mug', artId: 'moneylender' },
]

/** "Agincourt | T-Shirt UK", as the reference store titles products. */
export function productTitle(product: Product, region: Region): string {
  const suffix = regions.find((r) => r.id === region)!.suffix
  return `${product.design} | ${kindLabel[product.kind]} ${suffix}`
}

export function productPrice(product: Product, region: Region): { amount: number; currency: string } {
  return { amount: prices[product.kind][region], currency: regions.find((r) => r.id === region)!.currency }
}
