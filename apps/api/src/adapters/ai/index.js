import { mockAdapter } from "./mock.adapter.js";

/**
 * The active AI adapter
 * Change this export to use a different adapter implementation
 * @type {import('./types.js').AIAdapter}
 */
export const aiAdapter = mockAdapter;
