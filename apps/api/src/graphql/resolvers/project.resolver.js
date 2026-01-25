export const projectResolvers = {
  Query: {
    projects: async (_, __, context) => {
      if (!context.user) {
        throw new Error("Not authenticated");
      }

      const projects = await context.prisma.project.findMany({
        where: {
          user_id: context.user.userId,
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
          user_id: context.user.userId,
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
          deleted_at: null,
        },
        include: {
          project: true,
        },
      });

      if (!chat || chat.project.user_id !== context.user.userId) {
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
          deleted_at: null,
        },
        include: {
          project: true,
        },
      });

      if (!chat || chat.project.user_id !== context.user.userId) {
        throw new Error("Chat not found");
      }

      const messages = await context.prisma.message.findMany({
        where: {
          chat_id,
          deleted_at: null,
        },
        orderBy: {
          created_at: "asc",
        },
      });

      return messages;
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
          user_id: context.user.userId,
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
          user_id: context.user.userId,
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
          user_id: context.user.userId,
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

      // Verify user owns the project
      const project = await context.prisma.project.findFirst({
        where: {
          id: input.project_id,
          user_id: context.user.userId,
          deleted_at: null,
        },
      });

      if (!project) {
        throw new Error("Project not found");
      }

      const currentTime = new Date();

      const chat = await context.prisma.chat.create({
        data: {
          project_id: input.project_id,
          title: input.title,
          created_at: currentTime,
          updated_at: currentTime,
        },
      });

      return chat;
    },

    updateChat: async (_, { id, input }, context) => {
      if (!context.user) {
        throw new Error("Not authenticated");
      }

      // Verify ownership through project
      const existing = await context.prisma.chat.findFirst({
        where: {
          id,
          deleted_at: null,
        },
        include: {
          project: true,
        },
      });

      if (!existing || existing.project.user_id !== context.user.userId) {
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

      // Verify ownership through project
      const existing = await context.prisma.chat.findFirst({
        where: {
          id,
          deleted_at: null,
        },
        include: {
          project: true,
        },
      });

      if (!existing || existing.project.user_id !== context.user.userId) {
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

      // Verify user owns the chat through project
      const chat = await context.prisma.chat.findFirst({
        where: {
          id: input.chat_id,
          deleted_at: null,
        },
        include: {
          project: true,
        },
      });

      if (!chat || chat.project.user_id !== context.user.userId) {
        throw new Error("Chat not found");
      }

      const currentTime = new Date();

      const message = await context.prisma.message.create({
        data: {
          chat_id: input.chat_id,
          role: input.role,
          content: input.content,
          created_at: currentTime,
        },
      });

      return message;
    },

    deleteMessage: async (_, { id }, context) => {
      if (!context.user) {
        throw new Error("Not authenticated");
      }

      // Verify ownership through chat and project
      const existing = await context.prisma.message.findFirst({
        where: {
          id,
          deleted_at: null,
        },
        include: {
          chat: {
            include: {
              project: true,
            },
          },
        },
      });

      if (
        !existing ||
        existing.chat.project.user_id !== context.user.userId
      ) {
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
          created_at: "asc",
        },
      });
    },
  },
};
