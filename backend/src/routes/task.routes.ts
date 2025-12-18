import { Router } from 'express';
import { authMiddleware } from '../middleware/auth';
import {
  createTaskHandler,
  listTasksHandler,
  getTaskHandler,
  updateTaskHandler,
  deleteTaskHandler,
} from '../controllers/task.controller';
import { validateBody } from '../middleware/validate';
import { createTaskSchema, updateTaskSchema } from '../dto/task.dto';

const router = Router();

// All task routes require auth
router.use(authMiddleware);

// Create task with DTO validation
router.post('/', validateBody(createTaskSchema), createTaskHandler);

// List tasks for current user / filters
router.get('/', listTasksHandler);

// Get single task by id
router.get('/:id', getTaskHandler);

// Update task with DTO validation (partial)
router.put('/:id', validateBody(updateTaskSchema), updateTaskHandler);

// Delete task
router.delete('/:id', deleteTaskHandler);

export default router;