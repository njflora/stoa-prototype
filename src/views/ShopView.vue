<script setup lang="ts">
import { computed, ref } from 'vue'
import AppIcon from '@/components/AppIcon.vue'
import FilterChips from '@/components/FilterChips.vue'
import PitchNote from '@/components/PitchNote.vue'
import { artworks, mediaUrl } from '@/data/media'
import { productPrice, products, productTitle, regions, type Region } from '@/data/shop'
import { formatPrice } from '@/utils/format'

// One shop inside the site. Today the merch sits on three regional stores;
// here a store switch changes titles, prices and currency in place.
// There is no basket: the button says so rather than pretending.

type Category = 'all' | 'tshirt' | 'mug'

// The chosen store is remembered on this device, a small convenience.
function savedRegion(): Region {
  try {
    const value = localStorage.getItem('stoa-shop-region')
    return value === 'global' || value === 'us' ? value : 'uk'
  } catch {
    return 'uk'
  }
}
const region = ref<Region>(savedRegion())
const regionModel = computed({
  get: () => region.value,
  set: (value: Region) => {
    region.value = value
    try {
      localStorage.setItem('stoa-shop-region', value)
    } catch {
      // Storage can be blocked; the choice still applies for this visit.
    }
  },
})

const category = ref<Category>('all')
const isMug = (kind: string) => kind === 'mug' || kind === 'two-tone-mug'
const categoryOptions = [
  { value: 'all' as Category, label: 'All', count: products.length },
  { value: 'tshirt' as Category, label: 'T-Shirts', count: products.filter((p) => p.kind === 'tshirt').length },
  { value: 'mug' as Category, label: 'Mugs', count: products.filter((p) => isMug(p.kind)).length },
]
const regionOptions = regions.map((r) => ({ value: r.id, label: r.label }))

const shown = computed(() =>
  products.filter((p) => category.value === 'all' || (category.value === 'mug' ? isMug(p.kind) : p.kind === category.value)),
)
const art = (id: string) => artworks.find((a) => a.id === id)

const tried = ref<string | null>(null)
</script>

<template>
  <main class="px-4 pt-8 sm:px-8">
    <div class="flex flex-wrap items-center gap-2">
      <h1 class="text-3xl font-bold sm:text-4xl">Shop</h1>
      <PitchNote id="shop-inside" />
    </div>
    <p class="mt-2 max-w-2xl text-white/75">T-shirts and mugs, with designs from the paintings you see across the site.</p>

    <div class="mt-6 flex flex-wrap items-start gap-x-8 gap-y-4">
      <div>
        <p class="mb-2 text-xs font-semibold tracking-wide text-muted uppercase">Store</p>
        <FilterChips v-model="regionModel" label="Store" :options="regionOptions" />
      </div>
      <div>
        <p class="mb-2 text-xs font-semibold tracking-wide text-muted uppercase">Category</p>
        <FilterChips v-model="category" label="Category" :options="categoryOptions" />
      </div>
    </div>

    <div class="mt-6 grid grid-cols-1 gap-4 min-[480px]:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      <article v-for="product in shown" :key="product.id" class="flex min-w-0 flex-col overflow-hidden rounded-xl bg-surface ring-1 ring-white/10">
        <div class="grid aspect-square place-items-center bg-raised p-6">
          <!-- The design shown as a print on the product, framed simply. -->
          <div
            class="overflow-hidden shadow-xl shadow-black/50"
            :class="product.kind === 'tshirt' ? 'aspect-[4/5] w-3/5 rounded-sm' : 'aspect-[4/3] w-4/5 rounded-2xl ring-8 ring-white/90'"
          >
            <img :src="mediaUrl(art(product.artId)!.card)" :alt="art(product.artId)?.alt ?? ''" class="size-full object-cover" loading="lazy" />
          </div>
        </div>
        <div class="flex flex-1 flex-col p-4">
          <h2 class="text-sm leading-snug font-semibold">{{ productTitle(product, region) }}</h2>
          <p class="mt-1 text-lg font-bold">
            {{ formatPrice(productPrice(product, region).amount, productPrice(product, region).currency) }}
          </p>
          <button
            type="button"
            class="mt-3 inline-flex min-h-9 items-center justify-center gap-1.5 rounded-lg bg-accent px-3 text-sm font-semibold text-white transition hover:bg-accent-bright [&>svg]:size-4"
            @click="tried = product.id"
          >
            <AppIcon name="shop" />
            Add to basket
          </button>
          <p v-if="tried === product.id" class="mt-2 text-xs text-white/75" role="status">Checkout is not part of this demo.</p>
        </div>
      </article>
    </div>
  </main>
</template>
