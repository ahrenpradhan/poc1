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
    await new Promise((r) => setTimeout(r, 1500));
    const turn = _conversationHistory.length + 1;
    return `AI (mock): Turn ${turn}. You said: ${userMessage}`;
    // return `AI: ${userMessage}`;
  },
};
