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

      const user = await context.prisma.user.findFirst({
        where: {
          id: context.user.userId,
          deleted_at: null,
        },
        include: {
          profile: {
            where: {
              deleted_at: null,
            },
          },
        },
      });

      if (!user) {
        throw new Error("User not found");
      }

      // Fetch user_plan with plan details
      const user_plan = await context.prisma.user_plan.findFirst({
        where: {
          user_id: user.id,
          deleted_at: null,
        },
        include: {
          plan: {
            where: {
              deleted_at: null,
            },
          },
        },
        orderBy: {
          created_at: "desc",
        },
      });

      return { ...user, user_plan };
    },

    user: async (_, { id }, context) => {
      if (!context.user) {
        throw new Error("Not authenticated");
      }

      const user = await context.prisma.user.findFirst({
        where: {
          id,
          deleted_at: null,
        },
        include: {
          profile: {
            where: {
              deleted_at: null,
            },
          },
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
        where: {
          deleted_at: null,
        },
        include: {
          profile: {
            where: {
              deleted_at: null,
            },
          },
        },
      });

      return users;
    },
  },

  Mutation: {
    createUser: async (_, { input }, context) => {
      const currentTime = new Date();

      return await context.prisma.$transaction(async (tx) => {
        const { email, password, first_name, last_name } = input;

        // Check if user already exists (including soft-deleted users)
        const existingUser = await tx.user.findUnique({
          where: { email },
        });

        if (existingUser && !existingUser.deleted_at) {
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

        // Find the free plan (price = 0)
        const freePlan = await tx.plan.findFirst({
          where: {
            price: 0,
            is_active: true,
            deleted_at: null,
          },
        });

        // Add the free plan for the user if it exists
        if (freePlan) {
          await tx.user_plan.create({
            data: {
              user_id: user.id,
              plan_id: freePlan.id,
              status: "active",
              started_at: currentTime,
              ends_at: null,
              created_at: currentTime,
              updated_at: currentTime,
            },
          });
        }

        return {
          token,
          user,
        };
      });
    },

    signIn: async (_, { input }, context) => {
      const { email, password } = input;

      // Find user with auth key
      const user = await context.prisma.user.findFirst({
        where: {
          email,
          deleted_at: null,
        },
        include: {
          profile: {
            where: {
              deleted_at: null,
            },
          },
          auth_key: {
            where: {
              deleted_at: null,
            },
          },
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

      return context.prisma.profile.findFirst({
        where: {
          user_id: parent.id,
          deleted_at: null,
        },
      });
    },

    user_plan: async (parent, _, context) => {
      // Only return user_plan if it's already loaded (from 'me' query)
      if (parent.user_plan !== undefined) {
        return parent.user_plan;
      }

      // Don't lazy-load user_plan for other queries
      return null;
    },
  },

  UserPlan: {
    plan: async (parent, _, context) => {
      if (parent.plan) {
        return parent.plan;
      }

      return context.prisma.plan.findFirst({
        where: {
          id: parent.plan_id,
          deleted_at: null,
        },
      });
    },
  },
};
