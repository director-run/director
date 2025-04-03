import { createTRPCReact } from "@trpc/react-query";
import type { AppRouter } from "../../../../backend/src/http/routers/trpc";

/**
 * A set of typesafe hooks for consuming your API.
 */
export const trpc = createTRPCReact<AppRouter>();
