import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import { cors } from 'hono/cors'

// Import routes
import registerRoute from './routes/Register.js'
import loginRoute from './routes/Login.js'
import usersRoute from './routes/Users.js'

const app = new Hono()

// Middleware CORS
app.use(
  '*',
  cors({
    origin: 'http://localhost:5173',
    allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowHeaders: ['Content-Type'],
  })
)

// Base route
app.get('/', (c) => {
  return c.text('Hello Hono!')
})

// Tambahkan routes
app.route('/api', registerRoute)
app.route('/api', loginRoute)
app.route('/api', usersRoute)

// Start server
const port = 3000
console.log(`Server running on http://localhost:${port}`)

serve({
  fetch: app.fetch,
  port,
})
