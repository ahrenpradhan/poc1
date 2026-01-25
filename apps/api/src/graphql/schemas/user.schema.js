export const userSchema = `
  type User {
    id: Int!
    email: String!
    created_at: String!
    updated_at: String!
    profile: Profile
    user_plan: UserPlan
  }

  type Profile {
    id: Int!
    user_id: Int!
    first_name: String!
    last_name: String
    created_at: String!
    updated_at: String!
  }

  type Plan {
    id: Int!
    title: String!
    description: String
    price: Int!
    currency: String!
    interval: String!
    is_active: Boolean!
    created_at: String!
    updated_at: String!
  }

  type UserPlan {
    id: Int!
    user_id: Int!
    plan_id: Int!
    status: String!
    started_at: String!
    ends_at: String
    cancelled_at: String
    created_at: String!
    updated_at: String!
    plan: Plan
  }

  type AuthPayload {
    token: String!
    user: User!
  }

  input CreateUserInput {
    email: String!
    password: String!
    first_name: String!
    last_name: String
  }

  input SignInInput {
    email: String!
    password: String!
  }

  type Query {
    me: User
    user(id: Int!): User
    users: [User!]!
  }

  type Mutation {
    createUser(input: CreateUserInput!): AuthPayload!
    signIn(input: SignInInput!): AuthPayload!
  }
`;
