<script setup lang="ts">
import { ref, useId } from 'vue'
import AppIcon from './AppIcon.vue'
import { useViewer } from '@/composables/useViewer'

// Newsletter sign-up. Visitors and free accounts enter an email address;
// members already have one on file, so they get a single button.
// The prototype has no server: nothing is sent or stored.

const { isMember } = useViewer()

const headingId = useId()
const emailId = useId()
const email = ref('')
const submitted = ref(false)
const memberSubscribed = ref(false)

function subscribe() {
  // The browser has already checked the address, thanks to type="email".
  submitted.value = true
  email.value = ''
}
</script>

<template>
  <section :aria-labelledby="headingId">
    <h2 :id="headingId" class="text-sm font-semibold text-white">Newsletter</h2>
    <p class="mt-1 text-sm">The week's best episodes and articles, every Friday.</p>

    <!-- Members: their email is already on file. -->
    <button
      v-if="isMember"
      type="button"
      class="mt-3 inline-flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-semibold transition [&>svg]:size-4"
      :class="
        memberSubscribed
          ? 'bg-white/15 text-white ring-1 ring-white/30 hover:bg-white/25'
          : 'bg-accent text-white hover:bg-accent-bright'
      "
      :aria-pressed="memberSubscribed"
      @click="memberSubscribed = !memberSubscribed"
    >
      <AppIcon v-if="memberSubscribed" name="check" />
      {{ memberSubscribed ? 'Subscribed' : 'Subscribe to the newsletter' }}
    </button>

    <!-- Visitors and free accounts. -->
    <template v-else>
      <p v-if="submitted" class="mt-3 text-sm font-medium text-white" role="status">Thanks, you're on the list.</p>
      <form v-else class="mt-3 flex max-w-sm gap-2" @submit.prevent="subscribe">
        <label :for="emailId" class="sr-only">Email address</label>
        <input
          :id="emailId"
          v-model="email"
          type="email"
          required
          autocomplete="email"
          placeholder="you@example.com"
          class="min-w-0 flex-1 rounded-lg bg-surface px-3 py-2 text-sm text-white ring-1 ring-white/15 placeholder:text-muted focus:ring-2 focus:ring-accent-bright focus:outline-none"
        />
        <button
          type="submit"
          class="shrink-0 rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-white transition hover:bg-accent-bright"
        >
          Subscribe
        </button>
      </form>
      <p class="mt-2 text-[11px]">Prototype only: nothing is sent or stored.</p>
    </template>
  </section>
</template>
