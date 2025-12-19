import { Router } from 'express';
import { authMiddleware } from '../middleware/auth';
import { listUsers } from '../controllers/user.controller';

const router = Router();

router.get('/', authMiddleware, listUsers);

export default router;