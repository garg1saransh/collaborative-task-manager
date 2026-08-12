# Organizo API Reference

Base URL (local): `http://localhost:3001`  
Production: `https://collaborative-task-manager-79jq.onrender.com`

All protected routes require:

```http
Authorization: Bearer <jwt-token>
```

---

## Authentication

### `POST /api/auth/register`

Registers a new user.

```json
{
  "name": "string",
  "email": "string",
  "password": "string"
}
```

**Response:** user object (password excluded).

### `POST /api/auth/login`

```json
{
  "email": "string",
  "password": "string"
}
```

**Response:**

```json
{
  "token": "jwt-token",
  "user": {
    "id": "string",
    "name": "string | null",
    "email": "string"
  }
}
```

---

## Tasks (protected)

### `GET /api/tasks`

Returns tasks visible to the current user.

### `POST /api/tasks`

```json
{
  "title": "Design login page",
  "description": "Create responsive UI for login",
  "dueDate": "2025-12-31T00:00:00.000Z",
  "priority": "LOW | MEDIUM | HIGH | URGENT",
  "status": "ToDo | InProgress | Review | Completed",
  "assignedToId": "user-id-or-null"
}
```

### `PUT /api/tasks/:id`

Updates an existing task (same fields as create; partial or full depending on validation).

### `DELETE /api/tasks/:id`

Deletes a task according to authorization rules.

---

## Real-time events (Socket.IO)

Connect with the JWT:

```ts
import { io } from 'socket.io-client';

const socket = io(import.meta.env.VITE_API_URL, {
  auth: { token: '<JWT_TOKEN_FROM_LOGIN>' },
});
```

| Event | When | Payload |
| --- | --- | --- |
| `task:created` | After create | Full task object |
| `task:updated` | After update | Full task object |
| `task:deleted` | After delete | `{ "id": "string" }` |
| `task:assigned` | Assigned / reassigned | Full task object (room: `user:<assignedToId>`) |

Task object shape:

```json
{
  "id": "string",
  "title": "string",
  "description": "string or null",
  "dueDate": "string or null",
  "priority": "LOW | MEDIUM | HIGH | URGENT",
  "status": "ToDo | InProgress | Review | Completed",
  "creatorId": "string",
  "assignedToId": "string or null",
  "createdAt": "string",
  "updatedAt": "string"
}
```

---

## Error codes

| Status | Meaning |
| --- | --- |
| `400` | Validation error |
| `401` | Missing or invalid token |
| `404` | Resource not found |
| `500` | Unexpected server error |
