<script setup lang="ts">
import { RouterLink } from 'vue-router'
import NewsletterSignup from './NewsletterSignup.vue'
</script>

<template>
  <!-- Phones: newsletter first. Larger screens: disclaimer left, newsletter right. -->
  <footer
    class="mt-16 flex flex-col-reverse gap-8 border-t border-white/5 px-4 py-8 text-xs text-muted sm:px-8 md:flex-row md:items-start md:justify-between"
  >
    <p class="md:max-w-sm md:pt-1">
      <span class="font-serif text-sm font-bold text-white">Stoa</span>
      is an unofficial concept. Every show, host and episode is a placeholder.
      <RouterLink to="/credits" class="mt-1 block underline hover:text-white">Image and video credits</RouterLink>
    </p>
    <NewsletterSignup class="md:w-96" />
  </footer>
</template>
