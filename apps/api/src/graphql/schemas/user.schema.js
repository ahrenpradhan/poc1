export const userSchema = `
  type User {
    id: Int!
    email: String!
    created_at: String!
    updated_at: String!
    profile: Profile
  }

  type Profile {
    id: Int!
    user_id: Int!
    first_name: String!
    last_name: String
    created_at: String!
    updated_at: String!
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
