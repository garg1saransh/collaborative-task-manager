import prisma from '../utils/prisma';

export type CreateTaskInput = {
  title: string;
  description?: string;
  dueDate?: string | null;
  priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  status?: 'ToDo' | 'InProgress' | 'Review' | 'Completed';
  assignedToId?: string | null;
};

export type UpdateTaskInput = Partial<CreateTaskInput>;

export async function createTask(creatorId: string, data: CreateTaskInput) {
  return prisma.task.create({
    data: {
      title: data.title,
      description: data.description,
      dueDate: data.dueDate ? new Date(data.dueDate) : null,
      priority: data.priority ?? 'LOW',
      status: data.status ?? 'ToDo',
      creatorId,
      assignedToId: data.assignedToId ?? null,
    },
  });
}

export async function listTasksForUser(userId: string) {
  return prisma.task.findMany({
    where: {
      OR: [{ creatorId: userId }, { assignedToId: userId }],
    },
    orderBy: { dueDate: 'asc' },
  });
}

export async function getTaskByIdForUser(taskId: string, userId: string) {
  return prisma.task.findFirst({
    where: {
      id: taskId,
      OR: [{ creatorId: userId }, { assignedToId: userId }],
    },
  });
}

export async function updateTaskForUser(taskId: string, userId: string, data: UpdateTaskInput) {
  const existing = await getTaskByIdForUser(taskId, userId);
  if (!existing) return null;

  return prisma.task.update({
    where: { id: taskId },
    data: {
      title: data.title ?? existing.title,
      description: data.description ?? existing.description,
      dueDate:
        data.dueDate !== undefined
          ? data.dueDate
            ? new Date(data.dueDate)
            : null
          : existing.dueDate,
      priority: (data.priority as any) ?? existing.priority,
      status: (data.status as any) ?? existing.status,
      assignedToId:
        data.assignedToId !== undefined ? data.assignedToId : existing.assignedToId,
    },
  });
}

export async function deleteTaskForUser(taskId: string, userId: string) {
  const existing = await getTaskByIdForUser(taskId, userId);
  if (!existing) return null;

  await prisma.task.delete({ where: { id: taskId } });
  return existing;
}