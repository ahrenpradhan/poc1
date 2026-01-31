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
  },

  /**
   * Streams a mock AI response word by word
   * @param {string} userMessage - The user's message
   * @param {import('./types.js').ConversationMessage[]} _conversationHistory - Previous messages (unused in mock)
   * @returns {AsyncGenerator<string>} Yields response chunks
   */
  async *streamResponse(userMessage, _conversationHistory = []) {
    const turn = _conversationHistory.length + 1;
    const response = `AI (mock): Turn ${turn}. You said: ${userMessage}`;
    const words = response.split(" ");

    for (const word of words) {
      await new Promise((r) => setTimeout(r, 100)); // Simulate streaming delay
      yield word + " ";
    }
  },
};
