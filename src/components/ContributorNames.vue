<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink } from 'vue-router'
import { reference } from '@/api/catalogue'

// Contributor names as links to their profiles, written the way the site
// writes names elsewhere: "Andrew Pickering, Richard Holloway & Tom Heywood".
// Must not sit inside another link (a link inside a link is invalid HTML).

const props = defineProps<{ ids: string[] }>()

const people = computed(() =>
  props.ids
    .map((id) => reference.hosts.find((h) => h.id === id))
    .filter((h): h is NonNullable<typeof h> => h !== undefined),
)
const separator = (i: number) => (i === people.value.length - 1 ? '' : i === people.value.length - 2 ? ' & ' : ', ')
</script>

<template>
  <span>
    <template v-for="(person, i) in people" :key="person.id">
      <RouterLink
        :to="`/contributors/${person.id}`"
        class="underline decoration-current/30 underline-offset-2 hover:text-white hover:decoration-current"
        >{{ person.name }}</RouterLink
      >{{ separator(i) }}
    </template>
  </span>
</template>
