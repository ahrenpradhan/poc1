import { uuidv7 } from "uuidv7";
import { aiAdapter } from "../../adapters/ai/index.js";

export const projectResolvers = {
  Query: {
    projects: async (_, __, context) => {
      if (!context.user) {
        throw new Error("Not authenticated");
      }

      const projects = await context.prisma.project.findMany({
        where: {
          owner_id: context.user.userId,
          deleted_at: null,
        },
        orderBy: {
          updated_at: "desc",
        },
      });

      return projects;
    },

    project: async (_, { id }, context) => {
      if (!context.user) {
        throw new Error("Not authenticated");
      }

      const project = await context.prisma.project.findFirst({
        where: {
          id,
          owner_id: context.user.userId,
          deleted_at: null,
        },
      });

      if (!project) {
        throw new Error("Project not found");
      }

      return project;
    },

    chats: async (_, __, context) => {
      if (!context.user) {
        throw new Error("Not authenticated");
      }

      const chats = await context.prisma.chat.findFirst({
        where: {
          owner_id: context.user.userId,
          deleted_at: null,
        },
      });

      if (!chats) {
        throw new Error("Chat not found");
      }

      return chats;
    },

    chat: async (_, { id }, context) => {
      if (!context.user) {
        throw new Error("Not authenticated");
      }

      const chat = await context.prisma.chat.findFirst({
        where: {
          id,
          owner_id: context.user.userId,
          deleted_at: null,
        },
      });

      if (!chat) {
        throw new Error("Chat not found");
      }

      return chat;
    },

    chatByPublicId: async (_, { public_id }, context) => {
      if (!context.user) {
        throw new Error("Not authenticated");
      }

      const chat = await context.prisma.chat.findFirst({
        where: {
          public_id,
          owner_id: context.user.userId,
          deleted_at: null,
        },
      });

      return chat;
    },

    chatMessages: async (_, { chat_id }, context) => {
      if (!context.user) {
        throw new Error("Not authenticated");
      }

      // Verify user owns the chat
      const chat = await context.prisma.chat.findFirst({
        where: {
          id: chat_id,
          owner_id: context.user.userId,
          deleted_at: null,
        },
      });

      if (!chat) {
        throw new Error("Chat not found");
      }

      const messages = await context.prisma.message.findMany({
        where: {
          chat_id,
          deleted_at: null,
        },
        orderBy: {
          sequence: "asc",
        },
      });

      return messages;
    },

    chatMessagesPaginated: async (
      _,
      { chat_id, first, after, last, before },
      context,
    ) => {
      if (!context.user) {
        throw new Error("Not authenticated");
      }

      // Verify user owns the chat
      const chat = await context.prisma.chat.findFirst({
        where: {
          id: chat_id,
          owner_id: context.user.userId,
          deleted_at: null,
        },
      });

      if (!chat) {
        throw new Error("Chat not found");
      }

      // Get total count
      const totalCount = await context.prisma.message.count({
        where: {
          chat_id,
          deleted_at: null,
        },
      });

      // Build query conditions
      const whereClause = {
        chat_id,
        deleted_at: null,
      };

      // Decode cursor (base64 encoded sequence number)
      const decodeCursor = (cursor) => {
        return parseInt(Buffer.from(cursor, "base64").toString("utf-8"), 10);
      };

      const encodeCursor = (sequence) => {
        return Buffer.from(sequence.toString()).toString("base64");
      };

      // Handle cursor-based pagination
      if (after) {
        whereClause.sequence = { gt: decodeCursor(after) };
      }
      if (before) {
        whereClause.sequence = {
          ...whereClause.sequence,
          lt: decodeCursor(before),
        };
      }

      // Determine pagination direction and limit
      let take = first || last || 20;
      let orderBy = { sequence: "asc" };

      // For "last" pagination (loading older messages when scrolling up)
      if (last && !first) {
        orderBy = { sequence: "desc" };
      }

      const messages = await context.prisma.message.findMany({
        where: whereClause,
        orderBy,
        take: take + 1, // Fetch one extra to determine if there are more
      });

      // Check if there are more results
      const hasMore = messages.length > take;
      if (hasMore) {
        messages.pop(); // Remove the extra item
      }

      // Reverse if we fetched in desc order for "last" pagination
      if (last && !first) {
        messages.reverse();
      }

      // Build edges
      const edges = messages.map((message) => ({
        cursor: encodeCursor(message.sequence),
        node: message,
      }));

      // Determine page info
      const pageInfo = {
        hasNextPage: first ? hasMore : false,
        hasPreviousPage: last ? hasMore : false,
        startCursor: edges.length > 0 ? edges[0].cursor : null,
        endCursor: edges.length > 0 ? edges[edges.length - 1].cursor : null,
      };

      // If we have after cursor, there are previous pages
      if (after) {
        pageInfo.hasPreviousPage = true;
      }
      // If we have before cursor, there are next pages
      if (before) {
        pageInfo.hasNextPage = true;
      }

      return {
        edges,
        pageInfo,
        totalCount,
      };
    },

    chatMessagesByUserCount: async (
      _,
      { chat_id, userMessageCount = 10, beforeSequence },
      context,
    ) => {
      if (!context.user) {
        throw new Error("Not authenticated");
      }

      // Verify user owns the chat
      const chat = await context.prisma.chat.findFirst({
        where: {
          id: chat_id,
          owner_id: context.user.userId,
          deleted_at: null,
        },
      });

      if (!chat) {
        throw new Error("Chat not found");
      }

      // Build where clause for fetching messages
      const whereClause = {
        chat_id,
        deleted_at: null,
      };

      // If beforeSequence is provided, only get messages before that sequence
      if (beforeSequence) {
        whereClause.sequence = { lt: beforeSequence };
      }

      // Get all messages up to the cursor (or all if no cursor), ordered desc
      const allMessages = await context.prisma.message.findMany({
        where: whereClause,
        orderBy: { sequence: "desc" },
      });

      // Count user messages and find the cutoff point
      let userMessagesSeen = 0;
      let cutoffIndex = allMessages.length; // Default to include all

      for (let i = 0; i < allMessages.length; i++) {
        if (allMessages[i].role === "user") {
          userMessagesSeen++;
          if (userMessagesSeen > userMessageCount) {
            cutoffIndex = i;
            break;
          }
        }
      }

      // Get messages from cutoff to end (these are the ones we want)
      const selectedMessages = allMessages.slice(0, cutoffIndex);

      // Reverse to get ascending order
      selectedMessages.reverse();

      // Get total count for the chat
      const totalCount = await context.prisma.message.count({
        where: {
          chat_id,
          deleted_at: null,
        },
      });

      // Encode cursor helper
      const encodeCursor = (sequence) => {
        return Buffer.from(sequence.toString()).toString("base64");
      };

      // Build edges
      const edges = selectedMessages.map((message) => ({
        cursor: encodeCursor(message.sequence),
        node: message,
      }));

      // Determine if there are more messages before
      const hasPreviousPage = cutoffIndex < allMessages.length;

      // Get the earliest sequence in our result for the next page cursor
      const startSequence =
        selectedMessages.length > 0 ? selectedMessages[0].sequence : null;

      const pageInfo = {
        hasNextPage: false, // We always load from the end, so no next page
        hasPreviousPage,
        startCursor: startSequence ? encodeCursor(startSequence) : null,
        endCursor:
          selectedMessages.length > 0
            ? encodeCursor(
                selectedMessages[selectedMessages.length - 1].sequence,
              )
            : null,
      };

      return {
        edges,
        pageInfo,
        totalCount,
      };
    },

    chatsByOwnerId: async (_, __, context) => {
      if (!context.user) {
        throw new Error("Not authenticated");
      }

      const chats = await context.prisma.chat.findMany({
        where: {
          owner_id: context.user.userId,
          deleted_at: null,
        },
        orderBy: {
          updated_at: "desc",
        },
      });

      return chats;
    },
  },

  Mutation: {
    createProject: async (_, { input }, context) => {
      if (!context.user) {
        throw new Error("Not authenticated");
      }

      const currentTime = new Date();

      const project = await context.prisma.project.create({
        data: {
          owner_id: context.user.userId,
          title: input.title,
          description: input.description,
          created_at: currentTime,
          updated_at: currentTime,
        },
      });

      return project;
    },

    updateProject: async (_, { id, input }, context) => {
      if (!context.user) {
        throw new Error("Not authenticated");
      }

      // Verify ownership
      const existing = await context.prisma.project.findFirst({
        where: {
          id,
          owner_id: context.user.userId,
          deleted_at: null,
        },
      });

      if (!existing) {
        throw new Error("Project not found");
      }

      const project = await context.prisma.project.update({
        where: { id },
        data: {
          ...input,
          updated_at: new Date(),
        },
      });

      return project;
    },

    deleteProject: async (_, { id }, context) => {
      if (!context.user) {
        throw new Error("Not authenticated");
      }

      // Verify ownership
      const existing = await context.prisma.project.findFirst({
        where: {
          id,
          owner_id: context.user.userId,
          deleted_at: null,
        },
      });

      if (!existing) {
        throw new Error("Project not found");
      }

      // Soft delete
      await context.prisma.project.update({
        where: { id },
        data: {
          deleted_at: new Date(),
        },
      });

      return true;
    },

    createChat: async (_, { input }, context) => {
      if (!context.user) {
        throw new Error("Not authenticated");
      }

      // If project_id is provided, verify user owns the project
      if (input.project_id) {
        const project = await context.prisma.project.findFirst({
          where: {
            id: input.project_id,
            owner_id: context.user.userId,
            deleted_at: null,
          },
        });

        if (!project) {
          throw new Error("Project not found");
        }
      }

      const currentTime = new Date();

      // Generate unique public_id using UUID7
      const public_id = uuidv7();

      const chatData = {
        owner_id: context.user.userId,
        public_id: public_id,
        title: input.title || null,
        created_at: currentTime,
        updated_at: currentTime,
      };

      // Only include project_id if provided
      if (input.project_id) {
        chatData.project_id = input.project_id;
      }

      const chat = await context.prisma.chat.create({
        data: chatData,
      });

      return chat;
    },

    updateChat: async (_, { id, input }, context) => {
      if (!context.user) {
        throw new Error("Not authenticated");
      }

      // Verify ownership
      const existing = await context.prisma.chat.findFirst({
        where: {
          id,
          owner_id: context.user.userId,
          deleted_at: null,
        },
      });

      if (!existing) {
        throw new Error("Chat not found");
      }

      const chat = await context.prisma.chat.update({
        where: { id },
        data: {
          ...input,
          updated_at: new Date(),
        },
      });

      return chat;
    },

    deleteChat: async (_, { id }, context) => {
      if (!context.user) {
        throw new Error("Not authenticated");
      }

      // Verify ownership
      const existing = await context.prisma.chat.findFirst({
        where: {
          id,
          owner_id: context.user.userId,
          deleted_at: null,
        },
      });

      if (!existing) {
        throw new Error("Chat not found");
      }

      // Soft delete
      await context.prisma.chat.update({
        where: { id },
        data: {
          deleted_at: new Date(),
        },
      });

      return true;
    },

    createMessage: async (_, { input }, context) => {
      if (!context.user) {
        throw new Error("Not authenticated");
      }

      // Verify user owns the chat
      const chat = await context.prisma.chat.findFirst({
        where: {
          id: input.chat_id,
          owner_id: context.user.userId,
          deleted_at: null,
        },
      });

      if (!chat) {
        throw new Error("Chat not found");
      }

      // Get the next sequence number
      const lastMessage = await context.prisma.message.findFirst({
        where: {
          chat_id: input.chat_id,
          deleted_at: null,
        },
        orderBy: {
          sequence: "desc",
        },
      });

      const nextSequence = lastMessage ? lastMessage.sequence + 1 : 1;
      const currentTime = new Date();

      // Create the user message
      const message = await context.prisma.message.create({
        data: {
          chat_id: input.chat_id,
          sequence: nextSequence,
          role: input.role,
          content: input.content,
          created_at: currentTime,
        },
      });

      return message;
    },

    generateAIResponse: async (_, { input }, context) => {
      if (!context.user) {
        throw new Error("Not authenticated");
      }

      // Verify user owns the chat
      const chat = await context.prisma.chat.findFirst({
        where: {
          id: input.chat_id,
          owner_id: context.user.userId,
          deleted_at: null,
        },
      });

      if (!chat) {
        throw new Error("Chat not found");
      }

      // Get existing messages for conversation history
      const existingMessages = await context.prisma.message.findMany({
        where: {
          chat_id: input.chat_id,
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

      // Get the last user message to respond to
      const lastUserMessage = existingMessages
        .filter((m) => m.role === "user")
        .pop();

      if (!lastUserMessage) {
        throw new Error("No user message to respond to");
      }

      // Get the next sequence number
      const lastMessage = await context.prisma.message.findFirst({
        where: {
          chat_id: input.chat_id,
          deleted_at: null,
        },
        orderBy: {
          sequence: "desc",
        },
      });

      const nextSequence = lastMessage ? lastMessage.sequence + 1 : 1;

      // Generate AI response
      const adapterName = input.adapter || "default";
      const aiResponse = await aiAdapter[adapterName].generateResponse(
        lastUserMessage.content,
        existingMessages,
      );

      // Create the assistant message
      const assistantMessage = await context.prisma.message.create({
        data: {
          chat_id: input.chat_id,
          sequence: nextSequence,
          role: "assistant",
          content: aiResponse.content,
          content_type: aiResponse.content_type || "text",
          adapter: adapterName === "default" ? "ollama" : adapterName,
          created_at: new Date(),
        },
      });

      return assistantMessage;
    },

    createNewChatByMessage: async (_, { input }, context) => {
      if (!context.user) {
        throw new Error("Not authenticated");
      }

      // If project_id is provided, verify user owns the project
      if (input.project_id) {
        const project = await context.prisma.project.findFirst({
          where: {
            id: input.project_id,
            owner_id: context.user.userId,
            deleted_at: null,
          },
        });

        if (!project) {
          throw new Error("Project not found");
        }
      }

      const currentTime = new Date();

      // Use transaction to create chat and message atomically
      return await context.prisma.$transaction(async (tx) => {
        // Generate unique public_id using UUID7
        const public_id = uuidv7();

        const chatData = {
          owner_id: context.user.userId,
          public_id: public_id,
          title: input.title || input.content,
          created_at: currentTime,
          updated_at: currentTime,
        };

        // Only include project_id if provided
        if (input.project_id) {
          chatData.project_id = input.project_id;
        }

        // Create the chat
        const chat = await tx.chat.create({
          data: chatData,
        });

        // Create the first message with sequence 1
        await tx.message.create({
          data: {
            chat_id: chat.id,
            sequence: 1,
            role: input.role,
            content: input.content,
            created_at: currentTime,
          },
        });

        // Return chat with messages included
        return await tx.chat.findUnique({
          where: { id: chat.id },
          include: {
            messages: {
              where: { deleted_at: null },
              orderBy: { sequence: "asc" },
            },
          },
        });
      });
    },

    deleteMessage: async (_, { id }, context) => {
      if (!context.user) {
        throw new Error("Not authenticated");
      }

      // Verify ownership through chat
      const existing = await context.prisma.message.findFirst({
        where: {
          id,
          deleted_at: null,
        },
        include: {
          chat: true,
        },
      });

      if (!existing || existing.chat.owner_id !== context.user.userId) {
        throw new Error("Message not found");
      }

      // Soft delete
      await context.prisma.message.update({
        where: { id },
        data: {
          deleted_at: new Date(),
        },
      });

      return true;
    },
  },

  Project: {
    chats: async (parent, _, context) => {
      if (parent.chats) {
        return parent.chats;
      }

      return context.prisma.chat.findMany({
        where: {
          project_id: parent.id,
          deleted_at: null,
        },
        orderBy: {
          updated_at: "desc",
        },
      });
    },
  },

  Chat: {
    messages: async (parent, _, context) => {
      if (parent.messages) {
        return parent.messages;
      }

      return context.prisma.message.findMany({
        where: {
          chat_id: parent.id,
          deleted_at: null,
        },
        orderBy: {
          sequence: "asc",
        },
      });
    },

    project: async (parent, _, context) => {
      if (parent.project !== undefined) {
        return parent.project;
      }

      if (!parent.project_id) {
        return null;
      }

      return context.prisma.project.findFirst({
        where: {
          id: parent.project_id,
          deleted_at: null,
        },
      });
    },

    created_at: (parent) => {
      return parent.created_at instanceof Date
        ? parent.created_at.toISOString()
        : parent.created_at;
    },

    updated_at: (parent) => {
      return parent.updated_at instanceof Date
        ? parent.updated_at.toISOString()
        : parent.updated_at;
    },
  },

  Message: {
    created_at: (parent) => {
      return parent.created_at instanceof Date
        ? parent.created_at.toISOString()
        : parent.created_at;
    },
  },
};
