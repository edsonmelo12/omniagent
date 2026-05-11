import { z } from "zod";

export const agencyCreateSchema = z.object({
  name: z.string().min(1),
  slug: z.string().min(1),
  plan: z.string().min(1).default("starter"),
});
