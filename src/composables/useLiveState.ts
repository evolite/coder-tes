import { onMounted, onUnmounted } from 'vue'
import { useTaskStore } from '@/stores/tasks'
import type { TaskStatus } from '@/types'

const API_BASE = 'http://localhost:3333'
const POLL_MS  = 10_000   // re-sync every 10 s

export function useLiveState() {
  const taskStore = useTaskStore()
  let timer: ReturnType<typeof setInterval>

  async function sync() {
    try {
      const res  = await fetch(`${API_BASE}/api/state`)
      if (!res.ok) return
      const { tasks } = await res.json() as { tasks: { title: string; status: TaskStatus }[] }

      for (const remote of tasks) {
        const local = taskStore.tasks.find(t => t.title === remote.title)
        if (local && local.status !== remote.status) {
          taskStore.updateTask(local.id, { status: remote.status })
        }
      }
    } catch {
      // server not running — silent fail
    }
  }

  onMounted(() => {
    sync()
    timer = setInterval(sync, POLL_MS)
  })

  onUnmounted(() => clearInterval(timer))

  return { sync }
}
