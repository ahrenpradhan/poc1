import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { graphqlClient } from "@/graphql/client";
import { SIGN_IN_MUTATION, CREATE_USER_MUTATION } from "@/graphql/queries";

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
          const { data } = await graphqlClient.mutate({
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
              first_name: data.signIn.user.profile?.first_name || "",
              last_name: data.signIn.user.profile?.last_name || "",
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
          const { data } = await graphqlClient.mutate({
            mutation: CREATE_USER_MUTATION,
            variables: {
              email: credentials.email,
              password: credentials.password,
              first_name: credentials.firstName,
              last_name: credentials.lastName,
            },
          });

          if (data?.createUser?.token && data?.createUser?.user) {
            return {
              id: data.createUser.user.id,
              email: data.createUser.user.email,
              first_name: data.createUser.user.profile?.first_name || "",
              last_name: data.createUser.user.profile?.last_name || "",
              profile: data.createUser.user.profile,
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
        token.first_name = user.first_name;
        token.last_name = user.last_name;
        token.profile = user.profile;
        token.backendToken = user.backendToken;
      }
      return token;
    },
    async session({ session, token }) {
      // console.log(">session>>", session, token);
      if (token) {
        session.user = {
          id: token.id as string,
          email: token.email as string,
          first_name: token.first_name || "",
          last_name: token.last_name || "",
          profile: token.profile,
        };
        session.backendToken = token.backendToken;
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
