<script setup lang="ts">
// A small set of inline icons, so the site needs no icon library.
// Icons are decorative: the button or link around them carries the label.

export type IconName =
  | 'lock'
  | 'search'
  | 'play'
  | 'chevron-left'
  | 'chevron-right'
  | 'volume-off'
  | 'volume-on'
  | 'info'
  | 'bell'
  | 'check'
  | 'shop'
  | 'crown'

defineProps<{ name: IconName }>()

const paths: Record<IconName, string> = {
  lock: 'M7 11V8a5 5 0 0 1 10 0v3M5 11h14v10H5z',
  search: 'M11 4a7 7 0 1 0 0 14 7 7 0 0 0 0-14zM21 21l-5-5',
  play: 'M7 4.5v15l12-7.5z',
  'chevron-left': 'M15 5l-7 7 7 7',
  'chevron-right': 'M9 5l7 7-7 7',
  'volume-off': 'M4 9v6h4l5 4V5L8 9zM16 9l5 6M21 9l-5 6',
  'volume-on': 'M4 9v6h4l5 4V5L8 9zM16 8.5a5 5 0 0 1 0 7M18.5 6a8.5 8.5 0 0 1 0 12',
  info: 'M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20zM12 11v6M12 7.5v.5',
  bell: 'M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9M10.3 21a1.94 1.94 0 0 0 3.4 0',
  check: 'M5 12l5 5L20 7',
  shop: 'M6 8h12l1 12H5zM9 8a3 3 0 0 1 6 0',
  crown: 'M3 8l4.5 4L12 5l4.5 7L21 8l-2 11H5z',
}
</script>

<template>
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="2"
    stroke-linecap="round"
    stroke-linejoin="round"
    aria-hidden="true"
    class="size-5 shrink-0"
  >
    <path :d="paths[name]" :fill="name === 'play' ? 'currentColor' : 'none'" />
  </svg>
</template>
