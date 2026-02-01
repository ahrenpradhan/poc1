// GraphQL Response Types

export interface Chat {
  id: number;
  public_id: string;
  title: string | null;
  created_at: string;
  updated_at: string;
}

export interface Message {
  id: number;
  chat_id: number;
  sequence: number;
  role: "user" | "assistant" | "system";
  content: string;
  content_type?: string;
  adapter?: string;
  network_method?: string;
  created_at: string;
}

export interface MessageEdge {
  cursor: string;
  node: Message;
}

export interface PageInfo {
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  startCursor: string | null;
  endCursor: string | null;
}

export interface MessageConnection {
  edges: MessageEdge[];
  pageInfo: PageInfo;
  totalCount: number;
}

// Query Response Types
export interface GetChatByPublicIdResponse {
  chatByPublicId: Chat | null;
}

export interface GetUserChatsResponse {
  chatsByOwnerId: Chat[];
}

export interface GetChatMessagesByUserCountResponse {
  chatMessagesByUserCount: MessageConnection;
}

// Mutation Response Types
export interface CreateNewChatByMessageResponse {
  createNewChatByMessage: Chat & { messages: Message[] };
}

export interface CreateMessageResponse {
  createMessage: Message;
}

export interface GenerateAIResponseResponse {
  generateAIResponse: Message;
}

export interface DeleteChatResponse {
  deleteChat: boolean;
}
