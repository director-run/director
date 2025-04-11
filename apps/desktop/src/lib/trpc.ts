"use client";

import { AppRouter } from "@director/backend/src/http/routers/trpc";
import { createTRPCReact } from "@trpc/react-query";

export const trpc = createTRPCReact<AppRouter>();
