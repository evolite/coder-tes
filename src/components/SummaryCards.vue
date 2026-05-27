<template>
  <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
    <div
      v-for="card in cards"
      :key="card.label"
      class="rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 px-5 py-4 flex items-center gap-4 shadow-sm"
    >
      <div class="rounded-xl p-2.5" :class="card.iconBg">
        <Icon :icon="card.icon" class="text-xl" :class="card.iconColor" />
      </div>
      <div>
        <p class="text-2xl font-bold text-gray-900 dark:text-white leading-none">{{ card.value }}</p>
        <p class="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{{ card.label }}</p>
      </div>
      <div v-if="card.badge" class="ml-auto">
        <span
          class="text-xs font-semibold px-2 py-0.5 rounded-full"
          :class="card.badgeClass"
        >{{ card.badge }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Icon } from '@iconify/vue'
import { useTaskStore } from '@/stores/tasks'
import { useProjectStore } from '@/stores/projects'

const taskStore    = useProjectStore()
const activeId     = computed(() => taskStore.activeProject()?.id ?? '')
const s            = useTaskStore()
const stats        = computed(() => s.stats(activeId.value).value)

const cards = computed(() => [
  {
    label: 'Total Tasks',
    value: stats.value.total,
    icon: 'heroicons:clipboard-document-list-20-solid',
    iconBg: 'bg-brand-50 dark:bg-brand-900/30',
    iconColor: 'text-brand-600 dark:text-brand-400',
    badge: null, badgeClass: '',
  },
  {
    label: 'Completed',
    value: stats.value.done,
    icon: 'heroicons:check-circle-20-solid',
    iconBg: 'bg-emerald-50 dark:bg-emerald-900/30',
    iconColor: 'text-emerald-600 dark:text-emerald-400',
    badge: `${stats.value.pct}%`,
    badgeClass: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400',
  },
  {
    label: 'In Progress',
    value: stats.value.inProgress,
    icon: 'heroicons:arrow-path-20-solid',
    iconBg: 'bg-blue-50 dark:bg-blue-900/30',
    iconColor: 'text-blue-600 dark:text-blue-400',
    badge: null, badgeClass: '',
  },
  {
    label: 'Overdue',
    value: stats.value.overdue,
    icon: 'heroicons:exclamation-triangle-20-solid',
    iconBg: stats.value.overdue > 0 ? 'bg-red-50 dark:bg-red-900/30' : 'bg-gray-50 dark:bg-gray-800',
    iconColor: stats.value.overdue > 0 ? 'text-red-500' : 'text-gray-400',
    badge: null, badgeClass: '',
  },
])
</script>
