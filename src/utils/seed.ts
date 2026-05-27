import { nanoid } from 'nanoid'
import type { Project, Task, ActivityEntry } from '@/types'
import { addDays, subDays, format } from 'date-fns'

const today = new Date()
const fmt = (d: Date) => format(d, 'yyyy-MM-dd')

const AVATARS = [
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Alice',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Bob',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Carol',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Dave',
]

const MEMBERS = [
  { name: 'Alice', avatar: AVATARS[0] },
  { name: 'Bob',   avatar: AVATARS[1] },
  { name: 'Carol', avatar: AVATARS[2] },
  { name: 'Dave',  avatar: AVATARS[3] },
]

function member(i: number) { return MEMBERS[i % MEMBERS.length] }

export function buildSeedProjects(): Project[] {
  const sprint1 = { id: nanoid(), name: 'Sprint 1', startDate: fmt(subDays(today, 28)), endDate: fmt(subDays(today, 14)), velocity: 8 }
  const sprint2 = { id: nanoid(), name: 'Sprint 2', startDate: fmt(subDays(today, 14)), endDate: fmt(subDays(today, 7)),  velocity: 11 }
  const sprint3 = { id: nanoid(), name: 'Sprint 3', startDate: fmt(subDays(today, 7)),  endDate: fmt(addDays(today, 7)),  velocity: 5 }

  const alphaId = nanoid()
  const betaId  = nanoid()

  return [
    {
      id: alphaId,
      name: 'Alpha Launch',
      color: '#6366f1',
      currentSprintId: sprint3.id,
      sprints: [sprint1, sprint2, sprint3],
    },
    {
      id: betaId,
      name: 'Beta Roadmap',
      color: '#f59e0b',
      currentSprintId: null,
      sprints: [],
    },
  ]
}

export function buildSeedTasks(projects: Project[]): Task[] {
  const proj = projects[0]
  const sprintId = proj.currentSprintId

  const raw: Omit<Task, 'id' | 'projectId' | 'sprintId' | 'createdAt' | 'subtasks' | 'comments'>[] = [
    { title: 'Set up CI/CD pipeline',        description: 'Configure GitHub Actions for build, test and deploy.', status: 'done',        priority: 'high',   tags: ['DevOps','CI'],      assignee: member(0).name, assigneeAvatar: member(0).avatar, reporter: 'Dave', dueDate: fmt(subDays(today, 5)) },
    { title: 'Design system tokens',          description: 'Define color, spacing and typography tokens in Figma.', status: 'done',       priority: 'medium', tags: ['Design'],           assignee: member(2).name, assigneeAvatar: member(2).avatar, reporter: 'Bob',  dueDate: fmt(subDays(today, 3)) },
    { title: 'Auth — OAuth integration',      description: 'Add Google and GitHub OAuth via Passport.js.',          status: 'in-progress', priority: 'high',   tags: ['Auth','Backend'],   assignee: member(1).name, assigneeAvatar: member(1).avatar, reporter: 'Alice', dueDate: fmt(addDays(today, 2)) },
    { title: 'Dashboard chart components',    description: 'Build reusable ECharts wrappers for line and bar.', status: 'in-progress',    priority: 'medium', tags: ['Frontend'],         assignee: member(0).name, assigneeAvatar: member(0).avatar, reporter: 'Carol', dueDate: fmt(addDays(today, 4)) },
    { title: 'Write API docs',               description: 'Document all REST endpoints with OpenAPI 3.',          status: 'todo',        priority: 'low',    tags: ['Docs'],             assignee: member(3).name, assigneeAvatar: member(3).avatar, reporter: 'Alice', dueDate: fmt(addDays(today, 6)) },
    { title: 'E2E test coverage for login',  description: 'Playwright tests for login, logout and session expiry.', status: 'todo',      priority: 'high',   tags: ['Testing','Auth'],   assignee: member(2).name, assigneeAvatar: member(2).avatar, reporter: 'Bob',  dueDate: fmt(addDays(today, 3)) },
    { title: 'Mobile responsive layout',     description: 'Make all pages usable on 375px+ viewports.',          status: 'todo',        priority: 'medium', tags: ['Frontend','UX'],    assignee: member(1).name, assigneeAvatar: member(1).avatar, reporter: 'Carol', dueDate: fmt(addDays(today, 8)) },
    { title: 'Performance audit',            description: 'Lighthouse audit — target 90+ score on all metrics.',  status: 'backlog',     priority: 'medium', tags: ['Performance'],      assignee: member(0).name, assigneeAvatar: member(0).avatar, reporter: 'Dave',  dueDate: fmt(addDays(today, 14)) },
    { title: 'Database migrations script',   description: 'Write idempotent SQL migrations for v2 schema.',      status: 'backlog',     priority: 'high',   tags: ['Backend','DB'],     assignee: member(3).name, assigneeAvatar: member(3).avatar, reporter: 'Alice', dueDate: fmt(addDays(today, 10)) },
    { title: 'Onboarding email sequence',    description: 'Set up drip campaign for new signups via SendGrid.', status: 'backlog',      priority: 'low',    tags: ['Marketing'],        assignee: member(2).name, assigneeAvatar: member(2).avatar, reporter: 'Bob',  dueDate: fmt(addDays(today, 20)) },
    { title: 'Fix stale cache bug',          description: 'Redis cache not invalidating on user profile update.', status: 'in-progress', priority: 'high',   tags: ['Bug','Backend'],    assignee: member(1).name, assigneeAvatar: member(1).avatar, reporter: 'Carol', dueDate: fmt(subDays(today, 1)) },
    { title: 'Accessibility audit',          description: 'Ensure WCAG 2.1 AA compliance across all pages.',     status: 'todo',        priority: 'medium', tags: ['a11y','Frontend'],  assignee: member(0).name, assigneeAvatar: member(0).avatar, reporter: 'Dave',  dueDate: fmt(addDays(today, 12)) },
  ]

  return raw.map((t, i) => ({
    ...t,
    id: nanoid(),
    projectId: proj.id,
    sprintId: i < 8 ? sprintId : null,
    createdAt: new Date().toISOString(),
    subtasks: i === 2
      ? [
          { id: nanoid(), title: 'Register OAuth app on Google', done: true },
          { id: nanoid(), title: 'Implement callback route', done: false },
          { id: nanoid(), title: 'Store refresh tokens securely', done: false },
        ]
      : [],
    comments: i === 0
      ? [{ id: nanoid(), author: 'Bob', avatar: member(1).avatar, body: 'Pipeline is green on main!', createdAt: new Date().toISOString() }]
      : [],
  }))
}

export function buildSeedActivity(tasks: Task[]): ActivityEntry[] {
  const actions: ActivityEntry[] = [
    { id: nanoid(), actor: 'Alice', actorAvatar: AVATARS[0], action: 'moved',   target: tasks[0].title, detail: '→ Done',        timestamp: subDays(today, 1).toISOString() },
    { id: nanoid(), actor: 'Bob',   actorAvatar: AVATARS[1], action: 'created', target: tasks[5].title, detail: 'in To Do',      timestamp: subDays(today, 1).toISOString() },
    { id: nanoid(), actor: 'Carol', actorAvatar: AVATARS[2], action: 'moved',   target: tasks[2].title, detail: '→ In Progress', timestamp: subDays(today, 0).toISOString() },
    { id: nanoid(), actor: 'Dave',  actorAvatar: AVATARS[3], action: 'updated', target: tasks[8].title, detail: 'priority → High', timestamp: new Date().toISOString() },
  ]
  return actions
}
