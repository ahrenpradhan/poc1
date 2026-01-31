import fetch from "node-fetch";

class OllamaAdapterClass {
  baseUrl = "http://localhost:11434";
  model = "mistral";

  async *stream(prompt) {
    const response = await fetch(`${this.baseUrl}/api/generate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: this.model,
        prompt,
        stream: true,
      }),
    });

    if (!response.ok || !response.body) {
      throw new Error("Failed to connect to Ollama");
    }

    const decoder = new TextDecoder();
    let buffer = "";

    for await (const chunk of response.body) {
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
  async generateResponse(prompt, _conversationHistory = []) {
    try {
      const ollama = new OllamaAdapterClass();
      const stream = ollama.stream(prompt);
      return await collectStream(stream);
    } catch (err) {
      console.error(err);
      throw new Error(err?.message ?? "LLM failed");
    }
  },

  async *streamResponse(prompt, _conversationHistory = []) {
    try {
      const ollama = new OllamaAdapterClass();
      for await (const chunk of ollama.stream(prompt)) {
        yield chunk;
      }
    } catch (err) {
      console.error(err);
      throw new Error(err?.message ?? "LLM failed");
    }
  },
};
