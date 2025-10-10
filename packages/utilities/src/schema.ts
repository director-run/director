import { z } from "zod";

export const requiredStringSchema = z.string().trim().min(1, "Required");
export const optionalStringSchema = z.string().trim().optional();
export const slugStringSchema = z
  .string()
  .trim()
  .min(1, "Required")
  .regex(
    /^[a-z0-9._-]+$/,
    "Only lowercase ASCII letters, digits, and characters ., -, _ are allowed",
  );
