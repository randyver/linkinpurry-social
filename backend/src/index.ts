import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import { cors } from 'hono/cors';

// Import routes
import registerRoute from './routes/Register.js';
import loginRoute from './routes/Login.js';
import logoutRoute from './routes/Logout.js';
import usersSearchRoute from './routes/user-search.js';
import connectionRoute from './routes/connection.js';
import profileRoute from './routes/profile.js';
import checkSessionRoute from './routes/CheckSession.js';

import { validateJWT } from './middleware/validateJWT.js';

const app = new Hono();

// Middleware CORS
app.use(
  '*',
  cors({
    origin: 'http://localhost:5173',
    allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowHeaders: ['Content-Type'],
    credentials: true,
  })
);

// Base route
app.get('/', (c) => {
  return c.text('Hello Hono!');
});

// Public Routes
const publicRoutes = new Hono();
publicRoutes.route('/api', registerRoute);
publicRoutes.route('/api', loginRoute);
publicRoutes.route('/api', logoutRoute);
publicRoutes.route('/api', usersSearchRoute);
publicRoutes.route('/api', checkSessionRoute);
app.route('/', publicRoutes);

// Protected Routes
const protectedRoutes = new Hono();
protectedRoutes.use('*', validateJWT);
protectedRoutes.route('/api', connectionRoute);
protectedRoutes.route('/api', profileRoute);
app.route('/', protectedRoutes);

// Start server
const port = 3000;
console.log(`Server running on http://localhost:${port}`);

serve({
  fetch: app.fetch,
  port,
});