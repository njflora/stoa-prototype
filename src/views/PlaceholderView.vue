<script setup lang="ts">
import { RouterLink, useRoute } from 'vue-router'

// Stands in for sections that later steps will build.
const route = useRoute()
</script>

<template>
  <main class="mx-auto flex min-h-[60vh] max-w-xl flex-col items-center justify-center px-4 text-center">
    <h1 class="font-serif text-4xl font-bold">{{ route.meta.title ?? 'Coming soon' }}</h1>
    <p class="mt-3 text-muted">
      {{ route.meta.note ?? 'This section is planned for a later step of the prototype.' }}
    </p>
    <RouterLink to="/" class="mt-6 rounded-lg bg-white px-5 py-2.5 text-sm font-semibold text-ink">
      Back to home
    </RouterLink>
  </main>
</template>
