import { Hono } from 'hono'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()
const usersSearchRoute = new Hono()

usersSearchRoute.get('/users-search', async function (c) {
  try {
    const search = c.req.query('search') || '';

    const users = await prisma.user.findMany({
      where: {
        OR: [
          { username: { contains: search, mode: 'insensitive' } },
          { name: { contains: search, mode: 'insensitive' } },
        ],
      },
      select: {
        id: true,
        username: true,
        name: true,
      },
    });

    const usersWithStringIds = users.map((user) => ({
      ...user,
      id: user.id.toString(),
    }));

    return c.json(usersWithStringIds);
  } catch (error) {
    if (error instanceof Error) {
      console.error('Error fetching users:', error.message);
      return c.json({ error: 'Failed to fetch users', details: error.message }, 500);
    }

    console.error('Unknown error:', error);
    return c.json({ error: 'An unexpected error occurred' }, 500);
  }
});

export default usersSearchRoute