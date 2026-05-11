import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const bootstrapSchema = z.object({
  agency: z.object({
    name: z.string().min(1),
    slug: z.string().min(1),
  }),
  user: z.object({
    name: z.string().min(1),
    email: z.string().email(),
    password: z.string().min(8),
  }),
});
