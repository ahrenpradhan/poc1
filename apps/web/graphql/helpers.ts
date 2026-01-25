import { graphqlClient } from "./client";
import { ME_QUERY } from "./queries";

/**
 * Fetches the complete user data including profile and user_plan
 * using the 'me' GraphQL query with authentication token
 */
export async function fetchUserWithPlan(token: string) {
  try {
    const { data } = await graphqlClient.query({
      query: ME_QUERY,
      context: {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
      fetchPolicy: "network-only", // Always fetch fresh data
    });

    return data?.me || null;
  } catch (error) {
    console.error("Error fetching user with plan:", error);
    return null;
  }
}
