import { z } from "zod";

export const requiredStringSchema = z.string().trim().min(1, "Required");

export const optionalStringSchema = z.string().trim().nullish();
