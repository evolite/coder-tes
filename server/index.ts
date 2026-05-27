import express from 'express'
import cors from 'cors'
import fs from 'node:fs'
import path from 'node:path'

const app  = express()
const PORT = 3333
const STATE_FILE = path.join(import.meta.dirname, 'state.json')

app.use(cors({ origin: '*' }))
app.use(express.json())

function readState() {
  return JSON.parse(fs.readFileSync(STATE_FILE, 'utf-8'))
}

function writeState(data: unknown) {
  fs.writeFileSync(STATE_FILE, JSON.stringify(data, null, 2))
}

// GET /api/state  — full state
app.get('/api/state', (_req, res) => {
  res.json(readState())
})

// PATCH /api/tasks/:title  — update a task by title
// Body: { "status": "done" }  (any Task fields)
app.patch('/api/tasks/:title', (req, res) => {
  const title = decodeURIComponent(req.params.title)
  const state = readState()
  const task  = state.tasks.find((t: any) => t.title === title)
  if (!task) { res.status(404).json({ error: 'Task not found' }); return }
  Object.assign(task, req.body)
  writeState(state)
  res.json(task)
})

// PUT /api/tasks  — replace entire task list
app.put('/api/tasks', (req, res) => {
  const state = readState()
  state.tasks = req.body
  writeState(state)
  res.json(state)
})

app.listen(PORT, '0.0.0.0', () => {
  console.log(`[api] listening on http://0.0.0.0:${PORT}`)
})
