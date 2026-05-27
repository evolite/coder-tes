<template>
  <div class="rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-sm p-5 flex flex-col">
    <h2 class="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4 flex items-center gap-2">
      <Icon icon="heroicons:bell-20-solid" class="text-brand-500" />
      Activity
    </h2>

    <div class="flex-1 overflow-y-auto space-y-3 max-h-96">
      <div
        v-for="entry in entries"
        :key="entry.id"
        class="flex items-start gap-3"
      >
        <img
          :src="entry.actorAvatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${entry.actor}`"
          :alt="entry.actor"
          class="w-7 h-7 rounded-full border border-white dark:border-gray-700 bg-gray-200 flex-shrink-0 mt-0.5"
        />
        <div class="flex-1 min-w-0">
          <p class="text-xs text-gray-700 dark:text-gray-300 leading-snug">
            <span class="font-semibold">{{ entry.actor }}</span>
            {{ ' ' + entry.action + ' ' }}
            <span class="italic truncate">{{ entry.target }}</span>
            <span class="text-gray-400"> {{ entry.detail }}</span>
          </p>
          <p class="text-[10px] text-gray-400 mt-0.5">{{ timeAgo(entry.timestamp) }}</p>
        </div>
      </div>

      <div v-if="!entries.length" class="text-center text-xs text-gray-400 py-8">
        No activity yet.
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Icon } from '@iconify/vue'
import { useActivityStore } from '@/stores/activity'
import { formatDistanceToNow, parseISO } from 'date-fns'
import { storeToRefs } from 'pinia'

const store   = useActivityStore()
const { entries } = storeToRefs(store)

function timeAgo(ts: string) {
  try { return formatDistanceToNow(parseISO(ts), { addSuffix: true }) }
  catch { return '' }
}
</script>
