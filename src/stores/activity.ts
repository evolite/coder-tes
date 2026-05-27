import { defineStore } from 'pinia'
import { useLocalStorage } from '@vueuse/core'
import { nanoid } from 'nanoid'
import type { ActivityEntry } from '@/types'

export const useActivityStore = defineStore('activity', () => {
  const entries = useLocalStorage<ActivityEntry[]>('pm-activity', [])

  function push(actor: string, actorAvatar: string, action: string, target: string, detail: string) {
    entries.value.unshift({
      id: nanoid(), actor, actorAvatar, action, target, detail, timestamp: new Date().toISOString(),
    })
    if (entries.value.length > 20) entries.value = entries.value.slice(0, 20)
  }

  return { entries, push }
})
