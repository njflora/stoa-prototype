<script setup lang="ts">
import { computed, ref } from 'vue'
import CourseCard from '@/components/CourseCard.vue'
import FilterChips from '@/components/FilterChips.vue'
import PitchNote from '@/components/PitchNote.vue'
import { courses, type CourseType } from '@/data/courses'

// The course shop, inside the main site rather than on a separate one.
// A handful of products, so the filter stays on the page, not in the address.

type Choice = 'all' | CourseType
const choice = ref<Choice>('all')
const options = [
  { value: 'all' as Choice, label: 'All', count: courses.length },
  ...(['Course', 'Bundle', 'Community'] as const).map((type) => ({
    value: type,
    label: type === 'Community' ? 'Community' : `${type}s`,
    count: courses.filter((c) => c.type === type).length,
  })),
]
const shown = computed(() => (choice.value === 'all' ? courses : courses.filter((c) => c.type === choice.value)))
</script>

<template>
  <main class="px-4 pt-8 sm:px-8">
    <div class="flex flex-wrap items-center gap-2">
      <h1 class="text-3xl font-bold sm:text-4xl">Courses</h1>
      <PitchNote id="courses-inside" />
    </div>
    <p class="mt-2 max-w-2xl text-white/75">Structured courses taught by the presenters, at your own pace.</p>

    <FilterChips v-model="choice" label="Type" :options="options" class="mt-6" />

    <div class="mt-6 grid grid-cols-1 gap-4 min-[560px]:grid-cols-2 lg:grid-cols-3">
      <CourseCard v-for="course in shown" :key="course.id" :course="course" />
    </div>
  </main>
</template>
