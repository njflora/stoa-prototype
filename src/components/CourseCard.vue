<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink } from 'vue-router'
import { getCourse, lessonCount, type Course } from '@/data/courses'
import { hostNames } from '@/data/catalogue'
import { artworks, mediaUrl } from '@/data/media'
import { formatPrice } from '@/utils/format'

// One product in the course shop, in the reference site's card format:
// type label, title, description, price. A bundle shows the paintings of
// the courses it contains, side by side.

const props = defineProps<{ course: Course }>()

const art = (id: string) => artworks.find((a) => a.id === id)
const images = computed(() =>
  props.course.includes
    ? props.course.includes.map((id) => art(getCourse(id)!.artId))
    : [art(props.course.artId)],
)
</script>

<template>
  <RouterLink :to="`/courses/${course.id}`" class="group flex min-w-0 flex-col overflow-hidden rounded-xl bg-surface ring-1 ring-white/10 outline-none hover:ring-white/30 focus-visible:ring-2 focus-visible:ring-accent-bright">
    <div class="flex aspect-video overflow-hidden">
      <img
        v-for="(image, i) in images"
        :key="i"
        :src="image && mediaUrl(image.card)"
        :alt="image?.alt ?? ''"
        class="min-w-0 flex-1 object-cover transition duration-500 group-hover:scale-105"
        loading="lazy"
      />
    </div>
    <div class="flex flex-1 flex-col p-4">
      <p class="text-[11px] font-bold tracking-widest text-accent-bright uppercase">{{ course.type }}</p>
      <h2 class="mt-1 text-lg leading-snug font-semibold">{{ course.title }}</h2>
      <p class="mt-2 line-clamp-3 text-sm text-white/75">{{ course.summary }}</p>
      <p class="mt-3 text-xs text-muted">
        {{ hostNames([course.teacherId]) }}
        <template v-if="lessonCount(course)"> · {{ lessonCount(course) }} lessons</template>
      </p>
      <p v-if="course.price !== undefined" class="mt-auto pt-3 text-lg font-bold">{{ formatPrice(course.price) }}</p>
    </div>
  </RouterLink>
</template>
