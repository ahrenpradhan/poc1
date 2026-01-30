import { userResolvers } from "./user.resolver.js";
import { projectResolvers } from "./project.resolver.js";

export const resolvers = {
  Query: {
    ...userResolvers.Query,
    ...projectResolvers.Query,
  },
  Mutation: {
    ...userResolvers.Mutation,
    ...projectResolvers.Mutation,
  },
  User: {
    ...userResolvers.User,
  },
  UserPlan: {
    ...userResolvers.UserPlan,
  },
  Project: {
    ...projectResolvers.Project,
  },
  Chat: {
    ...projectResolvers.Chat,
  },
  Message: {
    ...projectResolvers.Message,
  },
};
