/**
 * Mock AI adapter that echoes back the user's message
 * @type {import('./types.js').AIAdapter}
 */
export const mockAdapter = {
  /**
   * Generates a mock AI response by echoing the user message
   * @param {string} userMessage - The user's message
   * @param {import('./types.js').ConversationMessage[]} _conversationHistory - Previous messages (unused in mock)
   * @returns {Promise<string>} The AI response
   */
  async generateResponse(userMessage, _conversationHistory = []) {
    return `AI: ${userMessage}`;
  },
};
