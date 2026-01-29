import { gql } from "@apollo/client";

// Chat Queries
export const GET_CHAT_BY_PUBLIC_ID = gql`
  query GetChatByPublicId($public_id: String!) {
    chatByPublicId(public_id: $public_id) {
      id
      public_id
      title
      created_at
      updated_at
    }
  }
`;

export const GET_CHAT_MESSAGES_PAGINATED = gql`
  query GetChatMessagesPaginated(
    $chat_id: Int!
    $first: Int
    $after: String
    $last: Int
    $before: String
  ) {
    chatMessagesPaginated(
      chat_id: $chat_id
      first: $first
      after: $after
      last: $last
      before: $before
    ) {
      edges {
        cursor
        node {
          id
          chat_id
          sequence
          role
          content
          created_at
        }
      }
      pageInfo {
        hasNextPage
        hasPreviousPage
        startCursor
        endCursor
      }
      totalCount
    }
  }
`;

export const GET_USER_CHATS = gql`
  query GetUserChats {
    chatsByOwnerId {
      id
      public_id
      title
      created_at
      updated_at
    }
  }
`;

// Chat Mutations
export const CREATE_NEW_CHAT_BY_MESSAGE = gql`
  mutation CreateNewChatByMessage($input: CreateNewChatByMessageInput!) {
    createNewChatByMessage(input: $input) {
      id
      public_id
      title
      created_at
      messages {
        id
        sequence
        role
        content
        created_at
      }
    }
  }
`;

export const CREATE_MESSAGE = gql`
  mutation CreateMessage($input: CreateMessageInput!) {
    createMessage(input: $input) {
      id
      chat_id
      sequence
      role
      content
      created_at
    }
  }
`;

// User Queries
export const ME_QUERY = gql`
  query Me {
    me {
      id
      email
      created_at
      updated_at
      profile {
        id
        user_id
        first_name
        last_name
        created_at
        updated_at
      }
      user_plan {
        id
        user_id
        plan_id
        status
        started_at
        ends_at
        cancelled_at
        created_at
        updated_at
        plan {
          id
          title
          description
          price
          currency
          interval
          is_active
          created_at
          updated_at
        }
      }
    }
  }
`;

export const SIGN_IN_MUTATION = gql`
  mutation SignIn($email: String!, $password: String!) {
    signIn(input: { email: $email, password: $password }) {
      token
      user {
        id
        email
        created_at
        updated_at
        profile {
          id
          user_id
          first_name
          last_name
          created_at
          updated_at
        }
      }
    }
  }
`;

export const CREATE_USER_MUTATION = gql`
  mutation CreateUser(
    $email: String!
    $password: String!
    $first_name: String!
    $last_name: String!
  ) {
    createUser(
      input: {
        email: $email
        password: $password
        first_name: $first_name
        last_name: $last_name
      }
    ) {
      token
      user {
        id
        email
        created_at
        updated_at
        profile {
          id
          user_id
          first_name
          last_name
          created_at
          updated_at
        }
      }
    }
  }
`;
