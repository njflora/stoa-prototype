<script setup lang="ts">
import { ref, useId } from 'vue'
import { useInstall } from '@/composables/useInstall'

// "Install app": opens the browser's install dialog, or on iPhone and iPad
// shows how to add the site to the Home Screen. Hidden once installed, and
// in browsers that cannot install it. The footer and the phone's More
// sheet pass their own link styling. It is a list item in both.
defineProps<{ buttonClass?: string }>()

const { canOffer, isIos, install } = useInstall()
const hintId = useId()
const showHint = ref(false)

async function onClick() {
  if (!(await install())) showHint.value = !showHint.value
}
</script>

<template>
  <li v-if="canOffer">
    <button type="button" :class="buttonClass" :aria-expanded="isIos ? showHint : undefined" :aria-controls="isIos ? hintId : undefined" @click="onClick">Install app</button>
    <p v-if="showHint" :id="hintId" class="mt-1 max-w-56 text-xs text-white/75">
      Tap <span class="font-semibold">Share</span>, then <span class="font-semibold">Add to Home Screen</span>.
    </p>
  </li>
</template>
