import { userResolvers } from './user.resolver.js';

export const resolvers = {
  Query: {
    ...userResolvers.Query,
  },
  Mutation: {
    ...userResolvers.Mutation,
  },
  User: {
    ...userResolvers.User,
  },
};
