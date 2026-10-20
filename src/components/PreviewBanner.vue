<script setup lang="ts">
import { API_MODE } from '@/api/client'
</script>

<template>
  <!-- In the static preview, say plainly what it is. The Laravel API is the real thing. -->
  <p
    v-if="API_MODE === 'static'"
    class="border-b border-white/5 bg-surface px-4 py-1.5 text-center text-xs text-muted sm:px-8"
  >
    <span class="font-semibold text-white">Preview:</span> data is a snapshot and access is not enforced.
  </p>
</template>
