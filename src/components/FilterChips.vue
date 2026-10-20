<script setup lang="ts" generic="T extends string">
// A row of pill buttons where one is chosen, such as Newest / Oldest.
// Used for show filters, article categories and shop categories.
// New concept: `generic="T"` makes the component typed by its options,
// so a parent passing 'newest' | 'oldest' gets exactly that type back.

defineProps<{
  /** Read out to screen readers, such as "Sort". */
  label: string
  options: { value: T; label: string; count?: number }[]
  /** On phones, one row that swipes sideways instead of wrapping onto many lines. */
  scroll?: boolean
}>()

const model = defineModel<T>({ required: true })
</script>

<template>
  <div
    role="group"
    :aria-label="label"
    class="flex gap-1.5"
    :class="scroll ? 'max-sm:-mx-4 max-sm:overflow-x-auto max-sm:px-4 max-sm:[scrollbar-width:none] sm:flex-wrap' : 'flex-wrap'"
  >
    <button
      v-for="option in options"
      :key="option.value"
      type="button"
      :aria-pressed="model === option.value"
      class="inline-flex min-h-8 shrink-0 items-center gap-1.5 rounded-full px-3.5 text-sm font-medium whitespace-nowrap ring-1 transition"
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
