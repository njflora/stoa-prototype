<script setup lang="ts">
import { computed } from 'vue'

// A simple themed animation per show, laid over the painting while a card
// previews. Plain CSS and inline SVG: nothing to download. Only transform,
// opacity and SVG stroke offsets animate, so it stays smooth.

const props = defineProps<{ showId: string }>()

type Theme = 'talk' | 'sunrise' | 'voices' | 'history' | 'routes' | 'market' | 'stage'

const themes: Record<string, Theme> = {
  'stoa-podcast': 'talk',
  'morning-brief': 'sunrise',
  conversations: 'voices',
  chronos: 'history',
  statecraft: 'routes',
  ledger: 'market',
  'the-forum': 'stage',
}

const theme = computed<Theme>(() => themes[props.showId] ?? 'talk')

// Fixed positions for drifting dust, so it looks the same every time.
const dust = [
  [12, 80, 0], [24, 65, 1.2], [37, 90, 2.4], [48, 70, 0.6], [59, 85, 1.8], [71, 60, 3],
  [82, 78, 0.9], [90, 92, 2.1], [18, 95, 3.3], [65, 98, 1.5], [44, 55, 2.7], [78, 50, 0.3],
] as const
</script>

<template>
  <div class="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
    <!-- The Stoa Podcast: audio levels, like a live talk show. -->
    <div v-if="theme === 'talk'" class="absolute right-3 bottom-4 flex h-10 items-end gap-[3px]">
      <span v-for="n in 9" :key="n" class="bar" :style="{ animationDelay: `${(n * 137) % 900}ms` }" />
    </div>

    <!-- Morning Brief: a sunrise glow lifting from the bottom. -->
    <template v-else-if="theme === 'sunrise'">
      <div class="sun" />
      <div class="rays" />
    </template>

    <!-- Conversations: two voices taking turns. -->
    <template v-else-if="theme === 'voices'">
      <div class="voice left-[28%]"><span /><span /><span /></div>
      <div class="voice voice-b left-[72%]"><span /><span /><span /></div>
    </template>

    <!-- Chronos: candlelight sweeping across, and drifting dust. -->
    <template v-else-if="theme === 'history'">
      <div class="candle" />
      <span
        v-for="([x, y, delay], i) in dust"
        :key="i"
        class="speck"
        :style="{ left: `${x}%`, top: `${y}%`, animationDelay: `${delay}s` }"
      />
    </template>

    <!-- Statecraft: routes drawing themselves across a map grid. -->
    <svg v-else-if="theme === 'routes'" class="absolute inset-0 size-full" viewBox="0 0 160 90" preserveAspectRatio="none">
      <g stroke="rgb(255 255 255 / 0.12)" stroke-width="0.4">
        <line v-for="x in 7" :key="`x${x}`" :x1="x * 20" y1="0" :x2="x * 20" y2="90" />
        <line v-for="y in 4" :key="`y${y}`" x1="0" :y1="y * 18" x2="160" :y2="y * 18" />
      </g>
      <path class="route" d="M18 64 Q 60 20 104 38 T 146 22" />
      <path class="route route-b" d="M30 22 Q 70 70 120 66" />
      <circle class="pin" cx="146" cy="22" r="2" />
      <circle class="pin pin-b" cx="120" cy="66" r="2" />
    </svg>

    <!-- Ledger: a price line drawing itself. -->
    <svg v-else-if="theme === 'market'" class="absolute inset-x-0 bottom-3 h-1/2 w-full" viewBox="0 0 160 50" preserveAspectRatio="none">
      <path class="price" d="M0 38 L18 32 L32 36 L48 22 L62 27 L78 14 L94 20 L110 9 L126 16 L142 6 L160 11" />
    </svg>

    <!-- The Forum: two stage spotlights sweeping. -->
    <template v-else>
      <div class="spot" />
      <div class="spot spot-b" />
    </template>
  </div>
</template>

<style scoped>
/* Talk: audio levels */
.bar {
  width: 4px;
  height: 100%;
  border-radius: 2px;
  background: rgb(255 255 255 / 0.85);
  transform-origin: bottom;
  animation: level 0.9s ease-in-out infinite alternate;
}
@keyframes level {
  from { transform: scaleY(0.15); }
  to { transform: scaleY(1); }
}

/* Sunrise */
.sun {
  position: absolute;
  left: 50%;
  bottom: -55%;
  width: 70%;
  aspect-ratio: 1;
  margin-left: -35%;
  border-radius: 50%;
  background: radial-gradient(circle, rgb(255 210 120 / 0.75), rgb(255 150 60 / 0.25) 45%, transparent 70%);
  animation: rise 6s ease-out infinite;
}
.rays {
  position: absolute;
  inset: 0;
  background: linear-gradient(to top, rgb(255 190 110 / 0.35), transparent 60%);
  animation: glow 6s ease-out infinite;
}
@keyframes rise {
  from { transform: translateY(30%); opacity: 0.4; }
  to { transform: translateY(-12%); opacity: 1; }
}
@keyframes glow {
  from { opacity: 0; }
  to { opacity: 1; }
}

/* Voices: ripples that take turns */
.voice {
  position: absolute;
  top: 45%;
}
.voice span {
  position: absolute;
  left: -14px;
  top: -14px;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  border: 2px solid rgb(255 255 255 / 0.8);
  opacity: 0;
  animation: ripple 2.4s ease-out infinite;
}
.voice span:nth-child(2) { animation-delay: 0.3s; }
.voice span:nth-child(3) { animation-delay: 0.6s; }
.voice-b span { animation-delay: 1.2s; }
.voice-b span:nth-child(2) { animation-delay: 1.5s; }
.voice-b span:nth-child(3) { animation-delay: 1.8s; }
@keyframes ripple {
  0% { transform: scale(0.4); opacity: 0.9; }
  50% { transform: scale(1.8); opacity: 0; }
  100% { transform: scale(1.8); opacity: 0; }
}

/* History: candlelight and dust */
.candle {
  position: absolute;
  inset: -20% -40%;
  background: radial-gradient(ellipse at center, rgb(255 190 110 / 0.35), transparent 55%);
  animation: sweep 7s ease-in-out infinite alternate;
}
.speck {
  position: absolute;
  width: 3px;
  height: 3px;
  border-radius: 50%;
  background: rgb(255 230 190 / 0.9);
  box-shadow: 0 0 6px rgb(255 200 140 / 0.9);
  animation: drift 4s linear infinite;
}
@keyframes sweep {
  from { transform: translateX(-25%); }
  to { transform: translateX(25%); }
}
@keyframes drift {
  0% { transform: translate(0, 0); opacity: 0; }
  20% { opacity: 1; }
  100% { transform: translate(12px, -60px); opacity: 0; }
}

/* Routes: dashed lines drawing themselves */
.route {
  fill: none;
  stroke: rgb(255 255 255 / 0.85);
  stroke-width: 1;
  stroke-dasharray: 3 2;
  animation: draw 4s ease-in-out infinite;
  stroke-dashoffset: 200;
}
.route-b {
  stroke: rgb(168 218 220 / 0.85);
  animation-delay: 1s;
}
.pin {
  fill: #fff;
  animation: blink 2s ease-in-out infinite;
}
.pin-b {
  fill: #a8dadc;
  animation-delay: 1s;
}
@keyframes draw {
  from { stroke-dashoffset: 200; }
  to { stroke-dashoffset: 0; }
}
@keyframes blink {
  0%, 100% { opacity: 0.2; }
  50% { opacity: 1; }
}

/* Market: a price line */
.price {
  fill: none;
  stroke: rgb(170 230 140 / 0.95);
  stroke-width: 1.5;
  stroke-linejoin: round;
  stroke-dasharray: 220;
  stroke-dashoffset: 220;
  animation: chart 5s ease-out infinite;
  filter: drop-shadow(0 0 3px rgb(170 230 140 / 0.8));
}
@keyframes chart {
  0% { stroke-dashoffset: 220; opacity: 1; }
  80% { stroke-dashoffset: 0; opacity: 1; }
  100% { stroke-dashoffset: 0; opacity: 0; }
}

/* Stage: two spotlights */
.spot {
  position: absolute;
  top: -30%;
  left: 20%;
  width: 40%;
  height: 160%;
  background: linear-gradient(to bottom, rgb(255 240 210 / 0.45), transparent 75%);
  clip-path: polygon(45% 0, 55% 0, 100% 100%, 0 100%);
  transform-origin: 50% 0;
  animation: beam 4s ease-in-out infinite alternate;
}
.spot-b {
  left: 45%;
  animation-delay: -2s;
  animation-direction: alternate-reverse;
}
@keyframes beam {
  from { transform: rotate(-22deg); }
  to { transform: rotate(22deg); }
}
</style>
