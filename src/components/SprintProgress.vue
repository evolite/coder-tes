<template>
  <div class="rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-sm p-5">
    <h2 class="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4 flex items-center gap-2">
      <Icon icon="heroicons:rocket-launch-20-solid" class="text-brand-500" />
      Sprint Progress
    </h2>

    <template v-if="sprint">
      <div class="flex items-center justify-between mb-1">
        <span class="text-xs font-medium text-gray-700 dark:text-gray-300">{{ sprint.name }}</span>
        <span class="text-xs text-gray-400">{{ fmt(sprint.startDate) }} – {{ fmt(sprint.endDate) }}</span>
      </div>

      <!-- Progress bar -->
      <div class="h-2.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden mb-1">
        <div
          class="h-full bg-brand-500 rounded-full transition-all duration-500"
          :style="{ width: pct + '%' }"
        />
      </div>
      <div class="flex justify-between text-[11px] text-gray-400 mb-5">
        <span>{{ doneTasks }} / {{ sprintTasks }} tasks done</span>
        <span>{{ pct }}%</span>
      </div>

      <!-- Velocity chart -->
      <div class="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">Velocity (last {{ velocityData.length }} sprints)</div>
      <v-chart class="w-full h-28" :option="chartOption" :autoresize="true" />
    </template>

    <div v-else class="text-sm text-gray-400 py-4 text-center">
      No active sprint for this project.
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Icon } from '@iconify/vue'
import { format, parseISO } from 'date-fns'
import { use } from 'echarts/core'
import { LineChart } from 'echarts/charts'
import { GridComponent, TooltipComponent } from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'
import VChart from 'vue-echarts'
import { useProjectStore } from '@/stores/projects'
import { useTaskStore }    from '@/stores/tasks'
import { useDark }         from '@vueuse/core'

use([LineChart, GridComponent, TooltipComponent, CanvasRenderer])

const isDark       = useDark()
const projectStore = useProjectStore()
const taskStore    = useTaskStore()

const project = computed(() => projectStore.activeProject())
const sprint  = computed(() => project.value?.sprints.find(s => s.id === project.value?.currentSprintId) ?? null)

const sprintTasks = computed(() => {
  if (!sprint.value || !project.value) return 0
  return taskStore.tasks.filter(t => t.projectId === project.value!.id && t.sprintId === sprint.value!.id).length
})

const doneTasks = computed(() => {
  if (!sprint.value || !project.value) return 0
  return taskStore.tasks.filter(t => t.projectId === project.value!.id && t.sprintId === sprint.value!.id && t.status === 'done').length
})

const pct = computed(() => sprintTasks.value ? Math.round((doneTasks.value / sprintTasks.value) * 100) : 0)

const velocityData = computed(() => {
  const sprints = project.value?.sprints ?? []
  return sprints.slice(-5).map(s => s.velocity)
})

const sprintLabels = computed(() => {
  const sprints = project.value?.sprints ?? []
  return sprints.slice(-5).map(s => s.name)
})

const fmt = (d: string) => format(parseISO(d), 'MMM d')

const chartOption = computed(() => ({
  backgroundColor: 'transparent',
  grid: { top: 8, bottom: 18, left: 20, right: 8 },
  tooltip: { trigger: 'axis' },
  xAxis: {
    type: 'category',
    data: sprintLabels.value,
    axisLine: { show: false },
    axisTick: { show: false },
    axisLabel: { fontSize: 10, color: isDark.value ? '#9ca3af' : '#6b7280' },
  },
  yAxis: {
    type: 'value',
    splitLine: { lineStyle: { color: isDark.value ? '#374151' : '#f3f4f6' } },
    axisLabel: { fontSize: 10, color: isDark.value ? '#9ca3af' : '#6b7280' },
  },
  series: [{
    data: velocityData.value,
    type: 'line',
    smooth: true,
    symbol: 'circle',
    symbolSize: 5,
    lineStyle: { color: '#6366f1', width: 2 },
    itemStyle: { color: '#6366f1' },
    areaStyle: {
      color: {
        type: 'linear', x: 0, y: 0, x2: 0, y2: 1,
        colorStops: [
          { offset: 0, color: 'rgba(99,102,241,0.25)' },
          { offset: 1, color: 'rgba(99,102,241,0)' },
        ],
      },
    },
  }],
}))
</script>
