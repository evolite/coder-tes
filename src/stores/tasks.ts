import { defineStore } from 'pinia'
import { useLocalStorage } from '@vueuse/core'
import { nanoid } from 'nanoid'
import { computed } from 'vue'
import { buildSeedTasks } from '@/utils/seed'
import { useProjectStore } from './projects'
import { useActivityStore } from './activity'
import type { Task, TaskStatus, Subtask, Comment } from '@/types'
import { isAfter, parseISO, startOfToday } from 'date-fns'

export const useTaskStore = defineStore('tasks', () => {
  const tasks = useLocalStorage<Task[]>('pm-tasks', () => {
    const ps = useProjectStore()
    return buildSeedTasks(ps.projects)
  })

  function projectTasks(projectId: string) {
    return computed(() => tasks.value.filter(t => t.projectId === projectId))
  }

  function columnTasks(projectId: string, status: TaskStatus) {
    return computed(() => tasks.value.filter(t => t.projectId === projectId && t.status === status))
  }

  function addTask(task: Omit<Task, 'id' | 'createdAt' | 'subtasks' | 'comments'>) {
    const t: Task = { ...task, id: nanoid(), createdAt: new Date().toISOString(), subtasks: [], comments: [] }
    tasks.value.push(t)
    const activity = useActivityStore()
    activity.push('You', '', 'created', t.title, `in ${statusLabel(t.status)}`)
    return t
  }

  function moveTask(taskId: string, newStatus: TaskStatus) {
    const t = tasks.value.find(t => t.id === taskId)
    if (!t || t.status === newStatus) return
    const old = t.status
    t.status = newStatus
    const activity = useActivityStore()
    activity.push('You', '', 'moved', t.title, `${statusLabel(old)} → ${statusLabel(newStatus)}`)
  }

  function updateTask(taskId: string, patch: Partial<Task>) {
    const idx = tasks.value.findIndex(t => t.id === taskId)
    if (idx !== -1) tasks.value[idx] = { ...tasks.value[idx], ...patch }
  }

  function deleteTask(taskId: string) {
    tasks.value = tasks.value.filter(t => t.id !== taskId)
  }

  function addSubtask(taskId: string, title: string) {
    const t = tasks.value.find(t => t.id === taskId)
    if (!t) return
    t.subtasks.push({ id: nanoid(), title, done: false })
  }

  function toggleSubtask(taskId: string, subtaskId: string) {
    const t = tasks.value.find(t => t.id === taskId)
    const s = t?.subtasks.find(s => s.id === subtaskId)
    if (s) s.done = !s.done
  }

  function addComment(taskId: string, body: string, author = 'You', avatar = '') {
    const t = tasks.value.find(t => t.id === taskId)
    if (!t) return
    const c: Comment = { id: nanoid(), author, avatar, body, createdAt: new Date().toISOString() }
    t.comments.push(c)
  }

  // Summary stats for a project
  function stats(projectId: string) {
    return computed(() => {
      const pts = tasks.value.filter(t => t.projectId === projectId)
      const total       = pts.length
      const done        = pts.filter(t => t.status === 'done').length
      const inProgress  = pts.filter(t => t.status === 'in-progress').length
      const today       = startOfToday()
      const overdue     = pts.filter(t => t.status !== 'done' && t.dueDate && isAfter(today, parseISO(t.dueDate))).length
      return { total, done, inProgress, overdue, pct: total ? Math.round((done / total) * 100) : 0 }
    })
  }

  return { tasks, projectTasks, columnTasks, addTask, moveTask, updateTask, deleteTask, addSubtask, toggleSubtask, addComment, stats }
})

function statusLabel(s: TaskStatus) {
  return { backlog: 'Backlog', todo: 'To Do', 'in-progress': 'In Progress', done: 'Done' }[s]
}
