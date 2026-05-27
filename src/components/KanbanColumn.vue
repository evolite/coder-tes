<template>
  <div
    class="flex flex-col h-full rounded-2xl bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 min-w-[260px] max-w-[300px] w-full"
    :class="{ 'drag-over': dragOver }"
    @dragover.prevent="dragOver = true"
    @dragleave="dragOver = false"
    @drop="onDrop"
  >
    <!-- Column header -->
    <div class="flex items-center justify-between px-4 pt-4 pb-2">
      <div class="flex items-center gap-2">
        <span class="w-2 h-2 rounded-full" :class="dotColor" />
        <span class="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">{{ label }}</span>
        <span class="text-xs font-bold bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-full px-2 py-0.5">
          {{ tasks.length }}
        </span>
      </div>
      <button
        @click="$emit('add', status)"
        class="p-1 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition text-gray-400 hover:text-brand-600 dark:hover:text-brand-400"
        title="Add task"
      >
        <Icon icon="heroicons:plus-20-solid" />
      </button>
    </div>

    <!-- Cards -->
    <div class="flex-1 overflow-y-auto px-3 pb-3 flex flex-col gap-2.5 scrollbar-thin">
      <TaskCard
        v-for="task in tasks"
        :key="task.id"
        :task="task"
        @open="$emit('open', $event)"
      />
      <div v-if="!tasks.length" class="flex flex-col items-center justify-center py-8 text-gray-300 dark:text-gray-600">
        <Icon icon="heroicons:inbox-20-solid" class="text-3xl mb-1" />
        <span class="text-xs">No tasks</span>
      </div>
    </div>

    <!-- Add task shortcut -->
    <div class="px-3 pb-3">
      <button
        @click="$emit('add', status)"
        class="w-full flex items-center gap-1.5 text-xs text-gray-400 hover:text-brand-500 dark:hover:text-brand-400 py-1.5 px-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition"
      >
        <Icon icon="heroicons:plus-circle-20-solid" />
        Add task
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Icon } from '@iconify/vue'
import TaskCard from './TaskCard.vue'
import type { Task, TaskStatus } from '@/types'
import { useTaskStore } from '@/stores/tasks'

const props = defineProps<{
  status: TaskStatus
  label: string
  tasks: Task[]
  dotColor: string
}>()

defineEmits<{
  (e: 'open', t: Task): void
  (e: 'add', s: TaskStatus): void
}>()

const taskStore = useTaskStore()
const dragOver  = ref(false)

function onDrop(e: DragEvent) {
  dragOver.value = false
  const id = e.dataTransfer?.getData('taskId')
  if (id) taskStore.moveTask(id, props.status)
}
</script>
