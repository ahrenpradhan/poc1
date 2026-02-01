/**
 * Mock AI adapter that echoes back the user's message
 * @type {import('./types.js').AIAdapter}
 */
export const mockAdapter = {
  /**
   * Generates a mock AI response by echoing the user message
   * @param {string} userMessage - The user's message
   * @param {import('./types.js').ConversationMessage[]} _conversationHistory - Previous messages (unused in mock)
   * @returns {Promise<{content: string, content_type: string}>} The AI response
   */
  async generateResponse(userMessage, _conversationHistory = []) {
    await new Promise((r) => setTimeout(r, 1500));
    const turn = _conversationHistory.length + 1;
    return {
      content: `AI (mock): Turn ${turn}. You said: ${userMessage}`,
      content_type: "text",
    };
  },

  /**
   * Streams a mock AI response word by word
   * @param {string} userMessage - The user's message
   * @param {import('./types.js').ConversationMessage[]} _conversationHistory - Previous messages (unused in mock)
   * @returns {AsyncGenerator<{chunk?: string, content_type: string, done?: boolean}>} Yields response chunks
   */
  async *streamResponse(userMessage, _conversationHistory = []) {
    const turn = _conversationHistory.length + 1;
    const response = `AI (mock): Turn ${turn}. You said: ${userMessage}`;
    const words = response.split(" ");

    for (const word of words) {
      await new Promise((r) => setTimeout(r, 100)); // Simulate streaming delay
      yield { chunk: word + " ", content_type: "text" };
    }
  },
};
