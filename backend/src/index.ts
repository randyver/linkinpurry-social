import express, { Request, Response } from 'express';

const app = express();
const port = process.env.PORT || 3000;

// Middleware untuk parse JSON
app.use(express.json());

// Route dasar
app.get('/', (req: Request, res: Response) => {
  res.send('Hello World');
});

// Menjalankan server
app.listen(port, () => {
  console.log(`Server running on port http://localhost:${port}`);
});