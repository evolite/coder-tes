<template>
  <Teleport to="body">
    <!-- Backdrop -->
    <Transition name="backdrop">
      <div
        v-if="task"
        class="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
        @click="$emit('close')"
      />
    </Transition>

    <!-- Panel -->
    <Transition name="slide">
      <div
        v-if="task"
        class="fixed right-0 top-0 z-50 h-full w-[480px] bg-white dark:bg-gray-900 shadow-2xl flex flex-col overflow-hidden"
      >
        <!-- ── Header ──────────────────────────────────────────── -->
        <div class="flex items-start gap-2 px-5 py-4 border-b border-gray-100 dark:border-gray-800">
          <h1
            ref="titleEl"
            contenteditable="true"
            suppressContentEditableWarning
            class="flex-1 text-base font-bold text-gray-900 dark:text-white outline-none leading-snug focus:ring-2 focus:ring-brand-500 rounded px-1 -ml-1 min-h-[1.5rem] break-words"
            @blur="onTitleBlur"
            @keydown.enter.prevent="($event.target as HTMLElement).blur()"
          >{{ task.title }}</h1>
          <Transition name="fade">
            <span v-if="saving" class="text-xs text-emerald-500 font-medium px-2">Saved ✓</span>
          </Transition>
          <button
            @click="handleDelete"
            class="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 transition flex-shrink-0"
            title="Delete task"
          >
            <Icon icon="heroicons:trash-20-solid" class="text-base" />
          </button>
          <button
            @click="$emit('close')"
            class="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition flex-shrink-0"
            title="Close"
          >
            <Icon icon="heroicons:x-mark-20-solid" class="text-base" />
          </button>
        </div>

        <!-- ── Scrollable body ────────────────────────────────── -->
        <div class="flex-1 overflow-y-auto px-5 py-4 space-y-5">

          <!-- Meta row: priority + status + due date -->
          <div class="flex flex-wrap items-center gap-2">
            <!-- Priority chips -->
            <div class="flex gap-1">
              <button
                v-for="p in PRIORITIES"
                :key="p.value"
                @click="patch({ priority: p.value })"
                class="px-2.5 py-0.5 rounded-full text-xs font-medium border transition"
                :class="task.priority === p.value ? p.activeClass : p.inactiveClass"
              >{{ p.label }}</button>
            </div>

            <!-- Status select -->
            <select
              :value="task.status"
              @change="patch({ status: ($event.target as HTMLSelectElement).value as TaskStatus })"
              class="meta-input"
            >
              <option value="backlog">Backlog</option>
              <option value="todo">To Do</option>
              <option value="in-progress">In Progress</option>
              <option value="done">Done</option>
            </select>

            <!-- Due date -->
            <input
              type="date"
              :value="task.dueDate ?? ''"
              @change="patch({ dueDate: ($event.target as HTMLInputElement).value || null })"
              class="meta-input"
            />
          </div>

          <!-- Tags -->
          <div>
            <p class="label">Tags</p>
            <div class="flex flex-wrap gap-1.5 mt-1">
              <span
                v-for="tag in task.tags"
                :key="tag"
                class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-brand-50 dark:bg-brand-900/30 text-brand-600 dark:text-brand-300"
              >
                {{ tag }}
                <button @click="removeTag(tag)" class="hover:text-brand-800 dark:hover:text-brand-100 leading-none">&times;</button>
              </span>
              <input
                v-model="newTag"
                @keydown.enter.prevent="addTag"
                class="inline-input w-24"
                placeholder="+ tag"
              />
            </div>
          </div>

          <!-- Description -->
          <div>
            <p class="label">Description</p>
            <textarea
              :value="task.description"
              @blur="onDescBlur"
              @input="descDraft = ($event.target as HTMLTextAreaElement).value"
              rows="3"
              class="mt-1 w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 px-3 py-2 text-sm text-gray-800 dark:text-gray-100 outline-none focus:ring-2 focus:ring-brand-500 resize-none"
              placeholder="Add a description…"
            />
          </div>

          <!-- Assignee / Reporter -->
          <div class="flex gap-6">
            <div>
              <p class="label mb-1">Assignee</p>
              <div class="flex items-center gap-2">
                <img
                  :src="task.assigneeAvatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${task.assignee}`"
                  :alt="task.assignee"
                  class="w-7 h-7 rounded-full border border-white dark:border-gray-700 bg-gray-200"
                />
                <span class="text-sm text-gray-700 dark:text-gray-300">{{ task.assignee }}</span>
              </div>
            </div>
            <div>
              <p class="label mb-1">Reporter</p>
              <div class="flex items-center gap-2">
                <img
                  :src="`https://api.dicebear.com/7.x/avataaars/svg?seed=${task.reporter}`"
                  :alt="task.reporter"
                  class="w-7 h-7 rounded-full border border-white dark:border-gray-700 bg-gray-200"
                />
                <span class="text-sm text-gray-700 dark:text-gray-300">{{ task.reporter }}</span>
              </div>
            </div>
          </div>

          <!-- Subtasks -->
          <div>
            <div class="flex items-center justify-between mb-2">
              <p class="label">Subtasks</p>
              <span class="text-xs text-gray-400">{{ doneSubtasks }}/{{ task.subtasks.length }}</span>
            </div>

            <!-- Progress bar -->
            <div v-if="task.subtasks.length" class="h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden mb-3">
              <div
                class="h-full bg-brand-500 rounded-full transition-all duration-300"
                :style="{ width: subtaskPct + '%' }"
              />
            </div>

            <ul class="space-y-1.5">
              <li
                v-for="sub in task.subtasks"
                :key="sub.id"
                class="flex items-center gap-2 group"
              >
                <button
                  @click="taskStore.toggleSubtask(task!.id, sub.id)"
                  class="w-4 h-4 rounded border flex-shrink-0 flex items-center justify-center transition"
                  :class="sub.done
                    ? 'bg-brand-500 border-brand-500 text-white'
                    : 'border-gray-300 dark:border-gray-600 hover:border-brand-400'"
                >
                  <Icon v-if="sub.done" icon="heroicons:check-20-solid" class="text-[10px]" />
                </button>
                <span
                  class="text-sm flex-1"
                  :class="sub.done ? 'line-through text-gray-400' : 'text-gray-700 dark:text-gray-300'"
                >{{ sub.title }}</span>
              </li>
            </ul>

            <div class="mt-2 flex gap-2">
              <input
                v-model="newSubtask"
                @keydown.enter.prevent="addSubtask"
                class="inline-input flex-1"
                placeholder="Add subtask…"
              />
              <button
                @click="addSubtask"
                :disabled="!newSubtask.trim()"
                class="px-3 py-1 rounded-lg text-xs bg-brand-600 text-white hover:bg-brand-700 disabled:opacity-40 transition"
              >Add</button>
            </div>
          </div>

          <!-- Comments -->
          <div>
            <p class="label mb-3">Comments</p>
            <ul class="space-y-3">
              <li
                v-for="c in task.comments"
                :key="c.id"
                class="flex items-start gap-3"
              >
                <img
                  :src="c.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${c.author}`"
                  :alt="c.author"
                  class="w-7 h-7 rounded-full border border-white dark:border-gray-700 bg-gray-200 flex-shrink-0 mt-0.5"
                />
                <div class="flex-1 min-w-0">
                  <div class="flex items-center gap-2 mb-0.5">
                    <span class="text-xs font-semibold text-gray-800 dark:text-gray-200">{{ c.author }}</span>
                    <span class="text-[10px] text-gray-400">{{ timeAgo(c.createdAt) }}</span>
                  </div>
                  <p class="text-sm text-gray-700 dark:text-gray-300 leading-snug">{{ c.body }}</p>
                </div>
              </li>
              <li v-if="!task.comments.length" class="text-xs text-gray-400 text-center py-2">No comments yet.</li>
            </ul>

            <!-- Add comment -->
            <div class="mt-3">
              <textarea
                v-model="newComment"
                rows="2"
                class="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 px-3 py-2 text-sm text-gray-800 dark:text-gray-100 outline-none focus:ring-2 focus:ring-brand-500 resize-none"
                placeholder="Write a comment…"
              />
              <div class="flex justify-end mt-1">
                <button
                  @click="postComment"
                  :disabled="!newComment.trim()"
                  class="px-3 py-1.5 rounded-lg text-xs bg-brand-600 text-white font-medium hover:bg-brand-700 disabled:opacity-40 transition"
                >Post</button>
              </div>
            </div>
          </div>

        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { Icon } from '@iconify/vue'
import { formatDistanceToNow, parseISO } from 'date-fns'
import { useTaskStore } from '@/stores/tasks'
import type { Task, TaskStatus } from '@/types'

const props = defineProps<{ task: Task | null }>()
const emit = defineEmits<{ (e: 'close'): void }>()

const taskStore = useTaskStore()

// ── helpers ────────────────────────────────────────────────
const PRIORITIES = [
  {
    value: 'high' as const,
    label: 'High',
    activeClass: 'bg-red-100 border-red-300 text-red-700 dark:bg-red-900/40 dark:border-red-700 dark:text-red-400',
    inactiveClass: 'border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:border-red-300 hover:text-red-600',
  },
  {
    value: 'medium' as const,
    label: 'Med',
    activeClass: 'bg-amber-100 border-amber-300 text-amber-700 dark:bg-amber-900/40 dark:border-amber-700 dark:text-amber-400',
    inactiveClass: 'border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:border-amber-300 hover:text-amber-600',
  },
  {
    value: 'low' as const,
    label: 'Low',
    activeClass: 'bg-emerald-100 border-emerald-300 text-emerald-700 dark:bg-emerald-900/40 dark:border-emerald-700 dark:text-emerald-400',
    inactiveClass: 'border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:border-emerald-300 hover:text-emerald-600',
  },
]

// ── local state ────────────────────────────────────────────
const newTag      = ref('')
const newSubtask  = ref('')
const newComment  = ref('')
const descDraft   = ref('')
const titleEl     = ref<HTMLElement | null>(null)
const saving      = ref(false)
let savingTimer: ReturnType<typeof setTimeout> | null = null

// Sync descDraft when task changes
watch(() => props.task, (t) => {
  descDraft.value = t?.description ?? ''
}, { immediate: true })

// ── computed ───────────────────────────────────────────────
const doneSubtasks = computed(() => props.task?.subtasks.filter(s => s.done).length ?? 0)
const subtaskPct = computed(() => {
  const total = props.task?.subtasks.length ?? 0
  return total ? Math.round((doneSubtasks.value / total) * 100) : 0
})

// ── actions ────────────────────────────────────────────────
function patch(partial: Partial<Task>) {
  if (props.task) {
    taskStore.updateTask(props.task.id, partial)
    // Show saved badge for 800ms
    if (savingTimer) clearTimeout(savingTimer)
    saving.value = true
    savingTimer = setTimeout(() => { saving.value = false }, 800)
  }
}

function onTitleBlur(e: FocusEvent) {
  const text = (e.target as HTMLElement).innerText.trim()
  if (text && props.task && text !== props.task.title) {
    patch({ title: text })
  } else if (props.task && titleEl.value) {
    // Restore if empty
    titleEl.value.innerText = props.task.title
  }
}

function onDescBlur() {
  if (props.task && descDraft.value !== props.task.description) {
    patch({ description: descDraft.value })
  }
}

function removeTag(tag: string) {
  if (!props.task) return
  patch({ tags: props.task.tags.filter(t => t !== tag) })
}

function addTag() {
  const t = newTag.value.trim()
  if (!t || !props.task) return
  if (!props.task.tags.includes(t)) {
    patch({ tags: [...props.task.tags, t] })
  }
  newTag.value = ''
}

function addSubtask() {
  const t = newSubtask.value.trim()
  if (!t || !props.task) return
  taskStore.addSubtask(props.task.id, t)
  newSubtask.value = ''
}

function postComment() {
  const body = newComment.value.trim()
  if (!body || !props.task) return
  taskStore.addComment(props.task.id, body, 'You', '')
  newComment.value = ''
}

function handleDelete() {
  if (!props.task) return
  taskStore.deleteTask(props.task.id)
  emit('close')
}

function timeAgo(ts: string) {
  try { return formatDistanceToNow(parseISO(ts), { addSuffix: true }) }
  catch { return '' }
}
</script>

<style scoped>
.label {
  @apply text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide;
}

.meta-input {
  @apply rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800
         px-2.5 py-1 text-xs text-gray-700 dark:text-gray-200 outline-none
         focus:ring-2 focus:ring-brand-500 cursor-pointer;
}

.inline-input {
  @apply rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800
         px-2.5 py-1 text-sm text-gray-800 dark:text-gray-100 outline-none
         focus:ring-2 focus:ring-brand-500;
}

/* Slide transition */
.slide-enter-active,
.slide-leave-active {
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}
.slide-enter-from,
.slide-leave-to {
  transform: translateX(100%);
}

/* Fade transition for Saved badge */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* Backdrop transition */
.backdrop-enter-active,
.backdrop-leave-active {
  transition: opacity 0.25s ease;
}
.backdrop-enter-from,
.backdrop-leave-to {
  opacity: 0;
}
</style>
