<template>
  <div
    class="relative group rounded-xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-sm p-3 cursor-pointer hover:shadow-md hover:-translate-y-0.5 transition-all select-none"
    :class="{ 'dragging': dragging }"
    draggable="true"
    @dragstart="onDragStart"
    @dragend="dragging = false"
    @click="$emit('open', task)"
  >
    <!-- Priority stripe -->
    <div
      class="absolute top-0 left-0 w-1 h-full rounded-l-xl"
      :class="priorityStripe"
    />

    <div class="pl-2">
      <!-- Tags -->
      <div v-if="task.tags.length" class="flex flex-wrap gap-1 mb-2">
        <span
          v-for="tag in task.tags"
          :key="tag"
          class="text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-brand-50 dark:bg-brand-900/30 text-brand-600 dark:text-brand-300"
        >{{ tag }}</span>
      </div>

      <!-- Title -->
      <p class="text-sm font-medium text-gray-800 dark:text-gray-100 leading-snug mb-2">{{ task.title }}</p>

      <!-- Footer row -->
      <div class="flex items-center justify-between mt-1">
        <!-- Assignee avatar -->
        <img
          :src="task.assigneeAvatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${task.assignee}`"
          :alt="task.assignee"
          :title="task.assignee"
          class="w-6 h-6 rounded-full border border-white dark:border-gray-700 bg-gray-200"
        />

        <div class="flex items-center gap-2">
          <!-- Subtasks -->
          <span v-if="task.subtasks.length" class="flex items-center gap-0.5 text-[11px] text-gray-400">
            <Icon icon="heroicons:check-20-solid" class="text-xs" />
            {{ task.subtasks.filter(s => s.done).length }}/{{ task.subtasks.length }}
          </span>

          <!-- Due date -->
          <span
            v-if="task.dueDate"
            class="flex items-center gap-0.5 text-[11px] font-medium px-1.5 py-0.5 rounded-full"
            :class="dueDateClass"
          >
            <Icon icon="heroicons:calendar-20-solid" class="text-[10px]" />
            {{ formatDue(task.dueDate) }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { Icon } from '@iconify/vue'
import { format, parseISO, isAfter, startOfToday, differenceInCalendarDays } from 'date-fns'
import type { Task } from '@/types'

const props = defineProps<{ task: Task }>()
defineEmits<{ (e: 'open', t: Task): void }>()

const dragging = ref(false)

function onDragStart(e: DragEvent) {
  dragging.value = true
  e.dataTransfer!.setData('taskId', props.task.id)
  e.dataTransfer!.effectAllowed = 'move'
}

const priorityStripe = computed(() => ({
  high:   'bg-red-400',
  medium: 'bg-amber-400',
  low:    'bg-emerald-400',
}[props.task.priority]))

const dueDateClass = computed(() => {
  if (!props.task.dueDate) return ''
  const today = startOfToday()
  const d = parseISO(props.task.dueDate)
  const diff = differenceInCalendarDays(d, today)
  if (isAfter(today, d))       return 'bg-red-100 text-red-600 dark:bg-red-900/40 dark:text-red-400'
  if (diff <= 2)                return 'bg-amber-100 text-amber-600 dark:bg-amber-900/40 dark:text-amber-400'
  return 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400'
})

function formatDue(d: string) {
  const diff = differenceInCalendarDays(parseISO(d), startOfToday())
  if (diff === 0) return 'Today'
  if (diff === 1) return 'Tomorrow'
  if (diff === -1) return 'Yesterday'
  return format(parseISO(d), 'MMM d')
}
</script>
