import { Hono } from 'hono';

const logoutRoute = new Hono();

logoutRoute.post('/logout', (c) => {
  c.header('Set-Cookie', 'token=; HttpOnly; Max-Age=0; SameSite=Strict; Path=/; Secure;');

  return c.json({
    success: true,
    message: 'Logout successful',
  });
});

export default logoutRoute;