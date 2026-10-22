<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { RouterLink } from 'vue-router'
import AppIcon from './AppIcon.vue'
import { useReminders, type ReminderTarget } from '@/composables/useReminders'
import { useViewer } from '@/composables/useViewer'

// Live reminders are a members' perk. Members turn browser notifications
// on or off; free viewers see an upgrade prompt in the same spot.

const props = withDefaults(
  defineProps<{
    target: ReminderTarget
    /** "large" sits on the countdown; "small" sits in schedule rows. */
    size?: 'large' | 'small'
  }>(),
  { size: 'small' },
)

const { isMember } = useViewer()
const { permission, isOn, turnOn, turnOff, restore } = useReminders()

const on = computed(() => isOn(props.target.id))
const base = computed(() =>
  props.size === 'large'
    ? 'inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold'
    : 'inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium',
)

function toggle() {
  if (on.value) turnOff(props.target.id)
  else void turnOn(props.target)
}

onMounted(() => restore(props.target))
</script>

<template>
  <RouterLink
    v-if="!isMember"
    to="/join"
    class="shrink-0 bg-gold text-ink hover:brightness-110"
    :class="base"
    :aria-label="`Upgrade for live reminders for ${target.title}`"
  >
    <AppIcon name="lock" />
    Upgrade for reminders
  </RouterLink>

  <span v-else-if="permission === 'unsupported'" class="shrink-0 text-xs text-muted">
    Reminders need a browser with notifications
  </span>

  <button
    v-else-if="permission === 'denied'"
    type="button"
    disabled
    class="shrink-0 cursor-not-allowed bg-raised text-white/60"
    :class="base"
    title="Allow notifications for this site in your browser settings"
  >
    <AppIcon name="bell" />
    Notifications blocked
  </button>

  <button
    v-else
    type="button"
    class="shrink-0 transition"
    :class="[
      base,
      on
        ? 'bg-white/15 text-white ring-1 ring-white/30 hover:bg-white/25'
        : size === 'large'
          ? 'bg-white text-ink hover:brightness-95'
          : 'bg-raised text-white hover:bg-line',
    ]"
    :aria-pressed="on"
    :aria-label="on ? `Turn off the reminder for ${target.title}` : `Notify me when ${target.title} goes live`"
    @click="toggle"
  >
    <AppIcon :name="on ? 'check' : 'bell'" />
    {{ on ? 'Reminder on' : 'Notify me' }}
  </button>
</template>
