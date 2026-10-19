<script setup lang="ts">
import { computed, nextTick, onMounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import AppIcon from './AppIcon.vue'
import PitchNote from './PitchNote.vue'
import type { ResultKind, SearchHit } from '@/api/search'
import { articleCategoryColours, articles, getShow, hostNames, listShows } from '@/data/catalogue'
import { artForEpisode, artForSeries, artForShow, mediaUrl } from '@/data/media'
import { useSearch } from '@/composables/useSearch'
import { useSearchOverlay } from '@/composables/useSearchOverlay'
import { useViewer } from '@/composables/useViewer'
import type { Episode } from '@/types/content'
import { formatPublished } from '@/utils/format'
import { highlight } from '@/utils/highlight'

// Instant search (Finding 9): results appear as you type, grouped by kind,
// in a see-through panel over the current page (see SearchOverlay.vue).
// Keyboard: the ARIA combobox pattern. Focus stays in the box while the
// arrow keys move through results; Enter opens the highlighted one.

const router = useRouter()
const { isMember } = useViewer()
const { closeSearch } = useSearchOverlay()
const { query, results, loading, error, retry } = useSearch()

const panel = ref<HTMLElement>()
const input = ref<HTMLInputElement>()
onMounted(() => input.value?.focus())

const EPISODES_FIRST = 8
const EPISODES_MORE = 20
const episodeLimit = ref(EPISODES_FIRST)
watch(query, () => (episodeLimit.value = EPISODES_FIRST))

const order: { kind: ResultKind; label: string }[] = [
  { kind: 'episode', label: 'Episodes' },
  { kind: 'series', label: 'Series' },
  { kind: 'show', label: 'Shows' },
  { kind: 'host', label: 'Hosts' },
  { kind: 'article', label: 'Articles' },
]

const groups = computed(() =>
  order
    .map(({ kind, label }) => {
      const all = results.value?.groups[kind] ?? []
      return { kind, label, total: all.length, hits: kind === 'episode' ? all.slice(0, episodeLimit.value) : all }
    })
    .filter((g) => g.total > 0),
)
const flat = computed(() => groups.value.flatMap((g) => g.hits))
const total = computed(() => results.value?.total ?? 0)
const hasQuery = computed(() => query.value.trim().length > 0)

// Keyboard movement through results.
const active = ref(-1)
watch(flat, () => (active.value = -1))
const optionId = (hit: SearchHit) => `result-${hit.kind}-${hit.id}`

async function move(step: 1 | -1) {
  if (!flat.value.length) return
  active.value = (active.value + step + flat.value.length) % flat.value.length
  await nextTick()
  document.getElementById(optionId(flat.value[active.value]!))?.scrollIntoView({ block: 'nearest' })
}

function open(hit: SearchHit | undefined) {
  if (!hit) return
  // A host result searches for that host, right here.
  if (hit.kind === 'host') {
    query.value = hit.title
    input.value?.focus()
    return
  }
  // Going to another page closes the overlay, since the new address has no ?search.
  router.push(hit.to)
}

function onInputKeydown(event: KeyboardEvent) {
  if (event.key === 'ArrowDown') {
    event.preventDefault()
    move(1)
  } else if (event.key === 'ArrowUp') {
    event.preventDefault()
    move(-1)
  } else if (event.key === 'Enter') {
    event.preventDefault()
    open(flat.value[active.value] ?? flat.value[0])
  } else if (event.key === 'Escape' && query.value) {
    // The first Escape clears the box; the next one closes search.
    event.stopPropagation()
    query.value = ''
  }
}

// Escape closes, and Tab stays inside the panel while it is open.
function onPanelKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape') {
    closeSearch()
    return
  }
  if (event.key !== 'Tab' || !panel.value) return
  const focusable = [...panel.value.querySelectorAll<HTMLElement>('input, button, a[href]')].filter((el) => el.offsetParent)
  const first = focusable[0]
  const last = focusable.at(-1)
  if (event.shiftKey && document.activeElement === first) {
    event.preventDefault()
    last?.focus()
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault()
    first?.focus()
  }
}

// Detail and artwork for each kind of result.
function asEpisode(hit: SearchHit): Episode {
  return {
    id: hit.id,
    showId: hit.showId ?? '',
    title: hit.title,
    hostIds: hit.hostIds ?? [],
    publishedAt: hit.publishedAt ?? '',
    durationMin: 0,
    access: hit.access ?? 'free',
    series: hit.seriesName ? { name: hit.seriesName, part: 1, of: 1 } : undefined,
  }
}

function thumb(hit: SearchHit): string | undefined {
  if (hit.kind === 'episode' && hit.showId) return mediaUrl(artForEpisode(asEpisode(hit)).card)
  if (hit.kind === 'series' && hit.seriesName) {
    const art = artForSeries(hit.seriesName) ?? (hit.showId ? artForShow(hit.showId)[0] : undefined)
    return art && mediaUrl(art.card)
  }
  if (hit.kind === 'show' && hit.showId) {
    const art = artForShow(hit.showId)[0]
    return art && mediaUrl(art.card)
  }
  return undefined
}

function detail(hit: SearchHit): string {
  switch (hit.kind) {
    case 'episode':
      return `${hit.showId ? getShow(hit.showId).name : ''} · ${formatPublished(hit.publishedAt ?? '')}`
    case 'series': {
      const show = hit.showId ? getShow(hit.showId).name : ''
      return `${show} · Series`
    }
    case 'show': {
      const show = hit.showId ? getShow(hit.showId) : undefined
      return show ? `${show.episodeCount?.toLocaleString('en-GB')} episodes · ${show.tagline}` : ''
    }
    case 'host': {
      const id = hit.hostIds?.[0]
      const presents = listShows().filter((s) => id && s.hostIds.includes(id)).map((s) => s.name)
      return presents.length ? `Presents ${presents.join(', ')}` : 'Writer'
    }
    case 'article': {
      const article = articles.find((a) => a.id === hit.id)
      return article ? `Article · ${hostNames([article.authorId])} · ${article.category}` : 'Article'
    }
  }
}

function articleColour(hit: SearchHit): string | undefined {
  const article = articles.find((a) => a.id === hit.id)
  return article && articleCategoryColours[article.category].accent
}

const locked = (hit: SearchHit) => hit.kind === 'episode' && hit.access === 'premium' && !isMember.value

const suggestions = ['Rome', 'energy', 'Helen Thwaite', 'The Forum', '1530', 'Roman Resurgence']
</script>

<template>
  <section
    ref="panel"
    role="dialog"
    aria-modal="true"
    aria-labelledby="search-title"
    class="flex max-h-full w-full max-w-3xl flex-col overflow-hidden rounded-2xl bg-ink/60 shadow-2xl ring-1 shadow-black/50 ring-white/15 backdrop-blur-xl sm:max-h-[84vh]"
    @keydown="onPanelKeydown"
  >
    <div class="shrink-0 p-3 sm:p-4">
      <div class="flex items-center gap-2">
        <h2 id="search-title" class="sr-only">Search</h2>
        <div class="relative flex-1">
          <span class="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-muted" aria-hidden="true">
            <AppIcon name="search" />
          </span>
          <label for="search-input" class="sr-only">Search episodes, series, shows, hosts and articles</label>
          <input
            id="search-input"
            ref="input"
            v-model="query"
            type="search"
            role="combobox"
            autocomplete="off"
            spellcheck="false"
            enterkeyhint="search"
            aria-autocomplete="list"
            aria-controls="search-results"
            :aria-expanded="flat.length > 0"
            :aria-activedescendant="active >= 0 && flat[active] ? optionId(flat[active]!) : undefined"
            placeholder="Episodes, series, hosts, topics…"
            class="h-12 w-full rounded-xl bg-white/10 pr-4 pl-11 text-base ring-1 ring-white/15 placeholder:text-white/55 focus:ring-2 focus:ring-accent-bright focus:outline-none"
            @keydown="onInputKeydown"
          />
        </div>
        <button
          type="button"
          class="flex h-11 shrink-0 items-center gap-1 rounded-full px-3 text-sm font-medium text-white/85 hover:bg-white/10 hover:text-white"
          @click="closeSearch()"
        >
          Close
          <span class="sr-only">search</span>
        </button>
      </div>

      <div class="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-white/70">
        <PitchNote id="search" />
        <span v-if="hasQuery && results && !error" aria-hidden="true">
          {{ total.toLocaleString('en-GB') }} {{ total === 1 ? 'result' : 'results' }}
          <span class="hidden sm:inline">· ↑ ↓ to move, Enter to open, Esc to clear</span>
        </span>
      </div>

      <!-- Announced politely to screen readers as results change. -->
      <p class="sr-only" aria-live="polite">
        <template v-if="hasQuery && results">{{ total }} {{ total === 1 ? 'result' : 'results' }}</template>
      </p>
    </div>

    <div class="min-h-0 flex-1 overflow-y-auto overscroll-contain px-3 pb-4 sm:px-4">
      <p v-if="error" class="text-sm" role="alert">
        Search could not load.
        <button type="button" class="ml-2 min-h-6 font-semibold underline" @click="retry()">Try again</button>
      </p>

      <!-- Before typing, or when nothing matched: suggestions. -->
      <div v-if="!hasQuery || (results && total === 0 && !loading)">
        <p v-if="hasQuery" class="text-white/90">No results for "{{ query }}".</p>
        <p class="mt-1 text-sm text-white/70">Try one of these:</p>
        <div class="mt-3 flex flex-wrap gap-2">
          <button
            v-for="s in suggestions"
            :key="s"
            type="button"
            class="min-h-9 rounded-full bg-white/10 px-4 text-sm ring-1 ring-white/10 hover:bg-white/20"
            @click="query = s; input?.focus()"
          >
            {{ s }}
          </button>
        </div>
      </div>

      <div v-if="flat.length" id="search-results" role="listbox" aria-label="Search results" class="space-y-6">
        <section v-for="group in groups" :key="group.kind" role="group" :aria-labelledby="`group-${group.kind}`">
          <h3 :id="`group-${group.kind}`" class="text-xs font-semibold tracking-wide text-white/70 uppercase">
            {{ group.label }} <span class="font-normal">({{ group.total.toLocaleString('en-GB') }})</span>
          </h3>
          <ul class="mt-1.5 divide-y divide-white/5" role="presentation">
            <li
              v-for="hit in group.hits"
              :id="optionId(hit)"
              :key="hit.kind + hit.id"
              role="option"
              :aria-selected="flat[active] === hit"
              class="flex cursor-pointer items-center gap-3 rounded-lg px-2 py-2 transition"
              :class="flat[active] === hit ? 'bg-accent/35' : 'hover:bg-white/10'"
              @click="open(hit)"
              @mousemove="active = flat.indexOf(hit)"
            >
              <span class="relative grid aspect-video w-20 shrink-0 place-items-center overflow-hidden rounded bg-white/10 ring-1 ring-white/10">
                <img v-if="thumb(hit)" :src="thumb(hit)" alt="" class="size-full object-cover" :class="locked(hit) ? 'blur-[2px] brightness-75' : ''" loading="lazy" />
                <span v-else-if="hit.kind === 'host'" class="grid size-9 place-items-center rounded-full bg-accent text-xs font-bold">
                  {{ hit.title.split(' ').map((w) => w[0]).join('').slice(0, 2) }}
                </span>
                <span v-else-if="hit.kind === 'article'" class="absolute inset-y-0 left-0 w-1.5" :style="{ backgroundColor: articleColour(hit) }" />
                <span v-if="locked(hit)" class="absolute inset-0 grid place-items-center [&>svg]:size-4"><AppIcon name="lock" /></span>
              </span>
              <span class="min-w-0 flex-1">
                <!-- Two lines, not one: similar titles differ at the end. -->
                <span class="line-clamp-2 text-sm font-medium">
                  <template v-for="(part, i) in highlight(hit.title, hit.terms)" :key="i">
                    <mark v-if="part.match" class="rounded-sm bg-accent/50 px-0.5 text-white">{{ part.text }}</mark>
                    <template v-else>{{ part.text }}</template>
                  </template>
                </span>
                <span class="mt-0.5 block truncate text-xs text-white/65">
                  {{ detail(hit) }}<template v-if="locked(hit)"> · Members</template>
                </span>
              </span>
            </li>
          </ul>
          <button
            v-if="group.kind === 'episode' && group.total > group.hits.length"
            type="button"
            class="mt-2 min-h-9 w-full rounded-lg bg-white/10 text-sm font-medium ring-1 ring-white/10 hover:bg-white/20"
            @click="episodeLimit += EPISODES_MORE"
          >
            Show more episodes ({{ (group.total - group.hits.length).toLocaleString('en-GB') }} more)
          </button>
        </section>
      </div>
    </div>
  </section>
</template>
