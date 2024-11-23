import { PrismaClient } from '@prisma/client'
import { Hono } from 'hono'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()
const loginRoute = new Hono()

loginRoute.post('/login', async (c) => {
  const { email, password } = await c.req.json()

  try {
    // Cari user berdasarkan email
    const user = await prisma.user.findUnique({
      where: { email },
    })

    if (!user) {
      return c.json({ error: 'Invalid email or password' }, 401)
    }

    // Verifikasi password
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash)
    if (!isPasswordValid) {
      return c.json({ error: 'Invalid email or password' }, 401)
    }

    return c.json({ message: 'Login successful', user })
  } catch (error) {
    console.error(error)
    return c.json({ error: 'Failed to login' }, 400)
  }
})

export default loginRoute