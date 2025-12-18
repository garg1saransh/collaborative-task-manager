import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import {
  createUser,
  findUserByEmail,
  findUserById,
  updateUserProfile,
} from '../services/user.service';

const JWT_SECRET = process.env.JWT_SECRET as string;

function signToken(userId: string) {
  return jwt.sign({ sub: userId }, JWT_SECRET, { expiresIn: '7d' });
}

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Register
export async function register(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { email, password, name } = req.body;

    if (!emailRegex.test(email)) {
      const err: any = new Error('Invalid email format');
      err.status = 400;
      throw err;
    }

    if (password.length < 8) {
      const err: any = new Error(
        'Password must be at least 8 characters'
      );
      err.status = 400;
      throw err;
    }

    const existing = await findUserByEmail(email);
    if (existing) {
      const err: any = new Error('Email already in use');
      err.status = 400;
      throw err;
    }

    const user = await createUser(email, password, name);
    const token = signToken(user.id);

    return res.status(201).json({ user, token });
  } catch (err) {
    next(err);
  }
}

// Login
export async function login(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { email, password } = req.body;

    if (!emailRegex.test(email)) {
      const err: any = new Error('Invalid email format');
      err.status = 400;
      throw err;
    }

    const user = await findUserByEmail(email);
    if (!user) {
      const err: any = new Error('Invalid credentials');
      err.status = 400;
      throw err;
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      const err: any = new Error('Invalid credentials');
      err.status = 400;
      throw err;
    }

    const token = signToken(user.id);
    const { password: _pw, ...safeUser } = user;

    return res.json({ user: safeUser, token });
  } catch (err) {
    next(err);
  }
}

// Get current user
export async function me(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const userId = (req as any).userId as string;
    const user = await findUserById(userId);

    if (!user) {
      const err: any = new Error('User not found');
      err.status = 404;
      throw err;
    }

    return res.json({ user });
  } catch (err) {
    next(err);
  }
}

// Update profile
export async function updateProfile(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const userId = (req as any).userId as string;
    const { name } = req.body;

    const user = await updateUserProfile(userId, name);
    return res.json({ user });
  } catch (err) {
    next(err);
  }
}