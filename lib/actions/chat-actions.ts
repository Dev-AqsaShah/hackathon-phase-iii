'use server';

/**
 * Server actions for chat API calls.
 * JWT creation happens server-side where BETTER_AUTH_SECRET is available.
 */

import * as jose from 'jose';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

/**
 * Create a JWT token for backend API authentication.
 * Must run server-side where BETTER_AUTH_SECRET is available.
 */
async function createToken(userId: string, email?: string): Promise<string> {
  const secret = process.env.BETTER_AUTH_SECRET;
  if (!secret) {
    throw new Error('BETTER_AUTH_SECRET is not configured');
  }

  const secretKey = new TextEncoder().encode(secret);

  const token = await new jose.SignJWT({
    sub: userId,
    email: email || undefined,
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('1h')
    .sign(secretKey);

  return token;
}

export interface ChatResponse {
  message: string;
  conversation_id: string;
  tool_calls?: Array<{
    tool: string;
    args: Record<string, unknown>;
    result: unknown;
  }>;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  created_at: string;
}

export interface ConversationHistory {
  conversation_id: string | null;
  messages: ChatMessage[];
}

export interface ActionResult<T> {
  success: boolean;
  data?: T;
  error?: string;
}

/**
 * Send a chat message to the AI assistant.
 */
export async function sendChatMessageAction(
  userId: string,
  message: string,
  conversationId?: string,
  email?: string
): Promise<ActionResult<ChatResponse>> {
  try {
    const token = await createToken(userId, email);

    const response = await fetch(`${API_URL}/api/${userId}/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        message,
        conversation_id: conversationId,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return {
        success: false,
        error: errorData.detail || `Request failed with status ${response.status}`,
      };
    }

    const data = await response.json();
    return {
      success: true,
      data,
    };
  } catch (error) {
    console.error('sendChatMessageAction error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to send message',
    };
  }
}

/**
 * Retrieve conversation history for a user.
 */
export async function getChatHistoryAction(
  userId: string,
  limit: number = 50,
  email?: string
): Promise<ActionResult<ConversationHistory>> {
  try {
    const token = await createToken(userId, email);

    const response = await fetch(`${API_URL}/api/${userId}/chat/history?limit=${limit}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      // For 404, return empty history (no conversation yet)
      if (response.status === 404) {
        return {
          success: true,
          data: {
            conversation_id: null,
            messages: [],
          },
        };
      }

      const errorData = await response.json().catch(() => ({}));
      return {
        success: false,
        error: errorData.detail || `Request failed with status ${response.status}`,
      };
    }

    const data = await response.json();
    return {
      success: true,
      data,
    };
  } catch (error) {
    console.error('getChatHistoryAction error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to load history',
    };
  }
}

// Task interfaces
export interface Task {
  id: number;
  title: string;
  description: string | null;
  completed: boolean;
  owner_id: number;
  created_at: string;
  updated_at: string;
}

export interface TaskCreateInput {
  title: string;
  description?: string;
}

/**
 * Fetch all tasks for a user.
 */
export async function getTasksAction(
  userId: string,
  email?: string
): Promise<ActionResult<Task[]>> {
  try {
    const token = await createToken(userId, email);

    const response = await fetch(`${API_URL}/api/${userId}/tasks`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return {
        success: false,
        error: errorData.detail || `Request failed with status ${response.status}`,
      };
    }

    const data = await response.json();
    return {
      success: true,
      data,
    };
  } catch (error) {
    console.error('getTasksAction error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch tasks',
    };
  }
}

/**
 * Create a new task manually.
 */
export async function createTaskAction(
  userId: string,
  task: TaskCreateInput,
  email?: string
): Promise<ActionResult<Task>> {
  try {
    const token = await createToken(userId, email);

    const response = await fetch(`${API_URL}/api/${userId}/tasks`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(task),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return {
        success: false,
        error: errorData.detail || `Request failed with status ${response.status}`,
      };
    }

    const data = await response.json();
    return {
      success: true,
      data,
    };
  } catch (error) {
    console.error('createTaskAction error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create task',
    };
  }
}

/**
 * Update a task (toggle completion or edit).
 */
export async function updateTaskAction(
  userId: string,
  taskId: number,
  updates: { title?: string; description?: string; completed?: boolean },
  email?: string
): Promise<ActionResult<Task>> {
  try {
    const token = await createToken(userId, email);

    const response = await fetch(`${API_URL}/api/${userId}/tasks/${taskId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(updates),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return {
        success: false,
        error: errorData.detail || `Request failed with status ${response.status}`,
      };
    }

    const data = await response.json();
    return {
      success: true,
      data,
    };
  } catch (error) {
    console.error('updateTaskAction error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update task',
    };
  }
}

/**
 * Delete a task.
 */
export async function deleteTaskAction(
  userId: string,
  taskId: number,
  email?: string
): Promise<ActionResult<void>> {
  try {
    const token = await createToken(userId, email);

    const response = await fetch(`${API_URL}/api/${userId}/tasks/${taskId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return {
        success: false,
        error: errorData.detail || `Request failed with status ${response.status}`,
      };
    }

    return {
      success: true,
    };
  } catch (error) {
    console.error('deleteTaskAction error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to delete task',
    };
  }
}
