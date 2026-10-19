<script setup lang="ts">
import { computed, ref } from 'vue'
import { RouterLink } from 'vue-router'
import AppIcon from '@/components/AppIcon.vue'
import ContentRow from '@/components/ContentRow.vue'
import EpisodeCard from '@/components/EpisodeCard.vue'
import { episodesForShow, shows } from '@/data/catalogue'
import { tierStyles } from '@/data/chat'
import { features, tiers, TRIAL_DAYS, type PlanId, type TierId } from '@/data/membership'
import { useViewer } from '@/composables/useViewer'

// The members' preview: why join, shown rather than told. A free preview
// of every members' show, what free gets against each tier, and the
// tiers themselves. There is no checkout: the prototype never takes
// payment, so the tier buttons explain that instead.

const { isMember, user } = useViewer()

const currentTier = computed<TierId | null>(() => (isMember.value ? (user.value?.tier ?? null) : null))
const lowestPrice = Math.min(...tiers.map((t) => t.monthly))

/** One free preview per members' show, newest first. */
const previews = shows
  .filter((s) => s.access === 'premium')
  .map((s) => episodesForShow(s.id).find((e) => e.access === 'freemium'))
  .filter((e) => e !== undefined)

const columns: { id: PlanId; label: string; price?: number }[] = [
  { id: 'free', label: 'Free' },
  ...tiers.map((t) => ({ id: t.id, label: t.name, price: t.monthly })),
]

// Which tier button was pressed, to show the no-checkout note under it.
const noteFor = ref<TierId | null>(null)

const faqs = [
  {
    q: 'How does the free trial work?',
    a: `Pick any tier and use everything in it free for ${TRIAL_DAYS} days. Cancel before the trial ends and you pay nothing.`,
  },
  { q: 'Can I cancel at any time?', a: 'Yes. Membership runs month to month, and cancelling takes effect at the end of the month you have paid for.' },
  { q: 'Can I change tier later?', a: 'Yes. Move up or down at any time from your account page.' },
  { q: 'Can I give membership as a gift?', a: 'Yes. Gift memberships are available from the account page.' },
  {
    q: 'What does a free account get?',
    a: "The daily shows, the live stream and live chat, free previews of every members' show, and all articles and reading lists.",
  },
]
</script>

<template>
  <main>
    <!-- Hero -->
    <section class="relative overflow-hidden px-4 pt-16 pb-12 sm:px-8 sm:pt-24">
      <div class="absolute inset-0 bg-gradient-to-br from-accent/50 via-ink to-ink" aria-hidden="true" />
      <div class="absolute -top-32 -right-24 size-96 rounded-full bg-gold/20 blur-3xl" aria-hidden="true" />

      <div class="relative max-w-2xl">
        <template v-if="currentTier">
          <span
            class="rounded px-2 py-0.5 text-xs font-bold tracking-wide uppercase"
            :class="tierStyles[currentTier].class"
          >
            {{ tierStyles[currentTier].label }}
          </span>
          <h1 class="mt-3 text-4xl leading-tight font-bold sm:text-5xl">
            You're a {{ tierStyles[currentTier].label }} member
          </h1>
          <p class="mt-3 text-lg text-white/85">Thanks for supporting Stoa. Everything on the site is unlocked for you.</p>
          <RouterLink
            to="/account"
            class="mt-6 inline-block rounded-lg bg-white px-5 py-2.5 text-sm font-semibold text-ink hover:brightness-95"
          >
            Manage membership
          </RouterLink>
        </template>

        <template v-else>
          <p class="text-sm font-semibold tracking-widest text-gold uppercase">Membership</p>
          <h1 class="mt-3 text-4xl leading-tight font-bold sm:text-5xl">Everything on Stoa</h1>
          <p class="mt-3 text-lg text-white/85">
            Every members' show, the full archive and the live after-show. From £{{ lowestPrice }} a month.
          </p>
          <p class="mt-4 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-sm ring-1 ring-white/15">
            <AppIcon name="check" class="!size-4 text-gold" />
            Try any tier free for {{ TRIAL_DAYS }} days
          </p>
          <div class="mt-6 flex flex-wrap gap-3">
            <a
              href="#tiers"
              class="inline-flex items-center gap-2 rounded-lg bg-gold px-5 py-2.5 text-sm font-semibold text-ink hover:brightness-110 [&>svg]:size-4"
            >
              <AppIcon name="crown" />
              Start your free trial
            </a>
            <a href="#compare" class="rounded-lg bg-white/15 px-5 py-2.5 text-sm font-semibold hover:bg-white/25">
              Compare plans
            </a>
          </div>
        </template>
      </div>
    </section>

    <!-- A taste of every members' show -->
    <ContentRow
      title="Free previews"
      subtitle="A taste of every members' show, free for everyone"
      class="pt-6"
    >
      <EpisodeCard v-for="episode in previews" :key="episode.id" :episode="episode" />
    </ContentRow>

    <!-- Tiers -->
    <section id="tiers" class="scroll-mt-24 px-4 pt-14 sm:px-8" aria-labelledby="tiers-heading">
      <h2 id="tiers-heading" class="text-2xl font-bold">Choose a tier</h2>
      <p class="mt-1 text-sm text-muted">Prices per month. Every tier starts with a {{ TRIAL_DAYS }}-day free trial.</p>

      <ul class="mt-6 grid gap-4 md:grid-cols-3">
        <li
          v-for="tier in tiers"
          :key="tier.id"
          class="flex flex-col rounded-xl bg-surface p-5 ring-1"
          :class="currentTier === tier.id ? 'ring-2 ring-gold' : 'ring-white/10'"
        >
          <div class="flex items-center justify-between">
            <span class="rounded px-2 py-0.5 text-xs font-bold tracking-wide uppercase" :class="tierStyles[tier.id].class">
              {{ tier.name }}
            </span>
            <span v-if="currentTier === tier.id" class="text-xs font-semibold text-gold">Your tier</span>
          </div>
          <p class="mt-4">
            <span class="text-4xl font-bold">£{{ tier.monthly }}</span>
            <span class="text-sm text-muted"> a month</span>
          </p>
          <p class="mt-1 text-sm text-white/80">{{ tier.summary }}</p>

          <ul class="mt-4 flex-1 space-y-2 text-sm">
            <li v-for="item in tier.adds" :key="item" class="flex gap-2">
              <AppIcon name="check" class="mt-0.5 !size-4 text-accent-bright" />
              <span>{{ item }}</span>
            </li>
          </ul>

          <button
            type="button"
            class="mt-6 inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition disabled:cursor-default disabled:opacity-60 [&>svg]:size-4"
            :class="currentTier ? 'bg-white/15 hover:bg-white/25' : 'bg-gold text-ink hover:brightness-110'"
            :disabled="currentTier === tier.id"
            @click="noteFor = tier.id"
          >
            <AppIcon v-if="!currentTier" name="crown" />
            {{
              currentTier === tier.id
                ? 'Your current tier'
                : currentTier
                  ? `Switch to ${tier.name}`
                  : `Start ${TRIAL_DAYS}-day free trial`
            }}
          </button>
          <p v-if="noteFor === tier.id" class="mt-2 text-center text-xs text-muted" role="status">
            Checkout isn't part of this prototype.
          </p>
        </li>
      </ul>
    </section>

    <!-- What free gets, against each tier -->
    <section id="compare" class="scroll-mt-24 px-4 pt-14 sm:px-8" aria-labelledby="compare-heading">
      <h2 id="compare-heading" class="text-2xl font-bold">What free gets, and what members add</h2>
      <div class="mt-6 overflow-x-auto rounded-xl ring-1 ring-white/10">
        <table class="w-full min-w-[560px] text-sm">
          <caption class="sr-only">Features included in each plan</caption>
          <thead class="bg-surface">
            <tr>
              <th scope="col" class="px-4 py-3 text-left font-semibold">Feature</th>
              <th
                v-for="col in columns"
                :key="col.id"
                scope="col"
                class="px-3 py-3 text-center font-semibold"
                :class="currentTier === col.id ? 'text-gold' : ''"
              >
                {{ col.label }}
                <span v-if="col.price" class="block text-xs font-normal text-muted">£{{ col.price }}/mo</span>
              </th>
            </tr>
          </thead>
          <tbody class="divide-y divide-white/5">
            <tr v-for="feature in features" :key="feature.label">
              <th scope="row" class="px-4 py-2.5 text-left font-normal text-white/85">{{ feature.label }}</th>
              <td v-for="col in columns" :key="col.id" class="px-3 py-2.5 text-center">
                <template v-if="feature.includedIn.includes(col.id)">
                  <AppIcon name="check" class="mx-auto !size-4 text-accent-bright" />
                  <span class="sr-only">Included</span>
                </template>
                <template v-else>
                  <span class="text-white/25" aria-hidden="true">–</span>
                  <span class="sr-only">Not included</span>
                </template>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>

    <!-- Questions -->
    <section class="max-w-3xl px-4 pt-14 sm:px-8" aria-labelledby="faq-heading">
      <h2 id="faq-heading" class="text-2xl font-bold">Questions</h2>
      <div class="mt-4 divide-y divide-white/10 border-y border-white/10">
        <details v-for="faq in faqs" :key="faq.q" class="group py-3">
          <summary class="flex cursor-pointer list-none items-center justify-between gap-4 font-medium">
            {{ faq.q }}
            <span class="text-muted transition group-open:rotate-90" aria-hidden="true">›</span>
          </summary>
          <p class="mt-2 text-sm text-white/80">{{ faq.a }}</p>
        </details>
      </div>
    </section>
  </main>
</template>
