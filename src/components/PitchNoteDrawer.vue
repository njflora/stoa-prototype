<script setup lang="ts">
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue'
import { RouterLink } from 'vue-router'
import AppIcon from './AppIcon.vue'
import { getPitchNote, kindNames } from '@/data/pitchNotes'
import { usePitchMode } from '@/composables/usePitchMode'

// The detail panel for whichever pitch note is open. It sits at the bottom
// of the screen, so it never runs off the edge on phones.
//
// <Teleport to="body"> renders it at the end of the page instead of inside
// the card or row that opened it, where overflow: hidden would clip it.

const { openId, close } = usePitchMode()
const note = computed(() => (openId.value ? getPitchNote(openId.value) : undefined))
const panel = ref<HTMLElement>()
const heading = ref<HTMLElement>()

// Move focus into the panel when it opens, so keyboard users land on it.
watch(openId, async (id) => {
  if (!id) return
  await nextTick()
  heading.value?.focus()
})

function onKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape') close()
}
function onDocumentClick(event: MouseEvent) {
  if (note.value && panel.value && !panel.value.contains(event.target as Node)) close()
}

onMounted(() => {
  document.addEventListener('keydown', onKeydown)
  document.addEventListener('click', onDocumentClick)
})
onUnmounted(() => {
  document.removeEventListener('keydown', onKeydown)
  document.removeEventListener('click', onDocumentClick)
})

const kindStyle = {
  fix: 'bg-accent text-white',
  proposal: 'border border-dashed border-gold text-gold',
  kept: 'bg-white/10 text-white/85',
}
</script>

<template>
  <Teleport to="body">
    <Transition name="drawer">
      <section
        v-if="note"
        id="pitch-drawer"
        ref="panel"
        role="dialog"
        aria-modal="false"
        aria-labelledby="pitch-drawer-title"
        class="fixed inset-x-4 bottom-4 z-[60] mx-auto max-w-lg rounded-xl bg-raised p-4 text-sm shadow-2xl ring-1 ring-white/15 sm:p-5"
      >
        <div class="flex items-start justify-between gap-3">
          <div class="flex flex-wrap items-center gap-2">
            <span class="rounded-full px-2 py-0.5 text-[10px] font-bold tracking-wide uppercase" :class="kindStyle[note.kind]">
              {{ kindNames[note.kind] }}
            </span>
            <span class="text-xs text-muted">{{ note.source }}</span>
          </div>
          <button
            type="button"
            class="grid size-8 shrink-0 place-items-center rounded-full text-white/70 hover:bg-white/10 hover:text-white"
            aria-label="Close pitch note"
            @click="close"
          >
            <span aria-hidden="true" class="text-lg leading-none">×</span>
          </button>
        </div>

        <h2 id="pitch-drawer-title" ref="heading" tabindex="-1" class="mt-2 text-lg font-semibold outline-none">
          {{ note.title }}
        </h2>

        <dl class="mt-3 grid gap-3 sm:grid-cols-2">
          <div>
            <dt class="text-xs font-semibold tracking-wide text-muted uppercase">On the real site today</dt>
            <dd class="mt-1 text-white/85">{{ note.today }}</dd>
          </div>
          <div>
            <dt class="text-xs font-semibold tracking-wide text-muted uppercase">In this prototype</dt>
            <dd class="mt-1 text-white/85">{{ note.here }}</dd>
          </div>
        </dl>

        <p v-if="note.hint" class="mt-3 text-xs text-muted">{{ note.hint }}</p>

        <RouterLink
          to="/pitch"
          class="mt-3 inline-flex items-center gap-1 text-xs font-medium text-accent-bright hover:underline [&>svg]:size-3.5"
          @click="close"
        >
          All pitch notes
          <AppIcon name="chevron-right" />
        </RouterLink>
      </section>
    </Transition>
  </Teleport>
</template>

<style scoped>
.drawer-enter-active,
.drawer-leave-active {
  transition:
    opacity 0.2s ease,
    transform 0.2s ease;
}

.drawer-enter-from,
.drawer-leave-to {
  opacity: 0;
  transform: translateY(12px);
}

@media (prefers-reduced-motion: reduce) {
  .drawer-enter-active,
  .drawer-leave-active {
    transition: none;
  }
}
</style>
