/**
 * Chat API client for Todo AI Chatbot (Phase 3).
 *
 * Provides functions to send messages to the chat endpoint
 * and retrieve conversation history.
 */

import { apiClient } from './api-client';
import type { ChatRequest, ChatResponse, ConversationHistory, ApiResponse } from './types';

/**
 * Send a chat message to the AI assistant.
 *
 * @param userId - The authenticated user's ID
 * @param message - The user's natural language message
 * @param conversationId - Optional conversation ID for continuing a conversation
 * @param email - Optional user email for JWT creation
 * @returns ChatResponse with assistant's reply and conversation ID
 */
export async function sendChatMessage(
  userId: string,
  message: string,
  conversationId?: string,
  email?: string
): Promise<ApiResponse<ChatResponse>> {
  const body: ChatRequest = {
    message,
    conversation_id: conversationId,
  };

  return apiClient.post<ChatResponse>(
    `/api/${userId}/chat`,
    body,
    userId,
    email
  );
}

/**
 * Retrieve conversation history for a user.
 *
 * @param userId - The authenticated user's ID
 * @param limit - Optional maximum number of messages to return (default: 50)
 * @param email - Optional user email for JWT creation
 * @returns ConversationHistory with message array
 */
export async function getChatHistory(
  userId: string,
  limit: number = 50,
  email?: string
): Promise<ApiResponse<ConversationHistory>> {
  return apiClient.get<ConversationHistory>(
    `/api/${userId}/chat/history?limit=${limit}`,
    userId,
    email
  );
}
