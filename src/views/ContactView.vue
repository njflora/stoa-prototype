<script setup lang="ts">
import { RouterLink } from 'vue-router'

// A small, honest contact page. The addresses are placeholders on
// example.com, a domain reserved for examples, so nothing reaches anyone.
const contacts = [
  { label: 'General enquiries', email: 'hello@example.com', note: 'Questions about the site or the shows.' },
  { label: 'Membership and billing', email: 'members@example.com', note: 'Your plan, payments and account.' },
  {
    label: 'Press and partnerships',
    email: 'press@example.com',
    note: 'Interviews, appearances and working together.',
  },
]
</script>

<template>
  <main class="mx-auto max-w-2xl px-4 pt-8 sm:px-8">
    <h1 class="text-3xl font-bold sm:text-4xl">Contact</h1>
    <p class="mt-2 text-white/75">
      Most questions are answered in the
      <RouterLink :to="{ path: '/join', hash: '#faq-heading' }" class="underline hover:text-white">FAQ</RouterLink>. For
      anything else, write to the right team below.
    </p>

    <ul class="mt-6 divide-y divide-white/5 rounded-xl bg-surface ring-1 ring-white/10">
      <li v-for="c in contacts" :key="c.email" class="px-4 py-4">
        <p class="font-semibold">{{ c.label }}</p>
        <p class="text-sm text-white/75">{{ c.note }}</p>
        <a
          :href="`mailto:${c.email}`"
          class="mt-1 inline-flex min-h-6 items-center text-sm text-accent-bright underline"
          >{{ c.email }}</a
        >
      </li>
    </ul>

    <p class="mt-4 text-sm text-muted">
      A contact form is not part of this demo. The addresses above are placeholders.
    </p>
  </main>
</template>
