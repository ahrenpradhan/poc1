import {
  hashPassword,
  comparePassword,
  generateToken,
} from "../../utils/auth.js";

export const userResolvers = {
  Query: {
    me: async (_, __, context) => {
      if (!context.user) {
        throw new Error("Not authenticated");
      }

      const user = await context.prisma.user.findUnique({
        where: { id: context.user.userId },
        include: {
          profile: true,
        },
      });

      const user_plan = await context.prisma.user_plan.findFirst({
        where: { user_id: user.id },
      });

      if (!user) {
        throw new Error("User not found");
      }

      return { ...user, user_plan };
    },

    user: async (_, { id }, context) => {
      if (!context.user) {
        throw new Error("Not authenticated");
      }

      const user = await context.prisma.user.findUnique({
        where: { id },
        include: {
          profile: true,
        },
      });

      if (!user) {
        throw new Error("User not found");
      }

      return user;
    },

    users: async (_, __, context) => {
      if (!context.user) {
        throw new Error("Not authenticated");
      }

      const users = await context.prisma.user.findMany({
        include: {
          profile: true,
        },
      });

      return users;
    },
  },

  Mutation: {
    createUser: async (_, { input }, context) => {
      const currentTime = new Date();
      try {
        return await context.prisma.$transaction(async (tx) => {
          const { email, password, first_name, last_name } = input;

          // Check if user already exists
          const existingUser = await tx.user.findUnique({
            where: { email, deleted_at: null },
          });

          if (existingUser) {
            throw new Error("User with this email already exists");
          }

          // Hash password
          const hashedPassword = await hashPassword(password);

          // Create user with profile and auth key in a transaction
          const user = await tx.user.create({
            data: {
              email,
              created_at: currentTime,
              updated_at: currentTime,
              profile: {
                create: {
                  first_name,
                  last_name,
                  created_at: currentTime,
                  updated_at: currentTime,
                },
              },
              auth_key: {
                create: {
                  hashed_password: hashedPassword,
                  created_at: currentTime,
                  updated_at: currentTime,
                },
              },
            },
            include: {
              profile: true,
            },
          });

          // Generate JWT token
          const token = generateToken(user.id);

          // Add a plan for the user
          const user_plan = await tx.user_plan.create({
            data: {
              user_id: user.id,
              plan_id: 1,
              status: "active",
              started_at: currentTime,
              ends_at: null,
              created_at: currentTime,
              updated_at: currentTime,
            },
          });

          return {
            token,
            user,
            user_plan,
          };
        });
      } catch (err) {
        return err;
      }
    },

    signIn: async (_, { input }, context) => {
      const { email, password } = input;

      // Find user with auth key
      const user = await context.prisma.user.findUnique({
        where: { email },
        include: {
          profile: true,
          auth_key: true,
        },
      });

      if (!user || !user.auth_key) {
        throw new Error("Invalid email or password");
      }

      // Verify password
      const isValidPassword = await comparePassword(
        password,
        user.auth_key.hashed_password,
      );

      if (!isValidPassword) {
        throw new Error("Invalid email or password");
      }

      // Generate JWT token
      const token = generateToken(user.id);

      return {
        token,
        user,
      };
    },
  },

  User: {
    profile: async (parent, _, context) => {
      if (parent.profile) {
        return parent.profile;
      }

      return context.prisma.profile.findUnique({
        where: { user_id: parent.id },
      });
    },
  },
};
