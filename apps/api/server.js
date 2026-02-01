import Fastify from "fastify";
import mercurius from "mercurius";
import cors from "@fastify/cors";
import { db as prisma } from "db";
import { schema } from "./src/graphql/schemas/index.js";
import { resolvers } from "./src/graphql/resolvers/index.js";
import { authMiddleware } from "./src/middleware/auth.js";
import { sseRoutes } from "./src/routes/sse.js";
import { configRoutes } from "./src/routes/config.js";

const app = Fastify({
  logger: true,
});

// Register CORS
await app.register(cors, {
  origin: true, // Adjust this in production
});

// Register Mercurius GraphQL
await app.register(mercurius, {
  schema,
  resolvers,
  context: async (request) => {
    // Add auth middleware
    const authContext = await authMiddleware(request);

    return {
      ...authContext,
      prisma,
    };
  },
  graphiql: true, // Enable GraphiQL interface for development
});

// Health check endpoint
app.get("/health", async () => ({ ok: true }));

// Decorate fastify with prisma for use in routes
app.decorate("prisma", prisma);

// Register SSE routes
await app.register(sseRoutes);

// Register config routes
await app.register(configRoutes);

// Graceful shutdown
const closeGracefully = async (signal) => {
  app.log.info(`Received signal to terminate: ${signal}`);
  await prisma.$disconnect();
  await app.close();
  process.exit(0);
};

process.on("SIGINT", closeGracefully);
process.on("SIGTERM", closeGracefully);

// Start server
const start = async () => {
  try {
    await app.listen({ port: 3000, host: "0.0.0.0" });
    app.log.info(`Server running on http://localhost:3000`);
    app.log.info(`GraphiQL available at http://localhost:3000/graphiql`);
  } catch (err) {
    app.log.error(err);
    await prisma.$disconnect();
    process.exit(1);
  }
};

start();
