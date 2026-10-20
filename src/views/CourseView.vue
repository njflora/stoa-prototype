<script setup lang="ts">
import ContributorNames from '@/components/ContributorNames.vue'
import { computed, ref, watch, watchEffect } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import CourseCard from '@/components/CourseCard.vue'
import { getCourse, lessonCount, separatePrice } from '@/data/courses'
import { artworks, mediaUrl } from '@/data/media'
import AppIcon from '@/components/AppIcon.vue'
import PitchNote from '@/components/PitchNote.vue'
import { useCommunity } from '@/composables/useCommunity'
import { useViewer } from '@/composables/useViewer'
import { formatPrice, formatTimeAgo } from '@/utils/format'

// One course: what it covers, who teaches it, and the price. There is no
// checkout in the demo; the button says so rather than pretending.

const route = useRoute()
const course = computed(() => getCourse(String(route.params.id)))
const art = computed(() => course.value && artworks.find((a) => a.id === course.value!.artId))
const included = computed(() => (course.value?.includes ?? []).map((id) => getCourse(id)!))
const saving = computed(() => {
  const separate = course.value && separatePrice(course.value)
  return separate && course.value?.price ? separate - course.value.price : 0
})

const { isSignedIn } = useViewer()
const { isJoined, join, leave } = useCommunity()
const joined = computed(() => !!course.value && isJoined(course.value.id))
const members = computed(() => (course.value?.community?.members ?? 0) + (joined.value ? 1 : 0))
const daysAgoIso = (days: number) => new Date(Date.now() - days * 86_400_000 - 3_600_000).toISOString()

const tried = ref(false)
watch(course, () => (tried.value = false))

watchEffect(() => {
  if (course.value) document.title = `${course.value.title} · Stoa`
})
</script>

<template>
  <main v-if="course">
    <section class="relative overflow-hidden">
      <img v-if="art" :src="mediaUrl(art.hero)" alt="" class="absolute inset-0 size-full object-cover opacity-40" />
      <div class="absolute inset-0 bg-gradient-to-r from-ink via-ink/85 to-ink/40" />
      <div class="relative max-w-2xl px-4 pt-14 pb-10 sm:px-8 sm:pt-20">
        <RouterLink to="/courses" class="inline-flex min-h-6 items-center text-sm text-white/70 hover:text-white">All courses</RouterLink>
        <p class="mt-4 text-xs font-bold tracking-widest text-accent-bright uppercase">{{ course.type }}</p>
        <h1 class="mt-2 text-3xl leading-tight font-bold text-balance sm:text-5xl">{{ course.title }}</h1>
        <p class="mt-3 text-lg text-white/85">{{ course.summary }}</p>
        <p class="mt-3 text-sm text-white/70">
          {{ course.community ? 'Hosted by' : 'Taught by' }} <ContributorNames :ids="[course.teacherId]" />
          <template v-if="lessonCount(course)"> · {{ lessonCount(course) }} lessons</template>
        </p>

        <!-- A community: free membership on your account. -->
        <div v-if="course.community" class="mt-6">
          <p class="text-sm text-white/80">
            <span class="text-2xl font-bold text-white">Free</span> · {{ members }} members · {{ course.community.posts }} posts
          </p>
          <div class="mt-4 flex flex-wrap items-center gap-3">
            <RouterLink v-if="!isSignedIn" to="/sign-in" class="rounded-lg bg-white px-5 py-2.5 text-sm font-semibold text-ink hover:brightness-95">
              Sign in to join
            </RouterLink>
            <button
              v-else-if="!joined"
              type="button"
              class="rounded-lg bg-white px-5 py-2.5 text-sm font-semibold text-ink hover:brightness-95"
              @click="join(course.id)"
            >
              Join the Circle
            </button>
            <template v-else>
              <span class="inline-flex items-center gap-1.5 text-sm font-semibold text-gold [&>svg]:size-4" role="status">
                <AppIcon name="check" /> You are a member
              </span>
              <button type="button" class="inline-flex min-h-9 items-center rounded-lg px-3 text-sm text-white/70 ring-1 ring-white/15 hover:bg-white/10 hover:text-white" @click="leave(course.id)">
                Leave the Circle
              </button>
            </template>
          </div>
        </div>

        <div v-else class="mt-6 flex flex-wrap items-center gap-4">
          <p v-if="course.price !== undefined" class="text-3xl font-bold">{{ formatPrice(course.price) }}</p>
          <button
            type="button"
            class="rounded-lg bg-white px-5 py-2.5 text-sm font-semibold text-ink hover:brightness-95"
            @click="tried = true"
          >
            {{ course.type === 'Community' ? 'Join the community' : 'Enrol' }}
          </button>
          <p v-if="saving" class="text-sm text-gold">Save {{ formatPrice(saving) }} on buying separately</p>
        </div>
        <p v-if="tried" class="mt-3 text-sm text-white/80" role="status">Enrolment is not part of this demo.</p>
      </div>
    </section>

    <div class="mx-auto max-w-3xl space-y-10 px-4 pt-8 sm:px-8">
      <section aria-labelledby="about-course">
        <h2 id="about-course" class="text-lg font-semibold">About this {{ course.type.toLowerCase() }}</h2>
        <p v-for="(text, i) in course.about" :key="i" class="mt-3 text-white/85">{{ text }}</p>
      </section>

      <section v-if="course.community" aria-labelledby="forums">
        <div class="flex flex-wrap items-center gap-2">
          <h2 id="forums" class="text-lg font-semibold">Forums</h2>
          <PitchNote id="community-forums" />
        </div>
        <ul class="mt-3 space-y-3">
          <li v-for="forum in course.community.forums" :key="forum.name" class="rounded-xl bg-surface p-4 ring-1 ring-white/10" :class="forum.status === 'planned' ? 'opacity-75' : ''">
            <div class="flex flex-wrap items-center gap-2">
              <h3 class="font-semibold">{{ forum.name }}</h3>
              <span
                class="rounded px-1.5 py-0.5 text-[10px] font-bold tracking-wide uppercase"
                :class="forum.status === 'open' ? 'bg-accent text-white' : 'bg-white/10 text-white/70'"
              >
                {{ forum.status === 'open' ? 'Open' : 'Planned' }}
              </span>
            </div>
            <p class="mt-1 text-sm text-white/75">{{ forum.description }}</p>
            <ul v-if="forum.threads" class="mt-3 divide-y divide-white/5">
              <li v-for="thread in forum.threads" :key="thread.title" class="py-2.5">
                <p class="text-sm font-medium">{{ thread.title }}</p>
                <p class="text-xs text-muted">
                  {{ thread.by }} · {{ thread.replies }} replies · last reply {{ formatTimeAgo(daysAgoIso(thread.daysAgo)).toLowerCase() }}
                </p>
              </li>
            </ul>
          </li>
        </ul>
        <p class="mt-2 text-xs text-muted">Posting is not part of this demo.</p>
      </section>

      <section v-if="course.modules.length" aria-labelledby="course-modules">
        <h2 id="course-modules" class="text-lg font-semibold">What you'll cover</h2>
        <ol class="mt-3 divide-y divide-white/5 rounded-xl bg-surface ring-1 ring-white/10">
          <li v-for="(module, i) in course.modules" :key="module.title" class="flex items-center gap-4 px-4 py-3">
            <span class="w-6 text-sm text-muted tabular-nums">{{ i + 1 }}</span>
            <span class="flex-1 text-sm font-medium">{{ module.title }}</span>
            <span class="text-xs text-muted">{{ module.lessons ? `${module.lessons} lessons` : 'Ongoing' }}</span>
          </li>
        </ol>
      </section>

      <section v-if="included.length" aria-labelledby="in-bundle">
        <h2 id="in-bundle" class="text-lg font-semibold">In this bundle</h2>
        <div class="mt-3 grid grid-cols-1 gap-4 min-[560px]:grid-cols-2 lg:grid-cols-3">
          <CourseCard v-for="c in included" :key="c.id" :course="c" />
        </div>
      </section>

      <section v-if="course.related?.length" aria-labelledby="related-on-site">
        <h2 id="related-on-site" class="text-lg font-semibold">Related on Stoa</h2>
        <ul class="mt-3 flex flex-wrap gap-2">
          <li v-for="link in course.related" :key="link.to">
            <RouterLink :to="link.to" class="inline-flex min-h-9 items-center rounded-full bg-surface px-4 text-sm ring-1 ring-white/10 hover:bg-raised">
              {{ link.label }}
            </RouterLink>
          </li>
        </ul>
      </section>
    </div>
  </main>

  <main v-else class="mx-auto flex min-h-[60vh] max-w-xl flex-col items-center justify-center px-4 text-center">
    <h1 class="font-serif text-4xl font-bold">Course not found</h1>
    <RouterLink to="/courses" class="mt-6 rounded-lg bg-white px-5 py-2.5 text-sm font-semibold text-ink">All courses</RouterLink>
  </main>
</template>
