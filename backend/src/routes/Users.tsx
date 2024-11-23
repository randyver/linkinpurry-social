import { PrismaClient } from '@prisma/client'
import { Hono } from 'hono'

const prisma = new PrismaClient()
const usersRoute = new Hono()

usersRoute.get('/users', async (c) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        username: true,
        email: true,
      },
    })

    return c.json(users)
  } catch (error) {
    console.error(error)
    return c.json({ error: 'Failed to fetch users' }, 500)
  }
})

export default usersRoute