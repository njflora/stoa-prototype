<script setup lang="ts">
import { computed, ref } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import FilterChips from '@/components/FilterChips.vue'
import PageNav from '@/components/PageNav.vue'
import PitchNote from '@/components/PitchNote.vue'
import { API_MODE } from '@/api/client'
import { getDesk, resync, type DeskFilter, type DeskRow } from '@/api/desk'
import { getShow } from '@/data/catalogue'
import { platformLabels, type EpisodeSource, type Platform, type SourceStatus } from '@/data/streams'
import { useQuery } from '@/composables/useQuery'
import { useViewer } from '@/composables/useViewer'
import { formatEditionDate, formatPublished, formatTimeAgo } from '@/utils/format'
import { brand } from '@/config/brand'

// The content desk, for staff: every episode, newest first, with the state
// of its link on Rumble, Odysee, BitChute and the site's own player. One
// record per episode is the source of truth; the platform sync keeps the
// links current, every hour or on demand with Re-sync. The filter and page
// are kept in the address.

const route = useRoute()
const router = useRouter()
const { isStaff, viewer } = useViewer()

const PLATFORMS: Platform[] = ['rumble', 'odysee', 'bitchute', 'vod']
const PROBLEMS: Exclude<SourceStatus, 'linked'>[] = ['pending', 'missing', 'failed']
const statusNames: Record<SourceStatus, string> = {
  linked: 'Linked',
  pending: 'Processing',
  missing: 'Missing',
  failed: 'Failed',
}
const statusStyles: Record<SourceStatus, string> = {
  linked: 'bg-[#2a9d8f]/20 text-[#7fd1c6]',
  pending: 'bg-gold/15 text-gold',
  missing: 'bg-[#ff8a80]/15 text-[#ff8a80]',
  failed: 'bg-live/25 text-[#ff8a80] ring-1 ring-live/50',
}
const columnName = (p: Platform) => (p === 'vod' ? `${brand.playerName} (VOD)` : platformLabels[p])

const filter = computed<DeskFilter>({
  get: () => (typeof route.query.filter === 'string' ? (route.query.filter as DeskFilter) : 'problems'),
  set: (value) => void router.replace({ query: { ...route.query, filter: value, page: undefined } }),
})
const page = computed(() => Math.max(0, Number(route.query.page ?? 0) || 0))

const desk = useQuery(
  () => `${filter.value}|${page.value}|${viewer.value}`,
  () => (isStaff.value ? getDesk(filter.value, page.value) : Promise.resolve(undefined)),
)

/**
 * "Needs attention", "All", then each platform's problems that occur, with
 * counts. (An episode can need attention on more than one platform, so the
 * first has no count: the list says how many episodes.)
 */
const filterOptions = computed(() => {
  const summary = desk.data.value?.summary
  const options: { value: DeskFilter; label: string; count?: number }[] = [
    { value: 'problems', label: 'Needs attention' },
    { value: 'all', label: 'All episodes' },
  ]
  if (summary) {
    for (const p of PLATFORMS) {
      for (const s of PROBLEMS) {
        if (summary[p][s])
          options.push({ value: `${p}-${s}`, label: `${statusNames[s]} on ${columnName(p)}`, count: summary[p][s] })
      }
    }
  }
  return options
})

const sourceOf = (row: DeskRow, platform: Platform): EpisodeSource | undefined =>
  row.sources.find((s) => s.platform === platform)
const titleOf = (row: DeskRow) =>
  row.title ?? `${getShow(row.showId)?.name ?? ''} | ${formatEditionDate(new Date(row.publishedAt))}`

// Re-sync: every platform, now.
const syncing = ref(false)
const syncNote = ref('')
async function runSync() {
  syncing.value = true
  syncNote.value = ''
  try {
    const runs = await resync()
    // The list first, so the message and the list agree.
    await desk.reload()
    const linked = runs.filter((r) => r.linked)
    syncNote.value = linked.length
      ? `Linked ${linked.reduce((n, r) => n + r.linked, 0)} uploads: ${linked.map((r) => `${r.linked} on ${columnName(r.platform)}`).join(', ')}.`
      : 'Everything was already linked. Nothing new.'
  } catch {
    syncNote.value = 'The sync did not run. Please try again.'
  } finally {
    syncing.value = false
  }
}
</script>

<template>
  <main class="px-4 pt-6 pb-16 sm:px-8">
    <div class="flex flex-wrap items-center gap-2">
      <h1 class="text-2xl font-bold sm:text-3xl">Content desk</h1>
      <PitchNote id="one-source" />
    </div>
    <p class="mt-1 max-w-2xl text-sm text-muted">
      Every episode, and where it is published. One record per episode is the source of truth; the platform sync keeps
      its links current every hour.
    </p>

    <!-- Staff only. -->
    <div v-if="!isStaff" class="mt-8 max-w-xl rounded-xl bg-surface p-6 ring-1 ring-white/10">
      <p class="text-lg font-semibold">The content desk is for staff</p>
      <p class="mt-1 text-sm text-white/80">Switch to "Staff" in the demo panel to see it.</p>
    </div>

    <template v-else>
      <!-- Each platform at a glance. -->
      <ul class="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <li v-for="p in PLATFORMS" :key="p" class="rounded-xl bg-surface p-4 ring-1 ring-white/10">
          <p class="font-semibold">{{ columnName(p) }}</p>
          <p class="mt-1 text-2xl font-bold tabular-nums">
            {{ desk.data.value?.summary[p].linked.toLocaleString('en-GB') ?? '…' }}
          </p>
          <p class="text-xs text-muted">linked</p>
          <div v-if="desk.data.value" class="mt-2 flex flex-wrap gap-1.5">
            <button
              v-for="s in PROBLEMS.filter((s) => desk.data.value!.summary[p][s])"
              :key="s"
              type="button"
              class="rounded px-1.5 py-0.5 text-[11px] font-semibold"
              :class="statusStyles[s]"
              @click="filter = `${p}-${s}`"
            >
              {{ desk.data.value.summary[p][s] }} {{ statusNames[s].toLowerCase() }}
            </button>
          </div>
        </li>
      </ul>

      <!-- Phones: the button gets its own line, clear of the scrolling chips. -->
      <div class="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
        <FilterChips v-model="filter" :options="filterOptions" label="Show" scroll class="min-w-0 sm:flex-1" />
        <button
          type="button"
          class="inline-flex min-h-9 items-center gap-2 self-start rounded-lg bg-accent px-4 text-sm font-semibold hover:bg-accent-bright disabled:opacity-60 sm:self-auto"
          :disabled="syncing"
          @click="runSync"
        >
          {{ syncing ? 'Syncing…' : 'Re-sync now' }}
        </button>
      </div>
      <p v-if="syncNote" class="mt-2 text-sm text-white/85" role="status">{{ syncNote }}</p>

      <div class="mt-6 lg:grid lg:grid-cols-[minmax(0,1fr)_320px] lg:items-start lg:gap-6">
        <section aria-labelledby="desk-episodes">
          <h2 id="desk-episodes" class="sr-only">Episodes</h2>
          <p v-if="desk.loading.value && !desk.data.value" class="text-sm text-muted">Loading…</p>
          <p
            v-else-if="desk.data.value && !desk.data.value.items.length"
            class="rounded-xl bg-surface p-6 text-sm ring-1 ring-white/10"
          >
            Nothing here: every link in this view is in order.
          </p>

          <template v-else-if="desk.data.value">
            <p class="mb-2 text-xs text-muted">{{ desk.data.value.total.toLocaleString('en-GB') }} episodes</p>
            <!-- Wide screens: a table. -->
            <table class="hidden w-full text-left text-sm md:table">
              <thead class="text-xs text-muted">
                <tr class="border-b border-white/10">
                  <th scope="col" class="py-2 pr-3 font-medium">Episode</th>
                  <th v-for="p in PLATFORMS" :key="p" scope="col" class="px-2 py-2 font-medium">{{ columnName(p) }}</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="row in desk.data.value.items" :key="row.id" class="border-b border-white/5 align-top">
                  <td class="py-2.5 pr-3">
                    <RouterLink :to="`/watch/${row.id}`" class="font-medium hover:underline">{{
                      titleOf(row)
                    }}</RouterLink>
                    <p class="text-xs text-muted">
                      {{ getShow(row.showId)?.name }} · {{ formatPublished(row.publishedAt) }}
                      <span v-if="row.access === 'premium'" class="text-gold">· Members</span>
                    </p>
                  </td>
                  <td v-for="p in PLATFORMS" :key="p" class="px-2 py-2.5">
                    <template v-if="sourceOf(row, p)">
                      <span
                        class="rounded px-1.5 py-0.5 text-[11px] font-semibold whitespace-nowrap"
                        :class="statusStyles[sourceOf(row, p)!.status]"
                      >
                        {{ statusNames[sourceOf(row, p)!.status] }}
                      </span>
                      <p v-if="sourceOf(row, p)!.syncedAt" class="mt-1 text-[11px] text-muted">
                        {{ formatTimeAgo(sourceOf(row, p)!.syncedAt!) }}
                      </p>
                    </template>
                    <span v-else class="text-muted" aria-label="Not on this platform">—</span>
                  </td>
                </tr>
              </tbody>
            </table>

            <!-- Phones: a card per episode. -->
            <ul class="space-y-3 md:hidden">
              <li
                v-for="row in desk.data.value.items"
                :key="row.id"
                class="rounded-xl bg-surface p-3 ring-1 ring-white/10"
              >
                <RouterLink :to="`/watch/${row.id}`" class="font-medium">{{ titleOf(row) }}</RouterLink>
                <p class="text-xs text-muted">
                  {{ getShow(row.showId)?.name }} · {{ formatPublished(row.publishedAt) }}
                </p>
                <ul class="mt-2 flex flex-wrap gap-1.5">
                  <li
                    v-for="s in row.sources"
                    :key="s.platform"
                    class="rounded px-1.5 py-0.5 text-[11px] font-semibold"
                    :class="statusStyles[s.status]"
                  >
                    {{ columnName(s.platform) }}: {{ statusNames[s.status] }}
                  </li>
                </ul>
              </li>
            </ul>

            <PageNav
              v-if="desk.data.value.pageCount > 1"
              class="mt-6"
              :page="page"
              :page-count="desk.data.value.pageCount"
              :to="(p: number) => ({ query: { ...route.query, page: p || undefined } })"
            />
          </template>
        </section>

        <!-- The latest syncs. -->
        <section aria-labelledby="desk-runs" class="mt-10 rounded-xl bg-surface p-4 ring-1 ring-white/10 lg:mt-0">
          <h2 id="desk-runs" class="font-semibold">Latest syncs</h2>
          <p class="text-xs text-muted">
            Hourly, and on Re-sync.
            {{
              API_MODE === 'laravel'
                ? 'Reading the sample feeds while the live ones are connected.'
                : "Re-sync here replays the export's sync, saved in this browser."
            }}
          </p>
          <ol class="mt-3 space-y-3">
            <li
              v-for="run in desk.data.value?.runs ?? []"
              :key="run.id"
              class="border-t border-white/5 pt-3 text-sm first:border-0 first:pt-0"
            >
              <p class="flex items-center justify-between gap-2">
                <span class="font-medium">{{ columnName(run.platform) }}</span>
                <span class="text-xs text-muted">{{ formatTimeAgo(run.startedAt) }}</span>
              </p>
              <p class="text-xs" :class="run.status === 'failed' ? 'text-[#ff8a80]' : 'text-white/75'">
                <template v-if="run.status === 'failed'">Failed: {{ run.notes[0] }}</template>
                <template v-else>
                  {{ run.fetched }} in the feed · {{ run.matched }} matched ·
                  <span :class="run.linked ? 'font-semibold text-[#7fd1c6]' : ''">{{ run.linked }} newly linked</span>
                </template>
              </p>
              <p
                v-if="run.status !== 'failed' && run.unmatched"
                class="text-xs text-muted"
                :title="run.notes.join(', ')"
              >
                {{ run.unmatched }} not episodes, such as “{{ run.notes[0] }}”
              </p>
            </li>
          </ol>
        </section>
      </div>
    </template>
  </main>
</template>
