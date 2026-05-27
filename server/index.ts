import express from 'express'
import cors from 'cors'
import fs from 'node:fs'
import path from 'node:path'
import { nanoid } from 'nanoid'

const app  = express()
const PORT = 3333
const STATE_FILE = path.join(import.meta.dirname, 'state.json')

app.use(cors({ origin: '*' }))
app.use(express.json())

interface State {
  tasks: any[]
  projects: any[]
}

function readState(): State {
  try {
    const raw = fs.readFileSync(STATE_FILE, 'utf-8')
    const parsed = JSON.parse(raw)
    if (!parsed.tasks) parsed.tasks = []
    if (!parsed.projects) parsed.projects = []
    return parsed
  } catch {
    return { tasks: [], projects: [] }
  }
}

function writeState(data: State) {
  fs.writeFileSync(STATE_FILE, JSON.stringify(data, null, 2))
}

// Ensure state.json exists and is valid on startup
const initial = readState()
writeState(initial)

// GET /api/state — full state
app.get('/api/state', (_req, res) => {
  res.json(readState())
})

// GET /api/tasks — all tasks
app.get('/api/tasks', (_req, res) => {
  res.json(readState().tasks)
})

// POST /api/tasks — create task
app.post('/api/tasks', (req, res) => {
  const state = readState()
  const task = { ...req.body, id: req.body.id ?? nanoid() }
  // Prevent duplicates if id already exists
  const exists = state.tasks.findIndex((t: any) => t.id === task.id)
  if (exists !== -1) {
    // upsert — update existing
    state.tasks[exists] = { ...state.tasks[exists], ...task }
  } else {
    state.tasks.push(task)
  }
  writeState(state)
  res.status(201).json(task)
})

// PATCH /api/tasks/:id — partial update by id
app.patch('/api/tasks/:id', (req, res) => {
  const state = readState()
  const idx = state.tasks.findIndex((t: any) => t.id === req.params.id)
  if (idx === -1) { res.status(404).json({ error: 'Task not found' }); return }
  state.tasks[idx] = { ...state.tasks[idx], ...req.body }
  writeState(state)
  res.json(state.tasks[idx])
})

// DELETE /api/tasks/:id — remove task
app.delete('/api/tasks/:id', (req, res) => {
  const state = readState()
  state.tasks = state.tasks.filter((t: any) => t.id !== req.params.id)
  writeState(state)
  res.json({ ok: true })
})

// GET /api/projects — all projects
app.get('/api/projects', (_req, res) => {
  res.json(readState().projects)
})

// POST /api/projects — create project
app.post('/api/projects', (req, res) => {
  const state = readState()
  const project = { ...req.body, id: req.body.id ?? nanoid() }
  // Prevent duplicates if id already exists
  const exists = state.projects.findIndex((p: any) => p.id === project.id)
  if (exists !== -1) {
    state.projects[exists] = { ...state.projects[exists], ...project }
  } else {
    state.projects.push(project)
  }
  writeState(state)
  res.status(201).json(project)
})

app.listen(PORT, '0.0.0.0', () => {
  console.log(`[api] listening on http://0.0.0.0:${PORT}`)
})
