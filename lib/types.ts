/**
 * TypeScript type definitions matching backend schemas.
 */

export interface User {
  id: number;
  email: string;
  created_at: string;
}

export interface Todo {
  id: number;
  user_id: number;
  title: string;
  is_completed: boolean;
  created_at: string;
  updated_at: string;
}

export interface TodoCreate {
  title: string;
}

export interface TodoUpdate {
  title: string;
}

export interface TodoListResponse {
  todos: Todo[];
  count: number;
}

export interface ApiError {
  detail: string;
  errors?: Array<{
    field: string;
    message: string;
  }>;
}

export interface ApiResponse<T> {
  data?: T;
  error?: ApiError;
}

// Phase 3: Chat Types for AI Chatbot

export interface ChatMessage {
  id: string;
  conversation_id: string;
  role: 'user' | 'assistant';
  content: string;
  created_at: string;
}

export interface ChatRequest {
  message: string;
  conversation_id?: string;
}

export interface ChatResponse {
  message: string;
  conversation_id: string;
}

export interface ConversationHistory {
  conversation_id: string;
  messages: ChatMessage[];
}
