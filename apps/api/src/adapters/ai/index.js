import { mockAdapter } from "./mock.adapter.js";
import { ollamaAdapter } from "./ollama.adapter.js";
/**
 * The active AI adapter
 * Change this export to use a different adapter implementation
 * @type {import('./types.js').AIAdapter}
 */
export const aiAdapter = {
  mock: mockAdapter,
  ollama: ollamaAdapter,
  default: ollamaAdapter,
  // default: mockAdapter,
};
