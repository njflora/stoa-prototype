<script setup lang="ts">
import { ref } from 'vue'
import { RouterLink } from 'vue-router'
import AppIcon from './AppIcon.vue'
import BuyEpisodeDialog from './BuyEpisodeDialog.vue'
import TitleCard from './TitleCard.vue'
import PitchNote from '@/pitch/PitchNote.vue'
import { useViewer } from '@/composables/useViewer'
import { artForEpisode } from '@/data/media'
import { EPISODE_PRICE } from '@/data/membership'
import type { Episode, Show } from '@/types/content'
import { formatPrice } from '@/utils/format'

// In place of the player, for a members' episode this viewer may not watch:
// the artwork, blurred, and two ways in. No stream addresses are fetched.

defineProps<{ show: Show; episode: Episode }>()

const { isSignedIn } = useViewer()
const buying = ref(false)

const secondary =
  'inline-flex items-center gap-2 rounded-lg bg-white/15 px-3 py-1.5 text-xs font-semibold sm:px-5 sm:py-2.5 sm:text-sm ring-1 ring-white/20 backdrop-blur hover:bg-white/25'
</script>

<template>
  <div class="relative aspect-video w-full overflow-hidden bg-black lg:rounded-xl">
    <TitleCard
      :show="show"
      :art="artForEpisode(episode)"
      :show-text="false"
      size="hero"
      :animated="false"
      class="scale-110 blur-xl brightness-75"
    />

    <div class="absolute inset-0 grid place-items-center px-4 text-center">
      <div>
        <!-- Phones: compact, so everything fits in a 16:9 frame 320px wide. -->
        <span
          class="mx-auto grid size-12 place-items-center rounded-full bg-black/55 ring-1 ring-white/20 max-sm:hidden"
        >
          <AppIcon name="lock" />
        </span>
        <p class="text-base font-semibold sm:mt-3 sm:text-2xl">This episode is for members</p>
        <!-- Two ways in: join for everything, or buy just this one. Buying needs an account. -->
        <div class="mt-2 flex flex-wrap justify-center gap-2 sm:mt-4 sm:gap-3">
          <RouterLink
            to="/join"
            class="inline-flex items-center gap-2 rounded-lg bg-gold px-3 py-1.5 text-xs font-semibold sm:px-5 sm:py-2.5 sm:text-sm text-ink hover:brightness-110 [&>svg]:size-4"
          >
            <AppIcon name="crown" />
            Upgrade to watch everything
          </RouterLink>
          <button v-if="isSignedIn" type="button" :class="secondary" @click="buying = true">
            Buy this episode, {{ formatPrice(EPISODE_PRICE) }}
          </button>
          <RouterLink v-else to="/sign-in" :class="secondary">
            Sign in to buy, {{ formatPrice(EPISODE_PRICE) }}
          </RouterLink>
        </div>
        <PitchNote id="buy-episode" class="mt-2 sm:mt-3" />
        <BuyEpisodeDialog v-model="buying" :episode="episode" />
      </div>
    </div>
  </div>
</template>
