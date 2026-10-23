<script setup lang="ts">
import { useId } from 'vue'
import { brand } from '@/config/brand'
import { BAND, topStars } from './scene'

// The band at the top: a strip of night sky with the name in it, then a slim
// lintel. Pinned to the top at `height` pixels, so the name is never cropped.

defineProps<{ height: number }>()

const uid = useId()
const id = (name: string) => `${uid}-${name}`
</script>

<template>
  <svg
    :viewBox="`0 0 ${BAND.w} ${BAND.h}`"
    preserveAspectRatio="xMidYMid slice"
    class="absolute inset-x-0 top-0 w-full"
    :style="{ height: `${height}px` }"
    aria-hidden="true"
  >
    <defs>
      <linearGradient :id="id('night')" x1="0" x2="0" y1="0" y2="1">
        <stop offset="0" stop-color="#07021a" />
        <stop offset="1" stop-color="#1e0838" />
      </linearGradient>
      <filter :id="id('band-glow')" x="-20%" y="-40%" width="140%" height="180%">
        <feGaussianBlur stdDeviation="2.5" result="blur" />
        <feMerge>
          <feMergeNode in="blur" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>
    </defs>
    <rect :width="BAND.w" :height="BAND.sky" :fill="`url(#${id('night')})`" />
    <circle
      v-for="([x, y, r], i) in topStars"
      :key="i"
      class="star"
      :cx="x"
      :cy="y"
      :r="r"
      fill="#fff"
      :style="{ animationDelay: `${(i * 0.41) % 3}s` }"
    />
    <rect :y="BAND.sky" :width="BAND.w" :height="BAND.h - BAND.sky" fill="#4a1460" />
    <g stroke="#f472d0" :filter="`url(#${id('band-glow')})`">
      <line x1="0" :x2="BAND.w" :y1="BAND.sky" :y2="BAND.sky" stroke-width="1.5" />
      <line x1="0" :x2="BAND.w" :y1="BAND.h - 1.5" :y2="BAND.h - 1.5" stroke-width="2.5" />
    </g>
    <text
      :x="BAND.w / 2"
      y="40"
      text-anchor="middle"
      class="font-serif"
      font-size="40"
      font-weight="700"
      letter-spacing="6"
      fill="#ffd6f2"
      :filter="`url(#${id('band-glow')})`"
    >
      {{ brand.intro.word }}
    </text>
  </svg>
</template>
