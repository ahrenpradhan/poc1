import fetch from "node-fetch";

class OllamaAdapterClass {
  private baseUrl = "http://localhost:11434";
  private model = "mistral";

  async *stream(prompt: string): AsyncGenerator<string> {
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

    // ✅ Node.js streaming consumption
    for await (const chunk of response.body as any) {
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

// unchanged helper
const collectStream = async (
  stream: AsyncGenerator<string>,
): Promise<string> => {
  let result = "";
  for await (const chunk of stream) {
    result += chunk;
  }
  return result;
};

export const ollamaAdapter = {
  generateResponse: async (prompt: string): Promise<string> => {
    try {
      const ollama = new OllamaAdapterClass();
      const stream = ollama.stream(prompt);
      return await collectStream(stream);
    } catch (err: any) {
      console.error(err);
      throw new Error(err?.message ?? "LLM failed");
    }
  },
};
