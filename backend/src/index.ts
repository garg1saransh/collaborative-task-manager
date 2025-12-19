import express from 'express';
import cors from 'cors';
import http from 'http';
import authRoutes from './routes/auth.routes';
import taskRoutes from './routes/task.routes';
import userRoutes from './routes/user.routes'; // NEW
import { initSocket } from './realtime/socket';
import { errorHandler } from './middleware/errorHandler';

const app = express();
const PORT = 3001;

// Global middlewares
app.use(
  cors({
    origin: 'http://localhost:5173', // React dev server
    credentials: true,
  })
);
app.use(express.json());

// Health check
app.get('/api/v1/health', (req, res) => {
  res.json({ status: 'OK', message: 'Backend ready!' });
});

// Auth routes
app.use('/api/auth', authRoutes);

// User routes (for listing users for assignment)
app.use('/api/users', userRoutes);

// Task routes
app.use('/api/tasks', taskRoutes);

// Global error handler MUST be after all routes
app.use(errorHandler);

// Create HTTP server and attach Socket.io
const server = http.createServer(app);
initSocket(server);

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

export default app;