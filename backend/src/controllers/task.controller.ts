import { Request, Response } from 'express';
import {
  createTask,
  listTasksForUser,
  getTaskByIdForUser,
  updateTaskForUser,
  deleteTaskForUser,
} from '../services/task.service';

import { getIO } from '../realtime/socket';

export async function createTaskHandler(req: Request, res: Response) {
  const userId = (req as any).userId as string;
  const { title, description, dueDate, priority, status, assignedToId } = req.body;

  if (!title || title.length > 100) {
    return res
      .status(400)
      .json({ message: 'Title is required and must be <= 100 chars' });
  }

  const task = await createTask(userId, {
    title,
    description,
    dueDate,
    priority,
    status,
    assignedToId,
  });

  const io = getIO();
  io.emit('task:created', task);
  if (task.assignedToId) {
    io.to(`user:${task.assignedToId}`).emit('task:assigned', task);
  }

  return res.status(201).json({ task });
}

export async function listTasksHandler(req: Request, res: Response) {
  const userId = (req as any).userId as string;
  const tasks = await listTasksForUser(userId);
  return res.json({ tasks });
}

export async function getTaskHandler(req: Request, res: Response) {
  const userId = (req as any).userId as string;
  const { id } = req.params;

  const task = await getTaskByIdForUser(id, userId);
  if (!task) return res.status(404).json({ message: 'Task not found' });

  return res.json({ task });
}

export async function updateTaskHandler(req: Request, res: Response) {
  const userId = (req as any).userId as string;
  const { id } = req.params;

  const before = await getTaskByIdForUser(id, userId);
  if (!before) return res.status(404).json({ message: 'Task not found' });

  const updated = await updateTaskForUser(id, userId, req.body);

  const io = getIO();
  io.emit('task:updated', updated);

  // If assignee changed, notify new assignee
  if (before.assignedToId !== updated?.assignedToId && updated?.assignedToId) {
    io.to(`user:${updated.assignedToId}`).emit('task:assigned', updated);
  }

  return res.json({ task: updated });
}

export async function deleteTaskHandler(req: Request, res: Response) {
  const userId = (req as any).userId as string;
  const { id } = req.params;

  const deleted = await deleteTaskForUser(id, userId);
  if (!deleted) return res.status(404).json({ message: 'Task not found' });

  const io = getIO();
  io.emit('task:deleted', { id });

  return res.status(204).send();
}