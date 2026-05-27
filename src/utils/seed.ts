import { nanoid } from 'nanoid'
import type { Project, Task, ActivityEntry } from '@/types'
import { addDays, subDays, format } from 'date-fns'

const today = new Date()
const fmt = (d: Date) => format(d, 'yyyy-MM-dd')

const ME = {
  name: 'Coder Agent',
  avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=coder-agent&backgroundColor=6366f1',
}
const USER = {
  name: 'evolite',
  avatar: 'https://avatars.githubusercontent.com/u/1220440?v=4',
}

export function buildSeedProjects(): Project[] {
  const sprintScaffold = { id: nanoid(), name: 'Sprint 1 — Scaffold',   startDate: fmt(subDays(today, 10)), endDate: fmt(subDays(today, 3)), velocity: 5 }
  const sprintFeatures = { id: nanoid(), name: 'Sprint 2 — Features',   startDate: fmt(subDays(today, 3)),  endDate: fmt(addDays(today, 4)), velocity: 2 }
  const sprintPolish   = { id: nanoid(), name: 'Sprint 3 — Polish & Ship', startDate: fmt(addDays(today, 4)), endDate: fmt(addDays(today, 11)), velocity: 0 }

  const dashId = nanoid()

  return [
    {
      id: dashId,
      name: 'ProjectPulse Dashboard',
      color: '#6366f1',
      currentSprintId: sprintFeatures.id,
      sprints: [sprintScaffold, sprintFeatures, sprintPolish],
    },
  ]
}

export function buildSeedTasks(projects: Project[]): Task[] {
  const proj     = projects[0]
  const sprintId = proj.currentSprintId
  const s1Id     = proj.sprints[0].id
  const s2Id     = proj.sprints[1].id
  const s3Id     = proj.sprints[2].id

  const tasks: Omit<Task, 'id' | 'createdAt'>[] = [
    // ── Sprint 1 — DONE ───────────────────────────────────────────────────────
    {
      projectId: proj.id, sprintId: s1Id,
      title: 'Scaffold Vite + Vue 3 + TypeScript project',
      description: 'Run `pnpm create vite` with vue-ts template. Add pnpm workspace, .gitignore, tsconfig paths.',
      status: 'done', priority: 'high', tags: ['Setup'],
      assignee: ME.name, assigneeAvatar: ME.avatar, reporter: USER.name,
      dueDate: fmt(subDays(today, 9)),
      subtasks: [
        { id: nanoid(), title: 'pnpm create vite --template vue-ts', done: true },
        { id: nanoid(), title: 'Configure @/ path alias in vite.config.ts', done: true },
        { id: nanoid(), title: 'Add tailwind + postcss', done: true },
      ],
      comments: [
        { id: nanoid(), author: ME.name, avatar: ME.avatar, body: 'Scaffold complete. Node v22 + pnpm v10 confirmed.', createdAt: subDays(today, 9).toISOString() },
      ],
    },
    {
      projectId: proj.id, sprintId: s1Id,
      title: 'Install and configure all dependencies',
      description: 'pinia, @vueuse/core, echarts, vue-echarts, date-fns, @iconify/vue, primevue, nanoid, tailwindcss@3',
      status: 'done', priority: 'high', tags: ['Setup'],
      assignee: ME.name, assigneeAvatar: ME.avatar, reporter: USER.name,
      dueDate: fmt(subDays(today, 9)),
      subtasks: [], comments: [],
    },
    {
      projectId: proj.id, sprintId: s1Id,
      title: 'Define TypeScript domain types',
      description: 'Task, Project, Sprint, ActivityEntry, Subtask, Comment interfaces in src/types/index.ts',
      status: 'done', priority: 'high', tags: ['TypeScript'],
      assignee: ME.name, assigneeAvatar: ME.avatar, reporter: USER.name,
      dueDate: fmt(subDays(today, 8)),
      subtasks: [], comments: [],
    },
    {
      projectId: proj.id, sprintId: s1Id,
      title: 'Implement Pinia stores',
      description: 'Three stores — projects, tasks, activity — all persisted via useLocalStorage.',
      status: 'done', priority: 'high', tags: ['State', 'Pinia'],
      assignee: ME.name, assigneeAvatar: ME.avatar, reporter: USER.name,
      dueDate: fmt(subDays(today, 7)),
      subtasks: [
        { id: nanoid(), title: 'projects.ts — CRUD + project switcher', done: true },
        { id: nanoid(), title: 'tasks.ts — move, update, stats computed', done: true },
        { id: nanoid(), title: 'activity.ts — push entries, max 20', done: true },
      ],
      comments: [],
    },
    {
      projectId: proj.id, sprintId: s1Id,
      title: 'Build AppHeader component',
      description: 'Logo, project dropdown switcher, dark-mode toggle, New Project modal.',
      status: 'done', priority: 'medium', tags: ['Frontend', 'UI'],
      assignee: ME.name, assigneeAvatar: ME.avatar, reporter: USER.name,
      dueDate: fmt(subDays(today, 6)),
      subtasks: [], comments: [],
    },
    {
      projectId: proj.id, sprintId: s1Id,
      title: 'Build SummaryCards component',
      description: 'Four stat cards: Total, Completed (%), In Progress, Overdue.',
      status: 'done', priority: 'medium', tags: ['Frontend', 'UI'],
      assignee: ME.name, assigneeAvatar: ME.avatar, reporter: USER.name,
      dueDate: fmt(subDays(today, 5)),
      subtasks: [], comments: [],
    },

    // ── Sprint 2 — current ─────────────────────────────────────────────────────
    {
      projectId: proj.id, sprintId: s2Id,
      title: 'Build KanbanBoard + KanbanColumn + TaskCard',
      description: 'Four columns (Backlog → Done), native HTML5 drag-and-drop between columns, priority stripe, due-date colour coding, tag chips.',
      status: 'done', priority: 'high', tags: ['Frontend', 'Kanban'],
      assignee: ME.name, assigneeAvatar: ME.avatar, reporter: USER.name,
      dueDate: fmt(subDays(today, 2)),
      subtasks: [
        { id: nanoid(), title: 'KanbanColumn with dragover/drop handlers', done: true },
        { id: nanoid(), title: 'TaskCard with draggable + priority stripe', done: true },
        { id: nanoid(), title: 'Add Task modal inside KanbanBoard', done: true },
      ],
      comments: [
        { id: nanoid(), author: USER.name, avatar: USER.avatar, body: 'Drag and drop feels smooth!', createdAt: subDays(today, 1).toISOString() },
      ],
    },
    {
      projectId: proj.id, sprintId: s2Id,
      title: 'Build SprintProgress + ECharts velocity chart',
      description: 'Sprint progress bar + area-line velocity sparkline for last 5 sprints using vue-echarts.',
      status: 'done', priority: 'medium', tags: ['Frontend', 'Charts'],
      assignee: ME.name, assigneeAvatar: ME.avatar, reporter: USER.name,
      dueDate: fmt(subDays(today, 1)),
      subtasks: [], comments: [],
    },
    {
      projectId: proj.id, sprintId: s2Id,
      title: 'Build ActivityFeed sidebar component',
      description: 'Live feed of task state changes with actor avatar, action text, and time-ago timestamp.',
      status: 'done', priority: 'low', tags: ['Frontend', 'UI'],
      assignee: ME.name, assigneeAvatar: ME.avatar, reporter: USER.name,
      dueDate: fmt(subDays(today, 1)),
      subtasks: [], comments: [],
    },
    {
      projectId: proj.id, sprintId: s2Id,
      title: 'Build TaskSlideOver panel',
      description: 'Full task detail panel: inline title editing, priority/status/due-date, tags, description, assignee, subtask checklist, comment thread.',
      status: 'done', priority: 'high', tags: ['Frontend', 'UI'],
      assignee: ME.name, assigneeAvatar: ME.avatar, reporter: USER.name,
      dueDate: fmt(today),
      subtasks: [
        { id: nanoid(), title: 'Slide-in CSS transition from right', done: true },
        { id: nanoid(), title: 'Subtask checklist + progress bar', done: true },
        { id: nanoid(), title: 'Comment thread with post button', done: true },
        { id: nanoid(), title: 'Delete task with close emit', done: true },
      ],
      comments: [],
    },
    {
      projectId: proj.id, sprintId: s2Id,
      title: 'Wire App.vue layout + main.ts',
      description: 'Full-height flex layout with header, main kanban area, right sidebar, and TaskSlideOver portal. Dark mode sync via useDark().',
      status: 'done', priority: 'high', tags: ['Frontend', 'Layout'],
      assignee: ME.name, assigneeAvatar: ME.avatar, reporter: USER.name,
      dueDate: fmt(today),
      subtasks: [], comments: [],
    },
    {
      projectId: proj.id, sprintId: s2Id,
      title: 'Seed dashboard with real project tasks',
      description: 'Replace placeholder seed data with actual ProjectPulse build tasks so the dashboard tracks its own progress.',
      status: 'in-progress', priority: 'medium', tags: ['Meta', 'Content'],
      assignee: ME.name, assigneeAvatar: ME.avatar, reporter: USER.name,
      dueDate: fmt(today),
      subtasks: [
        { id: nanoid(), title: 'Write seed tasks for Sprint 1', done: true },
        { id: nanoid(), title: 'Write seed tasks for Sprint 2', done: true },
        { id: nanoid(), title: 'Write seed tasks for Sprint 3', done: false },
        { id: nanoid(), title: 'Add localStorage reset util', done: false },
      ],
      comments: [
        { id: nanoid(), author: USER.name, avatar: USER.avatar, body: 'Use this dashboard to track itself — love it.', createdAt: new Date().toISOString() },
      ],
    },

    // ── Sprint 3 — upcoming ────────────────────────────────────────────────────
    {
      projectId: proj.id, sprintId: s3Id,
      title: 'Push to GitHub (evolite/coder-tes)',
      description: 'Authenticate via Coder external-auth GitHub token (needs repo scope) and push all commits to origin/main.',
      status: 'in-progress', priority: 'high', tags: ['Git', 'DevOps'],
      assignee: ME.name, assigneeAvatar: ME.avatar, reporter: USER.name,
      dueDate: fmt(addDays(today, 1)),
      subtasks: [
        { id: nanoid(), title: 'Install gh CLI', done: true },
        { id: nanoid(), title: 'Authenticate via Coder external-auth', done: true },
        { id: nanoid(), title: 'Get token with repo scope', done: false },
        { id: nanoid(), title: 'git push -u origin main', done: false },
      ],
      comments: [
        { id: nanoid(), author: ME.name, avatar: ME.avatar, body: 'Token currently has empty scopes. Waiting for OAuth reconnect with repo scope.', createdAt: new Date().toISOString() },
      ],
    },
    {
      projectId: proj.id, sprintId: s3Id,
      title: 'Fix vite.config.ts allowedHosts',
      description: 'Add `server: { allowedHosts: true }` so the Coder proxy URL is not blocked.',
      status: 'done', priority: 'medium', tags: ['DevOps', 'Config'],
      assignee: ME.name, assigneeAvatar: ME.avatar, reporter: USER.name,
      dueDate: fmt(today),
      subtasks: [], comments: [],
    },
    {
      projectId: proj.id, sprintId: s3Id,
      title: 'Add localStorage reset button (dev tool)',
      description: 'Hidden button in the header (shift+click logo) that clears pm-* localStorage keys and reloads — useful for resetting seed data.',
      status: 'todo', priority: 'low', tags: ['DevTools'],
      assignee: ME.name, assigneeAvatar: ME.avatar, reporter: USER.name,
      dueDate: fmt(addDays(today, 3)),
      subtasks: [], comments: [],
    },
    {
      projectId: proj.id, sprintId: s3Id,
      title: 'Responsive mobile layout',
      description: 'On small screens collapse the right sidebar into a bottom sheet; make kanban columns horizontally scrollable.',
      status: 'todo', priority: 'medium', tags: ['Frontend', 'UX'],
      assignee: ME.name, assigneeAvatar: ME.avatar, reporter: USER.name,
      dueDate: fmt(addDays(today, 5)),
      subtasks: [], comments: [],
    },
    {
      projectId: proj.id, sprintId: s3Id,
      title: 'Dark mode polish pass',
      description: 'Review every component in dark mode — fix any bg/text contrast issues, ensure ECharts chart adapts correctly.',
      status: 'todo', priority: 'low', tags: ['UI', 'DarkMode'],
      assignee: ME.name, assigneeAvatar: ME.avatar, reporter: USER.name,
      dueDate: fmt(addDays(today, 6)),
      subtasks: [], comments: [],
    },
    {
      projectId: proj.id, sprintId: s3Id,
      title: 'README — setup & usage docs',
      description: 'Document stack, how to run locally, env vars, and how to reset seed data.',
      status: 'backlog', priority: 'low', tags: ['Docs'],
      assignee: ME.name, assigneeAvatar: ME.avatar, reporter: USER.name,
      dueDate: fmt(addDays(today, 8)),
      subtasks: [], comments: [],
    },
  ]

  return tasks.map(t => ({ ...t, id: nanoid(), createdAt: new Date().toISOString() }))
}

export function buildSeedActivity(tasks: Task[]): ActivityEntry[] {
  return [
    { id: nanoid(), actor: ME.name, actorAvatar: ME.avatar, action: 'completed', target: 'Scaffold Vite + Vue 3 + TypeScript project', detail: '→ Done', timestamp: subDays(today, 9).toISOString() },
    { id: nanoid(), actor: ME.name, actorAvatar: ME.avatar, action: 'completed', target: 'Install and configure all dependencies',       detail: '→ Done', timestamp: subDays(today, 9).toISOString() },
    { id: nanoid(), actor: ME.name, actorAvatar: ME.avatar, action: 'completed', target: 'Implement Pinia stores',                        detail: '→ Done', timestamp: subDays(today, 7).toISOString() },
    { id: nanoid(), actor: ME.name, actorAvatar: ME.avatar, action: 'completed', target: 'Build KanbanBoard + KanbanColumn + TaskCard',   detail: '→ Done', timestamp: subDays(today, 2).toISOString() },
    { id: nanoid(), actor: ME.name, actorAvatar: ME.avatar, action: 'completed', target: 'Build TaskSlideOver panel',                    detail: '→ Done', timestamp: subDays(today, 0).toISOString() },
    { id: nanoid(), actor: ME.name, actorAvatar: ME.avatar, action: 'moved',     target: 'Seed dashboard with real project tasks',        detail: '→ In Progress', timestamp: new Date().toISOString() },
    { id: nanoid(), actor: ME.name, actorAvatar: ME.avatar, action: 'moved',     target: 'Push to GitHub (evolite/coder-tes)',            detail: '→ In Progress', timestamp: new Date().toISOString() },
  ]
}
