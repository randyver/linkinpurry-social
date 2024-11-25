import { Hono } from 'hono';

const checkSessionRoute = new Hono();

checkSessionRoute.get('/check-session', (c) => {
  const user = c.get('user');

  if (!user) {
    return c.json({ success: false, message: 'Not authenticated' }, 401);
  }

  return c.json({
    success: true,
    user: {
      id: user.userId,
      email: user.email,
    },
  });
});

export default checkSessionRoute;