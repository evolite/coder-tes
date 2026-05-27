import { onMounted, onUnmounted } from 'vue'
import { useTaskStore } from '@/stores/tasks'
import type { TaskStatus } from '@/types'

const API_BASE   = window.location.hostname === 'localhost'
  ? 'http://localhost:3333'
  : `${window.location.protocol}//3333--main--project-dashboard--oaaler.slashdir.net`
const POLL_MS    = 8_000
const SEED_VER   = '3'   // bump this to force a localStorage reseed

export function useLiveState() {
  const taskStore = useTaskStore()
  let timer: ReturnType<typeof setInterval>

  // ── force reseed if seed version changed ──────────────────────────────────
  if (localStorage.getItem('pm-seed-version') !== SEED_VER) {
    ;['pm-projects', 'pm-tasks', 'pm-activity'].forEach(k => localStorage.removeItem(k))
    localStorage.setItem('pm-seed-version', SEED_VER)
    window.location.reload()
  }

  async function sync() {
    try {
      const res = await fetch(`${API_BASE}/api/state`)
      if (!res.ok) return
      const { tasks } = await res.json() as { tasks: { title: string; status: TaskStatus }[] }

      for (const remote of tasks) {
        const local = taskStore.tasks.find(t => t.title === remote.title)
        if (local && local.status !== remote.status) {
          taskStore.updateTask(local.id, { status: remote.status })
        }
      }
    } catch {
      // server offline — silent fail
    }
  }

  onMounted(() => {
    sync()
    timer = setInterval(sync, POLL_MS)
  })

  onUnmounted(() => clearInterval(timer))

  return { sync }
}
