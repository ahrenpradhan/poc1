export const projectSchema = `
  type Project {
    id: Int!
    user_id: Int!
    title: String!
    description: String
    is_archived: Boolean!
    created_at: String!
    updated_at: String!
    chats: [Chat!]!
  }

  type Chat {
    id: Int!
    project_id: Int!
    title: String
    created_at: String!
    updated_at: String!
    messages: [Message!]!
  }

  enum MessageRole {
    system
    user
    assistant
  }

  type Message {
    id: Int!
    chat_id: Int!
    role: MessageRole!
    content: String!
    created_at: String!
  }

  input CreateProjectInput {
    title: String!
    description: String
  }

  input UpdateProjectInput {
    title: String
    description: String
    is_archived: Boolean
  }

  input CreateChatInput {
    project_id: Int!
    title: String
  }

  input UpdateChatInput {
    title: String
  }

  input CreateMessageInput {
    chat_id: Int!
    role: MessageRole!
    content: String!
  }

  type Query {
    projects: [Project!]!
    project(id: Int!): Project
    chat(id: Int!): Chat
    chatMessages(chat_id: Int!): [Message!]!
  }

  type Mutation {
    createProject(input: CreateProjectInput!): Project!
    updateProject(id: Int!, input: UpdateProjectInput!): Project!
    deleteProject(id: Int!): Boolean!

    createChat(input: CreateChatInput!): Chat!
    updateChat(id: Int!, input: UpdateChatInput!): Chat!
    deleteChat(id: Int!): Boolean!

    createMessage(input: CreateMessageInput!): Message!
    deleteMessage(id: Int!): Boolean!
  }
`;
