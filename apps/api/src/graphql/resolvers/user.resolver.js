import { hashPassword, comparePassword, generateToken } from '../../utils/auth.js';

export const userResolvers = {
  Query: {
    me: async (_, __, context) => {
      if (!context.user) {
        throw new Error('Not authenticated');
      }

      const user = await context.prisma.user.findUnique({
        where: { id: context.user.userId },
        include: {
          profile: true,
        },
      });

      if (!user) {
        throw new Error('User not found');
      }

      return user;
    },

    user: async (_, { id }, context) => {
      if (!context.user) {
        throw new Error('Not authenticated');
      }

      const user = await context.prisma.user.findUnique({
        where: { id },
        include: {
          profile: true,
        },
      });

      if (!user) {
        throw new Error('User not found');
      }

      return user;
    },
  },

  Mutation: {
    createUser: async (_, { input }, context) => {
      const { email, password, first_name, last_name } = input;

      // Check if user already exists
      const existingUser = await context.prisma.user.findUnique({
        where: { email },
      });

      if (existingUser) {
        throw new Error('User with this email already exists');
      }

      // Hash password
      const hashedPassword = await hashPassword(password);

      // Create user with profile and auth key in a transaction
      const user = await context.prisma.user.create({
        data: {
          email,
          profile: {
            create: {
              first_name,
              last_name,
            },
          },
          auth_key: {
            create: {
              hashed_password: hashedPassword,
            },
          },
        },
        include: {
          profile: true,
        },
      });

      // Generate JWT token
      const token = generateToken(user.id);

      return {
        token,
        user,
      };
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
        throw new Error('Invalid email or password');
      }

      // Verify password
      const isValidPassword = await comparePassword(
        password,
        user.auth_key.hashed_password
      );

      if (!isValidPassword) {
        throw new Error('Invalid email or password');
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
