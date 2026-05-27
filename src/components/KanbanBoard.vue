<template>
  <div class="flex gap-4 overflow-x-auto pb-2 flex-1">
    <KanbanColumn
      v-for="col in COLUMNS"
      :key="col.status"
      :status="col.status"
      :label="col.label"
      :dotColor="col.dot"
      :tasks="columnTasks(col.status)"
      @open="$emit('open', $event)"
      @add="openAddForm"
    />
  </div>

  <!-- Add Task Modal -->
  <Teleport to="body">
    <div
      v-if="showAdd"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
      @click.self="showAdd = false"
    >
      <div class="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-md p-6">
        <h2 class="text-lg font-bold mb-4 text-gray-900 dark:text-white">Add Task</h2>
        <div class="space-y-3">
          <div>
            <label class="text-xs font-medium text-gray-500 dark:text-gray-400">Title *</label>
            <input v-model="form.title" class="input mt-1" placeholder="Task title" autofocus />
          </div>
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="text-xs font-medium text-gray-500 dark:text-gray-400">Status</label>
              <select v-model="form.status" class="input mt-1">
                <option v-for="c in COLUMNS" :key="c.status" :value="c.status">{{ c.label }}</option>
              </select>
            </div>
            <div>
              <label class="text-xs font-medium text-gray-500 dark:text-gray-400">Priority</label>
              <select v-model="form.priority" class="input mt-1">
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>
          </div>
          <div>
            <label class="text-xs font-medium text-gray-500 dark:text-gray-400">Due Date</label>
            <input v-model="form.dueDate" type="date" class="input mt-1" />
          </div>
          <div>
            <label class="text-xs font-medium text-gray-500 dark:text-gray-400">Tags (comma separated)</label>
            <input v-model="form.tagsRaw" class="input mt-1" placeholder="Frontend, Bug" />
          </div>
        </div>
        <div class="flex gap-2 justify-end mt-5">
          <button @click="showAdd = false" class="btn-ghost">Cancel</button>
          <button @click="submitAdd" :disabled="!form.title.trim()" class="btn-primary">Add Task</button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import KanbanColumn from './KanbanColumn.vue'
import { useTaskStore }    from '@/stores/tasks'
import { useProjectStore } from '@/stores/projects'
import type { Task, TaskStatus } from '@/types'

defineEmits<{ (e: 'open', t: Task): void }>()

const taskStore    = useTaskStore()
const projectStore = useProjectStore()
const activeId     = computed(() => projectStore.activeProject()?.id ?? '')

const COLUMNS = [
  { status: 'backlog'     as TaskStatus, label: 'Backlog',     dot: 'bg-gray-400' },
  { status: 'todo'        as TaskStatus, label: 'To Do',       dot: 'bg-blue-400' },
  { status: 'in-progress' as TaskStatus, label: 'In Progress', dot: 'bg-amber-400' },
  { status: 'done'        as TaskStatus, label: 'Done',        dot: 'bg-emerald-400' },
]

function columnTasks(status: TaskStatus) {
  return taskStore.columnTasks(activeId.value, status).value
}

// Add form
const showAdd = ref(false)
const form = reactive({
  title:    '',
  status:   'todo' as TaskStatus,
  priority: 'medium' as Task['priority'],
  dueDate:  '',
  tagsRaw:  '',
})

function openAddForm(status: TaskStatus) {
  form.title    = ''
  form.status   = status
  form.priority = 'medium'
  form.dueDate  = ''
  form.tagsRaw  = ''
  showAdd.value = true
}

function submitAdd() {
  if (!form.title.trim()) return
  taskStore.addTask({
    projectId:     activeId.value,
    title:         form.title.trim(),
    description:   '',
    status:        form.status,
    priority:      form.priority,
    tags:          form.tagsRaw.split(',').map(t => t.trim()).filter(Boolean),
    assignee:      'You',
    assigneeAvatar: '',
    reporter:      'You',
    dueDate:       form.dueDate || null,
    sprintId:      null,
  })
  showAdd.value = false
}
</script>

<style scoped>
.input {
  @apply w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-brand-500 text-gray-800 dark:text-gray-100;
}
.btn-ghost {
  @apply px-4 py-2 rounded-lg text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition;
}
.btn-primary {
  @apply px-4 py-2 rounded-lg text-sm bg-brand-600 text-white font-medium hover:bg-brand-700 disabled:opacity-40 transition;
}
</style>
