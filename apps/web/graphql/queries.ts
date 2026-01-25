import { gql } from "@apollo/client";

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
