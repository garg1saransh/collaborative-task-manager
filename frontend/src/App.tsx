import React, { useState, useEffect, useMemo } from 'react';
import { LoginPage } from './features/auth/LoginPage';
import { loadAuth } from './features/auth/authStore';
import { connectSocket, disconnectSocket } from './realtime/socket';

type AuthState = ReturnType<typeof loadAuth>;

type Task = {
  id: string;
  title: string;
  description: string | null;
  dueDate: string | null;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  status: 'ToDo' | 'InProgress' | 'Review' | 'Completed';
  creatorId: string;
  assignedToId: string | null;
  createdAt: string;
  updatedAt: string;
};

type ViewFilter = 'ALL' | 'ASSIGNED_TO_ME' | 'CREATED_BY_ME' | 'OVERDUE';
type StatusFilter = 'ALL' | Task['status'];
type PriorityFilter = 'ALL' | Task['priority'];
type DueDateSort = 'NONE' | 'ASC' | 'DESC';

function normalizeTask(rawWrapper: any): Task {
  const raw = rawWrapper?.task ?? rawWrapper;
  return {
    id: raw.id,
    title: raw.title,
    description: raw.description ?? null,
    dueDate: raw.dueDate ?? null,
    priority: raw.priority,
    status: raw.status,
    creatorId: raw.creatorId,
    assignedToId: raw.assignedToId ?? null,
    createdAt: raw.createdAt,
    updatedAt: raw.updatedAt,
  };
}

function normalizeList(rawData: any): Task[] {
  const rawList = Array.isArray(rawData) ? rawData : rawData.tasks ?? [];
  return rawList.map(normalizeTask);
}

function App() {
  const initial: AuthState = loadAuth();
  const [token, setToken] = useState<string | null>(initial.token);
  const [user] = useState(initial.user);
  const currentUserId = user?.id ?? null;

  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newPriority, setNewPriority] = useState<
    'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'
  >('LOW');
  const [newStatus, setNewStatus] = useState<
    'ToDo' | 'InProgress' | 'Review' | 'Completed'
  >('ToDo');
  const [newDueDate, setNewDueDate] = useState('');
  const [creating, setCreating] = useState(false);

  const [viewFilter, setViewFilter] = useState<ViewFilter>('ALL');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('ALL');
  const [priorityFilter, setPriorityFilter] = useState<PriorityFilter>('ALL');
  const [dueSort, setDueSort] = useState<DueDateSort>('NONE');

  function handleLoggedIn() {
    const updated = loadAuth();
    setToken(updated.token);
  }

  function handleLogout() {
    localStorage.removeItem('auth');
    setToken(null);
    setTasks([]);
    disconnectSocket();
  }

  async function handleCreateTask(e: React.FormEvent) {
    e.preventDefault();
    if (!newTitle.trim() || !token) return;

    try {
      setCreating(true);

      const response = await fetch('http://localhost:3001/api/tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: newTitle.trim(),
          description: newDescription.trim() || null,
          priority: newPriority,
          status: newStatus,
          // datetime-local gives "YYYY-MM-DDTHH:mm"
          // backend can parse or treat as string
          dueDate: newDueDate || null,
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to create task (${response.status})`);
      }

      // Task will be added via Socket.IO task:created
      await response.json();

      setNewTitle('');
      setNewDescription('');
      setNewPriority('LOW');
      setNewStatus('ToDo');
      setNewDueDate('');
    } catch (err: any) {
      setError(err.message ?? 'Failed to create task');
    } finally {
      setCreating(false);
    }
  }

  async function handleToggleTask(task: Task) {
    if (!token) return;

    const updatedStatus =
      task.status === 'Completed' ? 'ToDo' : 'Completed';

    try {
      const response = await fetch(
        `http://localhost:3001/api/tasks/${task.id}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ status: updatedStatus }),
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to update task (${response.status})`);
      }

      const updated = await response.json();
      const normalized = normalizeTask(updated);

      setTasks((prev) =>
        prev.map((t) => (t.id === task.id ? normalized : t))
      );
    } catch (err: any) {
      setError(err.message ?? 'Failed to update task');
    }
  }

  async function handleDeleteTask(taskId: string) {
    if (!token) return;

    try {
      const response = await fetch(
        `http://localhost:3001/api/tasks/${taskId}`,
        {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to delete task (${response.status})`);
      }

      setTasks((prev) => prev.filter((t) => t.id !== taskId));
    } catch (err: any) {
      setError(err.message ?? 'Failed to delete task');
    }
  }

  // Load tasks when token changes
  useEffect(() => {
    if (!token) {
      setTasks([]);
      return;
    }

    async function fetchTasks() {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch('http://localhost:3001/api/tasks', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error(`Failed to load tasks (${response.status})`);
        }

        const data = await response.json();
        const list = normalizeList(data);
        setTasks(list);
      } catch (err: any) {
        setError(err.message ?? 'Failed to load tasks');
      } finally {
        setLoading(false);
      }
    }

    fetchTasks();
  }, [token]);

  // Real-time Socket.IO subscriptions
  useEffect(() => {
    if (!token) return;

    const socket = connectSocket(token);

    socket.on('task:created', (payload: any) => {
      const task = normalizeTask(payload);
      setTasks((prev) => {
        if (prev.some((t) => t.id === task.id)) return prev;
        return [...prev, task];
      });
    });

    socket.on('task:updated', (payload: any) => {
      const task = normalizeTask(payload);
      setTasks((prev) =>
        prev.map((t) => (t.id === task.id ? task : t))
      );
    });

    socket.on('task:deleted', (payload: any) => {
      const id = payload.id;
      if (!id) return;
      setTasks((prev) => prev.filter((t) => t.id !== id));
    });

    return () => {
      socket.off('task:created');
      socket.off('task:updated');
      socket.off('task:deleted');
    };
  }, [token]);

  // Derived filtered + sorted tasks
  const visibleTasks = useMemo(() => {
    let result = [...tasks];

    const now = new Date();

    // View filter
    if (viewFilter === 'ASSIGNED_TO_ME' && currentUserId) {
      result = result.filter((t) => t.assignedToId === currentUserId);
    } else if (viewFilter === 'CREATED_BY_ME' && currentUserId) {
      result = result.filter((t) => t.creatorId === currentUserId);
    } else if (viewFilter === 'OVERDUE') {
      result = result.filter((t) => {
        if (!t.dueDate) return false;
        const due = new Date(t.dueDate);
        return due < now && t.status !== 'Completed';
      });
    }

    // Status filter
    if (statusFilter !== 'ALL') {
      result = result.filter((t) => t.status === statusFilter);
    }

    // Priority filter
    if (priorityFilter !== 'ALL') {
      result = result.filter((t) => t.priority === priorityFilter);
    }

    // Due date sorting
    if (dueSort !== 'NONE') {
      result.sort((a, b) => {
        const aTime = a.dueDate ? new Date(a.dueDate).getTime() : Infinity;
        const bTime = b.dueDate ? new Date(b.dueDate).getTime() : Infinity;
        if (dueSort === 'ASC') return aTime - bTime;
        return bTime - aTime;
      });
    }

    return result;
  }, [tasks, viewFilter, statusFilter, priorityFilter, dueSort, currentUserId]);

  if (!token) {
    return <LoginPage onLoggedIn={handleLoggedIn} />;
  }

  return (
    <div>
      <header style={{ padding: 16, borderBottom: '1px solid #ddd' }}>
        <span>Task Manager</span>
        {user && (
          <span style={{ marginLeft: 16 }}>Hi, {user.name ?? user.email}</span>
        )}
        <button style={{ marginLeft: 16 }} onClick={handleLogout}>
          Logout
        </button>
      </header>
      <main style={{ padding: 16 }}>
        {/* Dashboard controls */}
        <section style={{ marginBottom: 16 }}>
          <div style={{ marginBottom: 8 }}>
            <strong>View: </strong>
            <button
              onClick={() => setViewFilter('ALL')}
              style={{ marginRight: 8 }}
            >
              All
            </button>
            <button
              onClick={() => setViewFilter('ASSIGNED_TO_ME')}
              style={{ marginRight: 8 }}
              disabled={!currentUserId}
            >
              Assigned to me
            </button>
            <button
              onClick={() => setViewFilter('CREATED_BY_ME')}
              style={{ marginRight: 8 }}
              disabled={!currentUserId}
            >
              Created by me
            </button>
            <button onClick={() => setViewFilter('OVERDUE')}>
              Overdue
            </button>
          </div>

          <div style={{ marginBottom: 8 }}>
            <label style={{ marginRight: 8 }}>
              Status:
              <select
                value={statusFilter}
                onChange={(e) =>
                  setStatusFilter(e.target.value as StatusFilter)
                }
                style={{ marginLeft: 4 }}
              >
                <option value="ALL">All</option>
                <option value="ToDo">To Do</option>
                <option value="InProgress">In Progress</option>
                <option value="Review">Review</option>
                <option value="Completed">Completed</option>
              </select>
            </label>

            <label style={{ marginRight: 8 }}>
              Priority:
              <select
                value={priorityFilter}
                onChange={(e) =>
                  setPriorityFilter(e.target.value as PriorityFilter)
                }
                style={{ marginLeft: 4 }}
              >
                <option value="ALL">All</option>
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
                <option value="URGENT">Urgent</option>
              </select>
            </label>

            <label>
              Sort by due date:
              <select
                value={dueSort}
                onChange={(e) =>
                  setDueSort(e.target.value as DueDateSort)
                }
                style={{ marginLeft: 4 }}
              >
                <option value="NONE">None</option>
                <option value="ASC">Soonest first</option>
                <option value="DESC">Latest first</option>
              </select>
            </label>
          </div>
        </section>

        {/* Create task */}
        <form
          onSubmit={handleCreateTask}
          style={{
            marginBottom: 16,
            display: 'flex',
            flexWrap: 'wrap',
            gap: 8,
          }}
        >
          <input
            type="text"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            placeholder="New task title"
            style={{ flex: '1 1 200px' }}
          />

          <input
            type="text"
            value={newDescription}
            onChange={(e) => setNewDescription(e.target.value)}
            placeholder="Description (optional)"
            style={{ flex: '1 1 250px' }}
          />

          <select
            value={newPriority}
            onChange={(e) =>
              setNewPriority(e.target.value as typeof newPriority)
            }
            style={{ flex: '0 0 120px' }}
          >
            <option value="LOW">Low</option>
            <option value="MEDIUM">Medium</option>
            <option value="HIGH">High</option>
            <option value="URGENT">Urgent</option>
          </select>

          <select
            value={newStatus}
            onChange={(e) =>
              setNewStatus(e.target.value as typeof newStatus)
            }
            style={{ flex: '0 0 140px' }}
          >
            <option value="ToDo">To Do</option>
            <option value="InProgress">In Progress</option>
            <option value="Review">Review</option>
            <option value="Completed">Completed</option>
          </select>

          <input
            type="datetime-local"
            value={newDueDate}
            onChange={(e) => setNewDueDate(e.target.value)}
            style={{ flex: '0 0 220px' }}
          />

          <button
            type="submit"
            disabled={creating || !newTitle.trim()}
            style={{ flex: '0 0 110px' }}
          >
            {creating ? 'Adding...' : 'Add task'}
          </button>
        </form>

        {/* List */}
        {loading && <p>Loading tasks...</p>}
        {error && <p style={{ color: 'red' }}>{error}</p>}

        {!loading && !error && (
          <>
            {visibleTasks.length === 0 ? (
              <p>No tasks found.</p>
            ) : (
              <ul>
                {visibleTasks.map((task) => (
                  <li key={task.id} style={{ marginBottom: 8 }}>
                    <div>
                      <strong>{task.title}</strong>{' '}
                      <span style={{ marginLeft: 8 }}>
                        [{task.status}] [{task.priority}]
                      </span>
                    </div>
                    {task.description && (
                      <div>{task.description}</div>
                    )}
                    {task.dueDate && (
                      <div>
                        Due:{' '}
                        {new Date(task.dueDate).toLocaleString()}
                      </div>
                    )}
                    <div>
                      <button
                        onClick={() => handleToggleTask(task)}
                        style={{ marginRight: 8 }}
                      >
                        {task.status === 'Completed'
                          ? 'Mark not completed'
                          : 'Mark completed'}
                      </button>
                      <button
                        onClick={() => handleDeleteTask(task.id)}
                        style={{ color: 'red' }}
                      >
                        Delete
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </>
        )}
      </main>
    </div>
  );
}

export default App;