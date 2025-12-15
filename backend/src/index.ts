import express from 'express';
import authRoutes from './routes/auth.routes';
import taskRoutes from './routes/task.routes';

const app = express();
const PORT = 3001;

// Global middlewares
app.use(express.json());

// Health check
app.get('/api/v1/health', (req, res) => {
  res.json({ status: 'OK', message: 'Backend ready!' });
});

// Auth routes
app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

export default app;