import { uuidv7 } from "uuidv7";

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
          title: input.title || null,
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
  },
};
