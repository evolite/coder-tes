import { onMounted, onUnmounted } from 'vue'
import { useTaskStore } from '@/stores/tasks'
import { useProjectStore } from '@/stores/projects'
import type { Task, Project } from '@/types'

const POLL_MS = 8_000

export function useLiveState() {
  const taskStore    = useTaskStore()
  const projectStore = useProjectStore()
  let timer: ReturnType<typeof setInterval>

  async function sync() {
    try {
      const res = await fetch('/api/state')
      if (!res.ok) return
      const remote = await res.json() as { tasks: Task[], projects: Project[] }

      // ── merge tasks ──────────────────────────────────────────
      for (const rt of remote.tasks) {
        const local = taskStore.tasks.find(t => t.id === rt.id)
        if (local) {
          // remote wins for status only — user edits win for everything else
          if (local.status !== rt.status) {
            taskStore.updateTaskLocal(local.id, { status: rt.status })
          }
        } else {
          // task exists remotely but not locally — add it
          taskStore.tasks.push(rt)
        }
      }

      // ── push local-only tasks up to the API ──────────────────
      for (const lt of taskStore.tasks) {
        const inRemote = remote.tasks.find(t => t.id === lt.id)
        if (!inRemote) {
          await fetch('/api/tasks', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(lt),
          }).catch(() => {})
        }
      }

      // ── merge projects ───────────────────────────────────────
      for (const rp of remote.projects) {
        const local = projectStore.projects.find(p => p.id === rp.id)
        if (!local) projectStore.projects.push(rp)
      }
      for (const lp of projectStore.projects) {
        const inRemote = remote.projects.find(p => p.id === lp.id)
        if (!inRemote) {
          await fetch('/api/projects', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(lp),
          }).catch(() => {})
        }
      }

    } catch {
      // server offline — localStorage is source of truth
    }
  }

  onMounted(() => { sync(); timer = setInterval(sync, POLL_MS) })
  onUnmounted(() => clearInterval(timer))

  return { sync }
}
