import { mockAdapter } from "./mock.adapter.js";
import { ollamaAdapter } from "./ollama.adapter.js";

/**
 * Adapter metadata for frontend display
 */
export const adapterOptions = [
  {
    value: "mock",
    label: "Mock",
    description:
      "A mock adapter that echoes back the user's message for testing purposes.",
  },
  {
    value: "ollama",
    label: "Ollama",
    description:
      "Local LLM using Ollama. Requires Ollama to be running on localhost:11434.",
  },
];

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
