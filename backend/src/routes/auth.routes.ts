import { Router } from 'express';
import {
  register,
  login,
  me,
  updateProfile,
} from '../controllers/auth.controller';
import { authMiddleware } from '../middleware/auth';
import { validateBody } from '../middleware/validate';
import {
  registerSchema,
  loginSchema,
  updateProfileSchema,
} from '../dto/auth.dto';

const router = Router();

// Public auth routes
router.post('/register', validateBody(registerSchema), register);
router.post('/login', validateBody(loginSchema), login);

// Authenticated user routes
router.get('/me', authMiddleware, me);
router.put(
  '/me',
  authMiddleware,
  validateBody(updateProfileSchema),
  updateProfile
);

export default router;