const MOCK_RESPONSE_DELAY = parseInt(
  process.env.MOCK_RESPONSE_DELAY_MS || "1500",
  10,
);
const MOCK_STREAM_WORD_DELAY = parseInt(
  process.env.MOCK_STREAM_WORD_DELAY_MS || "100",
  10,
);

/**
 * Mock AI adapter that echoes back the user's message
 * @type {import('./types.js').AIAdapter}
 */
export const mockAdapter = {
  /**
   * Generates a mock AI response by echoing the user message
   * @param {string} userMessage - The user's message
   * @param {import('./types.js').ConversationMessage[]} _conversationHistory - Previous messages (unused in mock)
   * @param {object} options - Options including abort signal
   * @returns {Promise<{content: string, content_type: string}>} The AI response
   */
  async generateResponse(userMessage, _conversationHistory = [], options = {}) {
    await new Promise((resolve, reject) => {
      const timeout = setTimeout(resolve, MOCK_RESPONSE_DELAY);
      options.signal?.addEventListener("abort", () => {
        clearTimeout(timeout);
        reject(new DOMException("Aborted", "AbortError"));
      });
    });
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
   * @param {object} options - Options including abort signal
   * @returns {AsyncGenerator<{chunk?: string, content_type: string, done?: boolean}>} Yields response chunks
   */
  async *streamResponse(userMessage, _conversationHistory = [], options = {}) {
    const turn = _conversationHistory.length + 1;
    const response = `AI (mock): Turn ${turn}. You said: ${userMessage}`;
    const words = response.split(" ");

    for (const word of words) {
      if (options.signal?.aborted) {
        return;
      }
      await new Promise((r) => setTimeout(r, MOCK_STREAM_WORD_DELAY)); // Simulate streaming delay
      yield { chunk: word + " ", content_type: "text" };
    }
  },
};
