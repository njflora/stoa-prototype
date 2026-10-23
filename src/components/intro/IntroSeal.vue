<script setup lang="ts">
import { useId } from 'vue'
import { DELPHIC_E, laurel, waxPath } from './scene'

// The wax seal's face: poured wax, a laurel ring and the Delphic E, in two
// halves along a jagged crack. The halves (half-left, half-right) fall away
// when the seal breaks; intro.css moves them. The button around it is in
// StoaIntro.vue.

const uid = useId()
const id = (name: string) => `${uid}-${name}`
</script>

<template>
  <svg viewBox="-60 -60 120 120" class="size-full overflow-visible" aria-hidden="true">
    <defs>
      <radialGradient :id="id('wax')" cx="0.38" cy="0.32" r="0.75">
        <stop offset="0" stop-color="#e07ab5" />
        <stop offset="0.45" stop-color="#9f3878" />
        <stop offset="1" stop-color="#5a1844" />
      </radialGradient>
      <!-- A jagged crack down the middle -->
      <clipPath :id="id('left')"><polygon points="-62,-62 3,-62 -5,-28 5,-4 -4,22 3,62 -62,62" /></clipPath>
      <clipPath :id="id('right')"><polygon points="3,-62 62,-62 62,62 3,62 -4,22 5,-4 -5,-28" /></clipPath>
      <g :id="id('wax-face')">
        <path :d="waxPath" :fill="`url(#${id('wax')})`" />
        <circle r="33" fill="none" stroke="#f0a6ca" stroke-opacity="0.35" stroke-width="2" />
        <ellipse
          v-for="angle in laurel"
          :key="angle"
          cx="0"
          cy="-39"
          rx="2.6"
          ry="6"
          fill="#f0a6ca"
          fill-opacity="0.4"
          :transform="`rotate(${angle})`"
        />
        <!-- The Delphic E, pressed into the wax: a shadow, then the mark -->
        <path
          :d="DELPHIC_E"
          transform="translate(0 1.5)"
          fill="none"
          stroke="#3d0f2e"
          stroke-opacity="0.6"
          stroke-width="3.2"
        />
        <path :d="DELPHIC_E" fill="none" stroke="#f6c2de" stroke-width="3.2" />
      </g>
    </defs>
    <g class="half half-left" :clip-path="`url(#${id('left')})`"><use :href="`#${id('wax-face')}`" /></g>
    <g class="half half-right" :clip-path="`url(#${id('right')})`"><use :href="`#${id('wax-face')}`" /></g>
  </svg>
</template>
