import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().int().positive().default(3001),
  DATABASE_URL: z.string().min(1),
  LOG_LEVEL: z.string().default("info"),
  BRAVE_SEARCH_API_KEY: z.string().min(1).optional(),
  BRAVE_SEARCH_COUNTRY: z.string().trim().min(2).max(2).default("BR"),
  BRAVE_SEARCH_LANG: z.string().trim().min(2).max(5).default("pt"),
  BRAVE_SEARCH_COUNT: z.coerce.number().int().min(1).max(20).default(5),
  META_GRAPH_ACCESS_TOKEN: z.string().min(1).optional(),
  META_GRAPH_API_VERSION: z.string().trim().min(2).default("v20.0"),
  META_INSTAGRAM_BUSINESS_ACCOUNT_ID: z.string().min(1).optional(),
  SOCIAL_PRESENCE_YOUTUBE_API_KEY: z.string().min(1).optional(),
  PUBLISHING_SECRET_ENV_PREFIX: z.string().trim().min(1).default("OMNI_SECRET__"),
  PUBLISHING_SECRET_OVERRIDES_JSON: z.string().min(1).optional(),
  SOCIAL_BROWSER_STORAGE_STATE_PATH: z.string().min(1).optional(),
  SOCIAL_BROWSER_HEADLESS: z.string().trim().optional(),
  SOCIAL_BROWSER_TIMEOUT_MS: z.coerce.number().int().min(5000).max(120000).default(30000),
  SOCIAL_BROWSER_USER_AGENT: z.string().min(1).optional(),
});

export const env = envSchema.parse(process.env);
