import { Router } from 'express';
import { authMiddleware } from '../middleware/auth';
import {
  createTaskHandler,
  listTasksHandler,
  getTaskHandler,
  updateTaskHandler,
  deleteTaskHandler,
} from '../controllers/task.controller';

const router = Router();

router.use(authMiddleware);

router.post('/', createTaskHandler);
router.get('/', listTasksHandler);
router.get('/:id', getTaskHandler);
router.put('/:id', updateTaskHandler);
router.delete('/:id', deleteTaskHandler);

export default router;