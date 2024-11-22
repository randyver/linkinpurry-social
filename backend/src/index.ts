import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { PrismaClient } from '@prisma/client'

const app = new Hono()
const prisma = new PrismaClient()

app.use(
  '*',
  cors({
    origin: 'http://localhost:5173', // Frontend URL
    allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], // Allowed HTTP methods
    allowHeaders: ['Content-Type'], // Allowed headers
  })
);

app.get('/', (c) => {
  return c.text('Hello Hono!')
})

app.post('/register', async (c) => {
  const { username, email, password } = await c.req.json();

  try {
    const newUser = await prisma.user.create({
      data: { username, email, passwordHash: password },
    });
    return c.json(newUser, 201);
  } catch (error) {
    return c.json({ error: 'Failed to create user' }, 400);
  }
});

const port = 3000
console.log(`Server running on http://localhost:${port}`)

serve({
  fetch: app.fetch,
  port
})