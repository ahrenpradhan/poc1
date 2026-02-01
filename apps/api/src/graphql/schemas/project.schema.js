export const projectSchema = `
  type Project {
    id: Int!
    owner_id: Int!
    title: String!
    description: String
    is_archived: Boolean!
    created_at: String!
    updated_at: String!
    chats: [Chat!]!
  }

  type Chat {
    id: Int!
    project_id: Int
    owner_id: Int!
    public_id: String!
    title: String
    created_at: String!
    updated_at: String!
    messages: [Message!]!
    project: Project
  }

  enum MessageRole {
    system
    user
    assistant
  }

  type Message {
    id: Int!
    chat_id: Int!
    sequence: Int!
    role: MessageRole!
    content: String!
    content_type: String
    adapter: String
    network_method: String
    created_at: String!
  }

  input GenerateAIResponseInput {
    chat_id: Int!
    adapter: String
  }

  type PageInfo {
    hasNextPage: Boolean!
    hasPreviousPage: Boolean!
    startCursor: String
    endCursor: String
  }

  type MessageEdge {
    cursor: String!
    node: Message!
  }

  type MessageConnection {
    edges: [MessageEdge!]!
    pageInfo: PageInfo!
    totalCount: Int!
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
    project_id: Int
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

  input CreateNewChatByMessageInput {
    project_id: Int
    title: String
    role: MessageRole!
    content: String!
  }

  extend type Query {
    projects: [Project!]!
    project(id: Int!): Project
    chat(id: Int!): Chat
    chatByPublicId(public_id: String!): Chat
    chats: [Chat!]!
    chatMessages(chat_id: Int!): [Message!]!
    chatMessagesPaginated(chat_id: Int!, first: Int, after: String, last: Int, before: String): MessageConnection!
    chatMessagesByUserCount(chat_id: Int!, userMessageCount: Int, beforeSequence: Int): MessageConnection!
    chatsByOwnerId: [Chat!]!
  }

  extend type Mutation {
    createProject(input: CreateProjectInput!): Project!
    updateProject(id: Int!, input: UpdateProjectInput!): Project!
    deleteProject(id: Int!): Boolean!

    createChat(input: CreateChatInput!): Chat!
    updateChat(id: Int!, input: UpdateChatInput!): Chat!
    deleteChat(id: Int!): Boolean!

    createMessage(input: CreateMessageInput!): Message!
    generateAIResponse(input: GenerateAIResponseInput!): Message!
    createNewChatByMessage(input: CreateNewChatByMessageInput!): Chat!
    deleteMessage(id: Int!): Boolean!
  }
`;
