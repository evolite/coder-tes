import { defineStore } from 'pinia'
import { useLocalStorage } from '@vueuse/core'
import { nanoid } from 'nanoid'
import { buildSeedProjects } from '@/utils/seed'
import type { Project, Sprint } from '@/types'

export const useProjectStore = defineStore('projects', () => {
  const projects = useLocalStorage<Project[]>('pm-projects', () => buildSeedProjects())
  const activeProjectId = useLocalStorage<string>('pm-active-project', () => projects.value[0]?.id ?? '')

  const activeProject = () => projects.value.find(p => p.id === activeProjectId.value) ?? projects.value[0]

  function addProject(name: string, color: string) {
    const p: Project = { id: nanoid(), name, color, sprints: [], currentSprintId: null }
    projects.value.push(p)
    activeProjectId.value = p.id
  }

  function updateProject(id: string, patch: Partial<Project>) {
    const idx = projects.value.findIndex(p => p.id === id)
    if (idx !== -1) projects.value[idx] = { ...projects.value[idx], ...patch }
  }

  function addSprint(projectId: string, sprint: Omit<Sprint, 'id'>) {
    const project = projects.value.find(p => p.id === projectId)
    if (!project) return
    const s: Sprint = { ...sprint, id: nanoid() }
    project.sprints.push(s)
    if (!project.currentSprintId) project.currentSprintId = s.id
  }

  return { projects, activeProjectId, activeProject, addProject, updateProject, addSprint }
})
