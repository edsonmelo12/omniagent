import { z } from "zod";

export const approvalCreateSchema = z.object({
  artifactType: z.enum(["client_record", "market_research", "proposal", "content_plan", "content_production_package", "schedule"]),
  artifactId: z.string().uuid(),
  status: z.enum(["pending", "approved", "rejected"]).default("pending"),
  notes: z.string().optional(),
});
