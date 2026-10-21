<script setup lang="ts">
import { brand } from '@/config/brand'

// The site's wordmark, used in the header and the footer. Taking on another
// identity means swapping what is inside: an <img> or inline SVG of their
// logo, with the name as its alternative text. Its size comes from the
// classes the header and footer pass in.
</script>

<template>
  <span class="font-serif font-bold tracking-tight">{{ brand.name }}</span>
</template>
