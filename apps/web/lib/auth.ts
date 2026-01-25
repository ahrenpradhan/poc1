import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { ApolloClient, InMemoryCache, gql, HttpLink } from "@apollo/client";

const client = new ApolloClient({
  link: new HttpLink({
    uri: process.env.NEXT_PUBLIC_GRAPHQL_URL || "http://localhost:3000/graphql",
  }),
  cache: new InMemoryCache(),
});

const SIGN_IN_MUTATION = gql`
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

const CREATE_USER_MUTATION = gql`
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

export const authOptions: NextAuthOptions = {
  debug: true,
  providers: [
    CredentialsProvider({
      id: "credentials",
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email and password required");
        }

        try {
          const { data } = await client.mutate({
            mutation: SIGN_IN_MUTATION,
            variables: {
              email: credentials.email,
              password: credentials.password,
            },
          });
          if (data?.signIn?.token && data?.signIn?.user) {
            return {
              id: data.signIn.user.id,
              email: data.signIn.user.email,
              profile: data.signIn.user.profile,
              backendToken: data.signIn.token,
            };
          }

          return null;
        } catch (error) {
          console.error("Sign in error:", error);
          throw new Error("Invalid credentials");
        }
      },
    }),
    CredentialsProvider({
      id: "signup",
      name: "Sign Up",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        firstName: { label: "First Name", type: "text" },
        lastName: { label: "Last Name", type: "text" },
      },
      async authorize(credentials) {
        if (
          !credentials?.email ||
          !credentials?.password ||
          !credentials?.firstName ||
          !credentials?.lastName
        ) {
          throw new Error("All fields required");
        }

        try {
          const { data } = await client.mutate({
            mutation: CREATE_USER_MUTATION,
            variables: {
              email: credentials.email,
              password: credentials.password,
              first_name: credentials.firstName,
              last_name: credentials.lastName,
            },
          });

          if (data?.createUser?.token) {
            return {
              id: credentials.id,
              email: credentials.email,
              backendToken: data.createUser.token,
            };
          }

          return null;
        } catch (error) {
          console.error("Sign up error:", error);
          throw new Error("Sign up failed");
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      console.log("jwt>>", token, user);
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.profile = user.profile;
        token.backendToken = (user as any).backendToken;
      }
      return token;
    },
    async session({ session, token }) {
      // console.log(">session>>", session, token);
      if (token) {
        session.user = {
          id: token.id as string,
          email: token.email as string,
          profile: token.profile as string,
        };
        (session as any).backendToken = token.backendToken;
      }
      return session;
    },
  },
  pages: {
    signIn: "/",
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
};
