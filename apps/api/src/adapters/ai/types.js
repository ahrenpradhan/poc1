/**
 * @typedef {Object} ConversationMessage
 * @property {('system'|'user'|'assistant')} role - The role of the message sender
 * @property {string} content - The message content
 */

/**
 * @typedef {Object} AIAdapter
 * @property {function(string, ConversationMessage[]): Promise<string>} generateResponse
 *   Generates an AI response given the user message and conversation history
 * @property {function(string, ConversationMessage[]): AsyncGenerator<string>} [streamResponse]
 *   Optional: Streams AI response chunks given the user message and conversation history
 */

export const AIAdapterTypes = {};
