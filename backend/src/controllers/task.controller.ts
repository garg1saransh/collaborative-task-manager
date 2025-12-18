import { Request, Response, NextFunction } from 'express';
import {
  createTask,
  listTasksForUser,
  getTaskByIdForUser,
  updateTaskForUser,
  deleteTaskForUser,
} from '../services/task.service';
import { getIO } from '../realtime/socket';

export async function createTaskHandler(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const userId = (req as any).userId as string;
    const { title, description, dueDate, priority, status, assignedToId } =
      req.body;

    // Body is already validated by Zod middleware, but keep a small safety check
    if (!title || title.length > 100) {
      const err: any = new Error(
        'Title is required and must be <= 100 chars'
      );
      err.status = 400;
      throw err;
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
  } catch (err) {
    next(err);
  }
}

export async function listTasksHandler(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const userId = (req as any).userId as string;
    const tasks = await listTasksForUser(userId);
    return res.json({ tasks });
  } catch (err) {
    next(err);
  }
}

export async function getTaskHandler(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const userId = (req as any).userId as string;
    const { id } = req.params;

    const task = await getTaskByIdForUser(id, userId);

    if (!task) {
      const err: any = new Error('Task not found');
      err.status = 404;
      throw err;
    }

    return res.json({ task });
  } catch (err) {
    next(err);
  }
}

export async function updateTaskHandler(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const userId = (req as any).userId as string;
    const { id } = req.params;

    const before = await getTaskByIdForUser(id, userId);

    if (!before) {
      const err: any = new Error('Task not found');
      err.status = 404;
      throw err;
    }

    const updated = await updateTaskForUser(id, userId, req.body);

    const io = getIO();
    io.emit('task:updated', updated);

    // If assignee changed, notify new assignee
    if (
      before.assignedToId !== updated?.assignedToId &&
      updated?.assignedToId
    ) {
      io.to(`user:${updated.assignedToId}`).emit('task:assigned', updated);
    }

    return res.json({ task: updated });
  } catch (err) {
    next(err);
  }
}

export async function deleteTaskHandler(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const userId = (req as any).userId as string;
    const { id } = req.params;

    const deleted = await deleteTaskForUser(id, userId);

    if (!deleted) {
      const err: any = new Error('Task not found');
      err.status = 404;
      throw err;
    }

    const io = getIO();
    io.emit('task:deleted', { id });

    return res.status(204).send();
  } catch (err) {
    next(err);
  }
}