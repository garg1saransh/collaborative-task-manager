import { Request, Response, NextFunction } from 'express';
import { findAllUsers } from '../services/user.service';

export async function listUsers(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const users = await findAllUsers();
    res.json({ users });
  } catch (err) {
    next(err);
  }
}