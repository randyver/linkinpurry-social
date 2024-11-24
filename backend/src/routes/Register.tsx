import { PrismaClient } from '@prisma/client'
import { Hono } from 'hono'
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient()
const registerRoute = new Hono()

registerRoute.post('/register', async (c) => {
  const { username, email, password } = await c.req.json();

  try {
    // Hash password before saving to the database
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await prisma.user.create({
      data: { 
        username, 
        email, 
        name: username,
        passwordHash: hashedPassword 
      },
    });

    const userResponse = {
      ...newUser,
      id: newUser.id.toString(),
    };

    return c.json(userResponse, 201);
  } catch (error) {
    console.error(error);
    return c.json({ error: 'Failed to create user' }, 400);
  }
});

export default registerRoute