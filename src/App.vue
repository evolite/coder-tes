<template>
  <div class="h-screen flex flex-col overflow-hidden bg-gray-50 dark:bg-gray-950">
    <AppHeader />

    <div class="flex flex-1 overflow-hidden">
      <!-- Main content -->
      <main class="flex flex-col flex-1 overflow-hidden p-6 gap-5">
        <SummaryCards />
        <KanbanBoard class="flex-1 overflow-hidden min-h-0" @open="openTask" />
      </main>

      <!-- Right sidebar -->
      <aside class="hidden lg:flex flex-col w-72 border-l border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-4 gap-4 overflow-y-auto flex-shrink-0">
        <SprintProgress />
        <ActivityFeed />
      </aside>
    </div>

    <TaskSlideOver :task="selectedTask" @close="selectedTask = null" />
  </div>
</template>

<script setup lang="ts">
import { ref, watchEffect } from 'vue'
import { useDark } from '@vueuse/core'
import AppHeader from './components/AppHeader.vue'
import SummaryCards from './components/SummaryCards.vue'
import KanbanBoard from './components/KanbanBoard.vue'
import SprintProgress from './components/SprintProgress.vue'
import ActivityFeed from './components/ActivityFeed.vue'
import TaskSlideOver from './components/TaskSlideOver.vue'
import type { Task } from './types'

const isDark = useDark()

watchEffect(() => {
  if (isDark.value) {
    document.documentElement.classList.add('dark')
  } else {
    document.documentElement.classList.remove('dark')
  }
})

const selectedTask = ref<Task | null>(null)

function openTask(t: Task) {
  selectedTask.value = t
}
</script>
