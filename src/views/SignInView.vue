<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import AppIcon from '@/components/AppIcon.vue'
import { API_MODE } from '@/api/client'
import { brand } from '@/config/brand'
import { useViewer, viewerTypes, type ViewerType } from '@/composables/useViewer'

// Sign in, honestly. The demo has no passwords and no real accounts, so this
// page says so and points to the demo panel, which does the same thing from
// any page. For convenience it also offers the same choices here. Nothing is
// typed and nothing is collected.

const route = useRoute()
const router = useRouter()
const { viewer, isSignedIn, setViewer, switching } = useViewer()

const current = computed(() => viewerTypes.find((v) => v.id === viewer.value)?.label ?? '')
const choices = viewerTypes.filter((v) => v.id !== 'signed-out')

/** Where to go afterwards: back where they came from, or the homepage. */
const next = computed(() =>
  typeof route.query.next === 'string' && route.query.next.startsWith('/') ? route.query.next : '/',
)

async function continueAs(id: ViewerType) {
  await setViewer(id)
  router.push(next.value)
}
</script>

<template>
  <main class="mx-auto max-w-xl px-4 pt-10 pb-16">
    <h1 class="text-3xl font-bold sm:text-4xl">Sign in</h1>

    <div class="mt-6 rounded-xl bg-surface p-5 ring-1 ring-white/10">
      <p class="flex items-center gap-2 font-semibold [&>svg]:size-5"><AppIcon name="info" /> This is a demo</p>
      <p class="mt-2 text-sm text-white/85">
        {{ brand.name }} has no passwords and no real accounts. The easiest way to try it is the
        <strong>demo panel</strong>, at the bottom left of every page: it switches between a visitor, a free account, a
        member and staff wherever you are.
      </p>
      <p class="mt-2 text-sm text-white/70">
        {{
          API_MODE === 'laravel'
            ? 'In this version, choosing one signs in to a demo account on the server, so its rules apply for real.'
            : 'In this preview, the choice is kept in this browser.'
        }}
      </p>
    </div>

    <p class="mt-6 text-sm text-white/80">
      You are viewing as <strong class="text-white">{{ current }}</strong
      >. Or continue here as:
    </p>
    <div class="mt-3 flex flex-wrap gap-2">
      <button
        v-for="choice in choices"
        :key="choice.id"
        type="button"
        class="inline-flex min-h-10 items-center rounded-lg px-4 text-sm font-semibold ring-1 transition disabled:opacity-60"
        :class="choice.id === viewer ? 'bg-white text-ink ring-white' : 'ring-white/25 hover:bg-white/10'"
        :disabled="switching"
        @click="continueAs(choice.id)"
      >
        {{ choice.label }}
      </button>
      <button
        v-if="isSignedIn"
        type="button"
        class="inline-flex min-h-10 items-center rounded-lg px-4 text-sm font-semibold text-white/70 ring-1 ring-white/15 hover:text-white disabled:opacity-60"
        :disabled="switching"
        @click="continueAs('signed-out')"
      >
        Sign out
      </button>
    </div>

    <p class="mt-8 text-sm text-muted">
      Not a member yet?
      <RouterLink to="/join" class="font-semibold text-white underline underline-offset-2"
        >See what membership includes</RouterLink
      >.
    </p>
  </main>
</template>
