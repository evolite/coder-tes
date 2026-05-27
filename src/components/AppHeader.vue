<template>
  <header class="flex items-center justify-between px-6 py-3 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 shadow-sm z-30">
    <!-- Left: logo + title -->
    <div class="flex items-center gap-3">
      <div
        class="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center cursor-pointer"
        @click.shift="resetData"
        title="Shift+click to reset seed data"
      >
        <Icon icon="heroicons:squares-2x2-solid" class="text-white text-lg" />
      </div>
      <span class="font-bold text-lg tracking-tight text-gray-900 dark:text-white">ProjectPulse</span>
    </div>

    <!-- Center: project selector -->
    <div class="flex items-center gap-2">
      <div class="relative">
        <button
          @click="showProjectMenu = !showProjectMenu"
          class="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition"
        >
          <span
            class="w-2.5 h-2.5 rounded-full"
            :style="{ background: activeProject?.color ?? '#6366f1' }"
          />
          {{ activeProject?.name ?? 'Select project' }}
          <Icon icon="heroicons:chevron-down-20-solid" class="text-gray-400 text-xs" />
        </button>

        <!-- Dropdown -->
        <div
          v-if="showProjectMenu"
          v-click-outside="() => (showProjectMenu = false)"
          class="absolute left-0 top-full mt-1 w-56 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg z-50 overflow-hidden"
        >
          <button
            v-for="p in projects"
            :key="p.id"
            @click="selectProject(p.id)"
            class="w-full flex items-center gap-2 px-4 py-2.5 text-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition text-left"
            :class="p.id === activeProjectId ? 'font-semibold text-brand-600 dark:text-brand-400' : 'text-gray-700 dark:text-gray-300'"
          >
            <span class="w-2.5 h-2.5 rounded-full flex-shrink-0" :style="{ background: p.color }" />
            {{ p.name }}
          </button>
          <div class="border-t border-gray-100 dark:border-gray-700">
            <button
              @click="showProjectMenu = false; showNewProject = true"
              class="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-brand-600 dark:text-brand-400 hover:bg-gray-50 dark:hover:bg-gray-700 transition"
            >
              <Icon icon="heroicons:plus-circle-20-solid" />
              New project
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Right: date + dark mode -->
    <div class="flex items-center gap-3">
      <span class="text-xs text-gray-400 dark:text-gray-500 hidden sm:block">{{ todayLabel }}</span>
      <button
        @click="toggleDark()"
        class="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition"
        :title="isDark ? 'Light mode' : 'Dark mode'"
      >
        <Icon :icon="isDark ? 'heroicons:sun-20-solid' : 'heroicons:moon-20-solid'" class="text-gray-500 dark:text-gray-400 text-lg" />
      </button>
    </div>
  </header>

  <!-- New Project Modal -->
  <Teleport to="body">
    <div
      v-if="showNewProject"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
      @click.self="showNewProject = false"
    >
      <div class="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-sm p-6">
        <h2 class="text-lg font-bold mb-4 text-gray-900 dark:text-white">New Project</h2>
        <label class="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Name</label>
        <input
          v-model="newProjectName"
          class="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 px-3 py-2 text-sm mb-4 outline-none focus:ring-2 focus:ring-brand-500"
          placeholder="Project name"
          autofocus
        />
        <label class="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">Color</label>
        <div class="flex gap-2 mb-6">
          <button
            v-for="c in COLORS"
            :key="c"
            @click="newProjectColor = c"
            class="w-6 h-6 rounded-full border-2 transition"
            :class="newProjectColor === c ? 'border-gray-900 dark:border-white scale-110' : 'border-transparent'"
            :style="{ background: c }"
          />
        </div>
        <div class="flex gap-2 justify-end">
          <button
            @click="showNewProject = false"
            class="px-4 py-2 rounded-lg text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition"
          >Cancel</button>
          <button
            @click="createProject"
            :disabled="!newProjectName.trim()"
            class="px-4 py-2 rounded-lg text-sm bg-brand-600 text-white font-medium hover:bg-brand-700 disabled:opacity-40 transition"
          >Create</button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { Icon } from '@iconify/vue'
import { useDark, useToggle } from '@vueuse/core'
import { format } from 'date-fns'
import { useProjectStore } from '@/stores/projects'

const isDark = useDark()
const toggleDark = useToggle(isDark)

const store = useProjectStore()
const { projects, activeProjectId } = store

const activeProject = computed(() => store.activeProject())
const todayLabel = format(new Date(), 'EEE, MMM d yyyy')

const showProjectMenu = ref(false)
const showNewProject  = ref(false)
const newProjectName  = ref('')
const newProjectColor = ref('#6366f1')

const COLORS = ['#6366f1','#f59e0b','#10b981','#ef4444','#3b82f6','#8b5cf6','#ec4899','#14b8a6']

function selectProject(id: string) {
  store.activeProjectId = id
  showProjectMenu.value = false
}

function createProject() {
  if (!newProjectName.value.trim()) return
  store.addProject(newProjectName.value.trim(), newProjectColor.value)
  newProjectName.value = ''
  newProjectColor.value = '#6366f1'
  showNewProject.value = false
}

function resetData() {
  Object.keys(localStorage).filter(k => k.startsWith('pm-')).forEach(k => localStorage.removeItem(k))
  window.location.reload()
}

// Simple click-outside directive
const vClickOutside = {
  mounted(el: HTMLElement, binding: any) {
    el._clickOutside = (e: MouseEvent) => { if (!el.contains(e.target as Node)) binding.value(e) }
    document.addEventListener('click', el._clickOutside)
  },
  unmounted(el: HTMLElement) { document.removeEventListener('click', el._clickOutside) },
}
</script>
