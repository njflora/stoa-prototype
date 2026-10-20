<script setup lang="ts">
import { API_MODE } from '@/api/client'
</script>

<template>
  <!-- In the static preview, say plainly what it is. The Laravel version checks access on the server. -->
  <p
    v-if="API_MODE === 'static'"
    class="border-b border-white/5 bg-surface px-4 py-1.5 text-center text-xs text-muted sm:px-8"
  >
    <span class="font-semibold text-white">Preview:</span> saved in this browser, with access checked here rather than on a server.
  </p>
</template>
