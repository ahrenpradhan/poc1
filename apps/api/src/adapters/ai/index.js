import { mockAdapter } from "./mock.adapter.js";
import { ollamaAdapter } from "./ollamaAdapter.ts";
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
