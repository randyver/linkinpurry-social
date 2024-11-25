import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import { cors } from 'hono/cors'

// Import routes
import registerRoute from './routes/Register.js'
import loginRoute from './routes/Login.js'
import logoutRoute from './routes/Logout.js'
import usersRoute from './routes/Users.js'
import usersSearchRoute from './routes/user-search.js'
import connectionRoute from './routes/connection.js'
import profileRoute from './routes/profile.js'
import checkSessionRoute from './routes/CheckSession.js'


const app = new Hono()

// Middleware CORS
app.use(
  '*',
  cors({
    origin: 'http://localhost:5173',
    allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowHeaders: ['Content-Type'],
    credentials: true,
  })
)

// Base route
app.get('/', (c) => {
  return c.text('Hello Hono!')
})

// Tambahkan routes
app.route('/api', registerRoute)
app.route('/api', loginRoute)
app.route('/api', logoutRoute)
app.route('/api', usersRoute)
app.route('/api', usersSearchRoute)
app.route('/api', connectionRoute)
app.route('/api', profileRoute)
app.route('/api', checkSessionRoute)

// Start server
const port = 3000
console.log(`Server running on http://localhost:${port}`)

serve({
  fetch: app.fetch,
  port,
})
