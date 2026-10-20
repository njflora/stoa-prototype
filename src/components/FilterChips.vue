<script setup lang="ts" generic="T extends string">
// A row of pill buttons where one is chosen, such as Newest / Oldest.
// Used for show filters, article categories and shop categories.
// New concept: `generic="T"` makes the component typed by its options,
// so a parent passing 'newest' | 'oldest' gets exactly that type back.

defineProps<{
  /** Read out to screen readers, such as "Sort". */
  label: string
  options: { value: T; label: string; count?: number }[]
}>()

const model = defineModel<T>({ required: true })
</script>

<template>
  <div role="group" :aria-label="label" class="flex flex-wrap gap-1.5">
    <button
      v-for="option in options"
      :key="option.value"
      type="button"
      :aria-pressed="model === option.value"
      class="inline-flex min-h-8 items-center gap-1.5 rounded-full px-3.5 text-sm font-medium ring-1 transition"
      :class="
        model === option.value
          ? 'bg-accent text-white ring-accent'
          : 'bg-surface text-white/80 ring-white/10 hover:bg-raised hover:text-white'
      "
      @click="model = option.value"
    >
      {{ option.label }}
      <span v-if="option.count !== undefined" class="text-xs tabular-nums opacity-70">
        {{ option.count.toLocaleString('en-GB') }}
      </span>
    </button>
  </div>
</template>
