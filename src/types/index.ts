// ─── Core domain types ───────────────────────────────────────────────────────

export type Priority = 'high' | 'medium' | 'low'
export type TaskStatus = 'backlog' | 'todo' | 'in-progress' | 'done'

export interface Subtask {
  id: string
  title: string
  done: boolean
}

export interface Comment {
  id: string
  author: string
  avatar: string
  body: string
  createdAt: string // ISO
}

export interface Task {
  id: string
  projectId: string
  title: string
  description: string
  status: TaskStatus
  priority: Priority
  tags: string[]
  assignee: string
  assigneeAvatar: string
  reporter: string
  dueDate: string | null // ISO date string YYYY-MM-DD
  subtasks: Subtask[]
  comments: Comment[]
  createdAt: string
  sprintId: string | null
}

export interface Sprint {
  id: string
  name: string
  startDate: string
  endDate: string
  velocity: number // tasks completed
}

export interface Project {
  id: string
  name: string
  color: string
  sprints: Sprint[]
  currentSprintId: string | null
}

export interface ActivityEntry {
  id: string
  actor: string
  actorAvatar: string
  action: string     // e.g. "moved"
  target: string     // task title
  detail: string     // e.g. "→ Done"
  timestamp: string  // ISO
}
