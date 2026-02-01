import { aiAdapter } from "../adapters/ai/index.js";
import { verifyToken } from "../utils/auth.js";

/**
 * SSE route for streaming AI responses
 * @param {import('fastify').FastifyInstance} fastify
 */
export async function sseRoutes(fastify) {
  fastify.post("/api/chat/stream", async (request, reply) => {
    const { chat_id, adapter = "default" } = request.body || {};

    // Verify authentication
    const authHeader = request.headers.authorization;
    if (!authHeader?.startsWith("Bearer ")) {
      return reply.status(401).send({ error: "Unauthorized" });
    }

    const token = authHeader.slice(7);
    const user = await verifyToken(token);
    if (!user) {
      return reply.status(401).send({ error: "Invalid token" });
    }

    if (!chat_id) {
      return reply.status(400).send({ error: "chat_id is required" });
    }

    // Verify user owns the chat
    const chat = await fastify.prisma.chat.findFirst({
      where: {
        id: chat_id,
        owner_id: user.userId,
        deleted_at: null,
      },
    });

    if (!chat) {
      return reply.status(404).send({ error: "Chat not found" });
    }

    // Get conversation history
    const existingMessages = await fastify.prisma.message.findMany({
      where: {
        chat_id,
        deleted_at: null,
      },
      orderBy: {
        sequence: "asc",
      },
      select: {
        role: true,
        content: true,
      },
    });

    // Get last user message
    const lastUserMessage = existingMessages
      .filter((m) => m.role === "user")
      .pop();
    if (!lastUserMessage) {
      return reply.status(400).send({ error: "No user message to respond to" });
    }

    // Get next sequence number
    const lastMessage = await fastify.prisma.message.findFirst({
      where: {
        chat_id,
        deleted_at: null,
      },
      orderBy: {
        sequence: "desc",
      },
    });
    const nextSequence = lastMessage ? lastMessage.sequence + 1 : 1;

    // Resolve adapter
    const adapterName = adapter === "default" ? "ollama" : adapter;
    const selectedAdapter = aiAdapter[adapter] || aiAdapter.default;

    if (!selectedAdapter.streamResponse) {
      return reply
        .status(400)
        .send({ error: "Adapter does not support streaming" });
    }

    // Set SSE headers
    reply.raw.writeHead(200, {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
      "Access-Control-Allow-Origin": "*",
    });

    // Create abort controller for cancellation
    const abortController = new AbortController();
    let isClosed = false;

    // Handle client disconnect
    request.raw.on("close", () => {
      if (!isClosed) {
        isClosed = true;
        abortController.abort();
        fastify.log.info("Client disconnected, aborting LLM request");
      }
    });

    let fullContent = "";
    let contentType = "text";

    try {
      // Stream the response with abort signal
      for await (const streamData of selectedAdapter.streamResponse(
        lastUserMessage.content,
        existingMessages,
        { signal: abortController.signal },
      )) {
        if (isClosed) break;

        const chunk = streamData.chunk;
        contentType = streamData.content_type || "text";
        fullContent += chunk;
        reply.raw.write(
          `data: ${JSON.stringify({ chunk, content_type: contentType })}\n\n`,
        );
      }

      // Only save if not aborted and has content
      if (!isClosed && fullContent.length > 0) {
        // Save the complete message to database
        const assistantMessage = await fastify.prisma.message.create({
          data: {
            chat_id,
            sequence: nextSequence,
            role: "assistant",
            content: fullContent,
            content_type: contentType,
            adapter: adapterName,
            network_method: "sse",
            created_at: new Date(),
          },
        });

        // Send completion event with message ID
        reply.raw.write(
          `data: ${JSON.stringify({ done: true, message: assistantMessage })}\n\n`,
        );
      }
    } catch (err) {
      if (err?.name === "AbortError" || isClosed) {
        fastify.log.info("Stream aborted by client");
      } else {
        console.error("SSE streaming error:", err);
        if (!isClosed) {
          reply.raw.write(
            `data: ${JSON.stringify({ error: err.message })}\n\n`,
          );
        }
      }
    } finally {
      isClosed = true;
      reply.raw.end();
    }
  });
}
