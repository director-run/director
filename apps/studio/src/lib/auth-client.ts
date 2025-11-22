import { createAuthClient } from "better-auth/react";
import { GATEWAY_URL } from "../config";

export const authClient = createAuthClient({
  baseURL: GATEWAY_URL,
  fetchOptions: {
    credentials: "include",
  },
});

export const { signIn, signUp, signOut, useSession } = authClient;
