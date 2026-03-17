'use server';
/**
 * @fileOverview A smart kitchen assistant chat flow using stateful sessions.
 * 
 * - assistantChat - A function that handles multi-turn chat with tool support.
 * 
 * LOSS OF THOUGHT_SIGNATURE EXPLANATION:
 * The 'thought_signature' is lost when chat history is manually reconstructed using 
 * only the 'text' property of a message. Reasoning models (like Gemini 2.0 Thinking) 
 * generate a 'reasoning' part in their response. If you send back a history that 
 * includes the function call but omits the reasoning part that preceded it, 
 * the API rejects the request. 
 * 
 * Using Genkit's ai.chat() session API ensures the entire message history (including 
 * all parts: text, reasoning, functionCall, and functionResponse) is preserved correctly.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

// Example tool: In a real app, this would interact with your database.
const requestFirebaseBackendTool = ai.defineTool(
  {
    name: 'RequestFirebaseBackendTool',
    description: 'Provisions or updates Firebase backend services like Firestore or Auth.',
    inputSchema: z.object({
      service: z.string().describe('The name of the service to provision (e.g., "firestore", "auth").'),
    }),
    outputSchema: z.object({
      success: z.boolean(),
      message: z.string(),
    }),
  },
  async (input) => {
    // This is a placeholder for the actual tool implementation
    return { 
      success: true, 
      message: `Successfully simulated provisioning of ${input.service}.` 
    };
  }
);

const AssistantChatInputSchema = z.object({
  message: z.string(),
  history: z.array(z.any()).optional().describe('The previous chat history.'),
});

const AssistantChatOutputSchema = z.object({
  text: z.string(),
  history: z.array(z.any()),
});

/**
 * Requirement 1 & 4: Use ai.chat() session APIs.
 * This function continues a session, handles tool calls automatically,
 * and preserves all metadata (including thought_signatures).
 */
export async function assistantChat(input: { message: string, history?: any[] }) {
  // Initialize the chat with history. 
  // Requirement 2: This preserves the full history across turns.
  const chat = ai.chat({
    system: 'You are NutriFridge AI, a helpful kitchen assistant. Use tools when requested.',
    tools: [requestFirebaseBackendTool],
    history: input.history,
  });

  // Requirement 5: Genkit handles the serialization. 
  // It will automatically process tool calls and continue the session.
  const response = await chat.send(input.message);

  return {
    text: response.text,
    history: chat.history, // Return the updated history to the client
  };
}
