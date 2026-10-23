<script setup lang="ts">
import { useId } from 'vue'
import {
  beams,
  CEILING,
  ceiling,
  columns,
  end,
  floor,
  floorLines,
  floorRays,
  H,
  HALF_WIDTH,
  leftBeam,
  leftWall,
  rightBeam,
  rightWall,
  SUN_Y,
  sunStripes,
  VP,
  W,
} from './scene'

// The colonnade: sunset at the far end, walls, ceiling, the neon floor, the
// beams and the columns, far to near. Its class names (halo, sun, beams,
// columns, neon) are what the opening animation in intro.css moves.

const uid = useId()
const id = (name: string) => `${uid}-${name}`
</script>

<template>
  <svg
    :viewBox="`0 0 ${W} ${H}`"
    preserveAspectRatio="xMidYMid slice"
    class="absolute inset-0 size-full"
    aria-hidden="true"
  >
    <defs>
      <linearGradient :id="id('sky')" x1="0" x2="0" y1="0" y2="1">
        <stop offset="0" stop-color="#1e0838" />
        <stop offset="0.6" stop-color="#7a1f6e" />
        <stop offset="1" stop-color="#ff6ec7" />
      </linearGradient>
      <linearGradient :id="id('sun')" x1="0" x2="0" y1="0" y2="1">
        <stop offset="0" stop-color="#fff0fa" />
        <stop offset="0.45" stop-color="#ff8fd2" />
        <stop offset="1" stop-color="#c04d93" />
      </linearGradient>
      <radialGradient :id="id('halo')">
        <stop offset="0" stop-color="#ff9be3" stop-opacity="0.75" />
        <stop offset="1" stop-color="#ff9be3" stop-opacity="0" />
      </radialGradient>
      <mask :id="id('stripes')">
        <rect x="480" :y="SUN_Y - 80" width="240" height="160" fill="#fff" />
        <rect v-for="(st, i) in sunStripes" :key="i" x="480" :y="st.y" width="240" :height="st.h" fill="#000" />
      </mask>
      <linearGradient :id="id('floor')" x1="0" x2="0" y1="1" y2="0">
        <stop offset="0" stop-color="#1a0628" />
        <stop offset="1" stop-color="#3a0f4f" />
      </linearGradient>
      <linearGradient :id="id('ceiling')" x1="0" x2="0" y1="0" y2="1">
        <stop offset="0" stop-color="#12041e" />
        <stop offset="1" stop-color="#3a0f4f" />
      </linearGradient>
      <linearGradient :id="id('column')" x1="0" x2="1">
        <stop offset="0" stop-color="#5d1d7a" />
        <stop offset="0.45" stop-color="#b06ad4" />
        <stop offset="1" stop-color="#4a1462" />
      </linearGradient>
      <filter :id="id('glow')" x="-20%" y="-20%" width="140%" height="140%">
        <feGaussianBlur stdDeviation="4" result="blur" />
        <feMerge>
          <feMergeNode in="blur" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>
      <clipPath :id="id('floor-clip')"><polygon :points="floor" /></clipPath>
    </defs>

    <!-- The far end: sunset sky and a striped sun, glowing behind the seal -->
    <rect :width="W" :height="H" :fill="`url(#${id('sky')})`" />
    <circle class="halo" :cx="VP.x" :cy="VP.y" r="190" :fill="`url(#${id('halo')})`" />
    <circle class="sun" :cx="VP.x" :cy="SUN_Y" r="66" :fill="`url(#${id('sun')})`" :mask="`url(#${id('stripes')})`" />

    <!-- Walls, ceiling and floor of the stoa, running to the far end -->
    <polygon :points="leftWall" fill="#16051f" />
    <polygon :points="rightWall" fill="#16051f" />
    <polygon :points="ceiling" :fill="`url(#${id('ceiling')})`" />
    <polygon :points="floor" :fill="`url(#${id('floor')})`" />

    <!-- The neon floor -->
    <g
      class="grid"
      :clip-path="`url(#${id('floor-clip')})`"
      stroke="#ff4fd8"
      stroke-width="1.5"
      stroke-opacity="0.55"
      :filter="`url(#${id('glow')})`"
    >
      <line v-for="(r, i) in floorRays" :key="`r${i}`" :x1="r.x1" :y1="r.y1" :x2="r.x2" :y2="r.y2" />
      <line v-for="(y, i) in floorLines" :key="`l${i}`" x1="0" :x2="W" :y1="y" :y2="y" />
    </g>

    <!-- Ceiling beams -->
    <g class="beams" stroke="#c084fc" stroke-linecap="round">
      <line
        v-for="d in beams"
        :key="d"
        :x1="VP.x - (HALF_WIDTH + 50) * d"
        :x2="VP.x + (HALF_WIDTH + 50) * d"
        :y1="VP.y - (CEILING - 16) * d"
        :y2="VP.y - (CEILING - 16) * d"
        :stroke-width="Math.max(1, 14 * d)"
        :stroke-opacity="0.25 + 0.35 * d"
      />
    </g>

    <!-- The architrave along the top of each row of columns -->
    <polygon :points="leftBeam" fill="#4a1460" />
    <polygon :points="rightBeam" fill="#4a1460" />

    <!-- The columns, far to near -->
    <g class="columns">
      <g v-for="c in columns" :key="c.key">
        <polygon :points="c.shaft" :fill="`url(#${id('column')})`" />
        <line
          v-for="(f, i) in c.flutes"
          :key="i"
          :x1="f.x1"
          :x2="f.x2"
          :y1="f.y1"
          :y2="f.y2"
          stroke="#3a0f4f"
          stroke-opacity="0.55"
          :stroke-width="3 * c.d"
        />
        <polygon :points="c.echinus" fill="#8a3aa8" />
        <polygon :points="c.abacus" fill="#b06ad4" />
      </g>
    </g>

    <!-- Neon edges, all leading the eye to the far end -->
    <g class="neon" fill="none" stroke="#f472d0" stroke-linejoin="round" :filter="`url(#${id('glow')})`">
      <polygon v-for="c in columns" :key="`n${c.key}`" :points="c.shaft" :stroke-width="Math.max(1, 3 * c.d)" />
      <polygon :points="leftBeam" stroke-width="2.5" />
      <polygon :points="rightBeam" stroke-width="2.5" />
      <rect :x="end.x" :y="end.y" :width="end.w" :height="end.h" stroke-width="1.5" />
    </g>
  </svg>
</template>
