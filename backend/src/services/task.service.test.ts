import prisma from '../utils/prisma';
import {
  createTask,
  updateTaskForUser,
} from './task.service';

// Mock the real Prisma client
jest.mock('../utils/prisma', () => {
  const task = {
    create: jest.fn(),
    findMany: jest.fn(),
    findFirst: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };

  return {
    __esModule: true,
    default: { task },
  };
});

describe('task.service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('createTask creates a task with defaults', async () => {
    const creatorId = 'user-1';
    const input = { title: 'Test task' };

    const created = {
      id: 'task-1',
      title: 'Test task',
      description: null,
      dueDate: null,
      priority: 'LOW',
      status: 'ToDo',
      creatorId,
      assignedToId: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    (prisma.task.create as jest.Mock).mockResolvedValue(created);

    const result = await createTask(creatorId, input);

    expect(prisma.task.create).toHaveBeenCalledTimes(1);
    expect(prisma.task.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          title: 'Test task',
          creatorId,
          priority: 'LOW',
          status: 'ToDo',
        }),
      })
    );
    expect(result).toEqual(created);
  });

  it('updateTaskForUser updates task fields', async () => {
    const userId = 'user-1';
    const taskId = 'task-1';

    const existing = {
      id: taskId,
      title: 'Old',
      description: 'Old desc',
      dueDate: null,
      priority: 'LOW',
      status: 'ToDo',
      creatorId: userId,
      assignedToId: null,
    };

    (prisma.task.findFirst as jest.Mock).mockResolvedValue(existing);

    const updated = {
      ...existing,
      title: 'New',
      priority: 'HIGH',
    };

    (prisma.task.update as jest.Mock).mockResolvedValue(updated);

    const result = await updateTaskForUser(taskId, userId, {
      title: 'New',
      priority: 'HIGH',
    });

    expect(prisma.task.update).toHaveBeenCalledTimes(1);
    expect(prisma.task.update).toHaveBeenCalledWith({
      where: { id: taskId },
      data: expect.objectContaining({
        title: 'New',
        priority: 'HIGH',
      }),
    });
    expect(result).toEqual(updated);
  });

  it('updateTaskForUser returns null if task not found for user', async () => {
    (prisma.task.findFirst as jest.Mock).mockResolvedValue(null);

    const result = await updateTaskForUser(
      'task-unknown',
      'user-1',
      { title: 'X' }
    );

    expect(result).toBeNull();
    expect(prisma.task.update).not.toHaveBeenCalled();
  });
});