import prisma from '../utils/prisma';
import {
  createTask,
  listTasksForUser,
  getTaskByIdForUser,
  updateTaskForUser,
  deleteTaskForUser,
} from './task.service';

jest.mock('../utils/prisma', () => ({
  __esModule: true,
  default: {
    task: {
      create: jest.fn(),
      findMany: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  },
}));

const mockedPrisma = prisma as unknown as {
  task: {
    create: jest.Mock;
    findMany: jest.Mock;
    findFirst: jest.Mock;
    update: jest.Mock;
    delete: jest.Mock;
  };
};

describe('task.service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('createTask should default priority and status and convert dueDate', async () => {
    mockedPrisma.task.create.mockResolvedValue({
      id: '1',
      title: 'Test',
      description: null,
      dueDate: new Date('2025-12-19T10:00:00.000Z'),
      priority: 'LOW',
      status: 'ToDo',
      creatorId: 'user-1',
      assignedToId: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const result = await createTask('user-1', {
      title: 'Test',
      dueDate: '2025-12-19T10:00:00.000Z',
    });

    expect(mockedPrisma.task.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          title: 'Test',
          priority: 'LOW',
          status: 'ToDo',
          creatorId: 'user-1',
          dueDate: expect.any(Date),
        }),
      })
    );
    expect(result.priority).toBe('LOW');
    expect(result.status).toBe('ToDo');
  });

  it('updateTaskForUser should respect ownership and return null when task not found', async () => {
    mockedPrisma.task.findFirst.mockResolvedValue(null);

    const result = await updateTaskForUser('task-1', 'user-1', {
      title: 'New title',
    });

    expect(mockedPrisma.task.update).not.toHaveBeenCalled();
    expect(result).toBeNull();
  });

  it('deleteTaskForUser should delete and return the existing task when user owns it', async () => {
    const existing = {
      id: 'task-1',
      title: 'Existing',
      description: null,
      dueDate: null,
      priority: 'LOW',
      status: 'ToDo',
      creatorId: 'user-1',
      assignedToId: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    mockedPrisma.task.findFirst.mockResolvedValue(existing);
    mockedPrisma.task.delete.mockResolvedValue(existing);

    const result = await deleteTaskForUser('task-1', 'user-1');

    expect(mockedPrisma.task.delete).toHaveBeenCalledWith({
      where: { id: 'task-1' },
    });
    expect(result).toEqual(existing);
  });

  it('listTasksForUser should filter by creatorId or assignedToId', async () => {
    mockedPrisma.task.findMany.mockResolvedValue([]);

    await listTasksForUser('user-1');

    expect(mockedPrisma.task.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          OR: [{ creatorId: 'user-1' }, { assignedToId: 'user-1' }],
        },
      })
    );
  });
});