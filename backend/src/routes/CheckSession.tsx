import { Hono } from 'hono';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import cookie from 'cookie';

dotenv.config();

const checkSessionRoute = new Hono();

const SECRET_KEY = process.env.SECRET_KEY || 'default_secret_key';

checkSessionRoute.get('/check-session', (c) => {
  const cookies = cookie.parse(c.req.header('cookie') || '');

  const token = cookies.token;

  if (!token) {
    return c.json({ success: false, message: 'Not authenticated' }, 401);
  }

  try {
    const decoded = jwt.verify(token, SECRET_KEY) as jwt.JwtPayload;

    return c.json({
      success: true,
      user: {
        id: decoded.userId,
        email: decoded.email,
      },
    });
  } catch (error) {
    return c.json({ success: false, message: 'Invalid or expired token' }, 401);
  }
});

export default checkSessionRoute;