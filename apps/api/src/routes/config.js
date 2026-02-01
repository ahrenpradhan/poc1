import { adapterOptions } from "../adapters/ai/index.js";

/**
 * Config routes for frontend configuration options
 * @param {import('fastify').FastifyInstance} fastify
 */
export async function configRoutes(fastify) {
  fastify.get("/api/config/adapters", async (_request, reply) => {
    return reply.send({ adapters: adapterOptions });
  });
}
