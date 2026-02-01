import fetch from "node-fetch";

class OllamaAdapterClass {
  baseUrl = process.env.OLLAMA_BASE_URL || "http://localhost:11434";
  model = process.env.OLLAMA_MODEL || "mistral";

  async *stream(prompt, signal) {
    const response = await fetch(`${this.baseUrl}/api/generate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: this.model,
        prompt,
        stream: true,
      }),
      signal,
    });

    if (!response.ok || !response.body) {
      throw new Error("Failed to connect to Ollama");
    }

    const decoder = new TextDecoder();
    let buffer = "";

    for await (const chunk of response.body) {
      // Check if aborted
      if (signal?.aborted) {
        return;
      }

      buffer += decoder.decode(chunk, { stream: true });

      const lines = buffer.split("\n");
      buffer = lines.pop() ?? "";

      for (const line of lines) {
        if (!line.trim()) continue;

        const parsed = JSON.parse(line);

        if (parsed.response) {
          yield parsed.response;
        }

        if (parsed.done) {
          return;
        }
      }
    }
  }
}

const collectStream = async (stream) => {
  let result = "";
  for await (const chunk of stream) {
    result += chunk;
  }
  return result;
};

export const ollamaAdapter = {
  async generateResponse(prompt, _conversationHistory = [], options = {}) {
    try {
      const ollama = new OllamaAdapterClass();
      const stream = ollama.stream(prompt, options.signal);
      const content = await collectStream(stream);
      return {
        content,
        content_type: "text",
      };
    } catch (err) {
      if (err?.name === "AbortError") {
        throw err; // Re-throw abort errors
      }
      console.error(err);
      throw new Error(err?.message ?? "LLM failed");
    }
  },

  async *streamResponse(prompt, _conversationHistory = [], options = {}) {
    try {
      const ollama = new OllamaAdapterClass();
      for await (const chunk of ollama.stream(prompt, options.signal)) {
        yield { chunk, content_type: "text" };
      }
    } catch (err) {
      if (err?.name === "AbortError") {
        return; // Silently exit on abort
      }
      console.error(err);
      throw new Error(err?.message ?? "LLM failed");
    }
  },
};
