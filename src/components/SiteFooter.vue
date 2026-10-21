<script setup lang="ts">
import { RouterLink } from 'vue-router'
import NewsletterSignup from './NewsletterSignup.vue'
import { brand } from '@/config/brand'
import BrandLogo from './BrandLogo.vue'
import PitchNote from './PitchNote.vue'

// The way to everything not in the top bar: contributors, help and the small print.
const links = [
  { label: 'Contributors', to: '/contributors' },
  { label: 'FAQ', to: { path: '/join', hash: '#faq-heading' } },
  { label: 'Contact', to: '/contact' },
  { label: 'Courses', to: '/courses' },
  { label: 'Shop', to: '/shop' },
  { label: 'Pitch notes', to: '/pitch' },
]
</script>

<template>
  <!-- Phones: newsletter first. Larger screens: disclaimer left, newsletter right. -->
  <footer
    class="mt-16 flex flex-col-reverse gap-8 border-t border-white/5 px-4 py-8 text-xs text-muted sm:px-8 md:flex-row md:items-start md:justify-between"
  >
    <nav aria-label="Footer" class="md:pt-1">
      <ul class="grid grid-cols-2 gap-x-8 gap-y-1 text-sm">
        <li v-for="link in links" :key="link.label">
          <RouterLink :to="link.to" class="inline-flex min-h-6 items-center text-white/75 hover:text-white">{{ link.label }}</RouterLink>
        </li>
      </ul>
    </nav>
    <p class="md:max-w-sm md:pt-1">
      <PitchNote id="footer" class="mb-2 block" />
      <BrandLogo class="text-sm text-white" />
      {{ brand.footerLine }}
      <RouterLink to="/credits" class="mt-1 inline-flex min-h-6 items-center underline hover:text-white">Image and video credits</RouterLink>
    </p>
    <NewsletterSignup class="md:w-96" />
  </footer>
</template>
