import fs from "node:fs/promises";
import path from "node:path";
import { chromium } from "playwright";

type Mode = "save" | "verify";
type Platform =
  | "instagram"
  | "linkedin"
  | "x"
  | "twitter"
  | "youtube"
  | "reddit"
  | "facebook"
  | "threads"
  | "pinterest"
  | "tiktok";

type PlatformConfig = {
  platform: Platform;
  url: string;
  storageStatePath: string;
};

const DEFAULT_URL = "https://www.instagram.com/";
const DEFAULT_TIMEOUT_MS = 60_000;
const DEFAULT_USER_AGENT =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36";
const BROWSER_PROFILE_DIR = path.resolve(process.cwd(), "..", "_opensquad", "_browser_profile");

const PLATFORM_CONFIG: Record<Exclude<Platform, "twitter">, { url: string; storageFile: string }> = {
  instagram: { url: "https://www.instagram.com/", storageFile: "instagram.json" },
  linkedin: { url: "https://www.linkedin.com/", storageFile: "linkedin.json" },
  x: { url: "https://x.com/", storageFile: "twitter.json" },
  youtube: { url: "https://www.youtube.com/", storageFile: "youtube.json" },
  reddit: { url: "https://www.reddit.com/", storageFile: "reddit.json" },
  facebook: { url: "https://www.facebook.com/", storageFile: "facebook.json" },
  threads: { url: "https://www.threads.net/", storageFile: "threads.json" },
  pinterest: { url: "https://www.pinterest.com/", storageFile: "pinterest.json" },
  tiktok: { url: "https://www.tiktok.com/", storageFile: "tiktok.json" },
};

const parseArgs = () => {
  const args = new Map<string, string>();
  const raw = process.argv.slice(2);

  for (let index = 0; index < raw.length; index += 1) {
    const token = raw[index];
    if (!token?.startsWith("--")) continue;

    const [key, inlineValue] = token.split("=", 2);
    const value = inlineValue ?? raw[index + 1];

    if (value && !value.startsWith("--") && inlineValue === undefined) {
      index += 1;
      args.set(key.slice(2), value);
      continue;
    }

    if (inlineValue !== undefined) {
      args.set(key.slice(2), inlineValue);
    } else {
      args.set(key.slice(2), "true");
    }
  }

  const mode = (args.get("mode") ?? "save") as Mode;
  if (mode !== "save" && mode !== "verify") {
    throw new Error(`Unsupported mode: ${mode}`);
  }

  const platformInput = (args.get("platform") ?? "instagram").trim().toLowerCase();
  const normalizedPlatform = (platformInput === "twitter" ? "x" : platformInput) as Platform;

  const platformConfig =
    normalizedPlatform in PLATFORM_CONFIG
      ? PLATFORM_CONFIG[normalizedPlatform as Exclude<Platform, "twitter">]
      : null;

  if (!platformConfig) {
    throw new Error(`Unsupported platform: ${platformInput}`);
  }

  const storageStatePath =
    args.get("storage-state") ??
    path.join(BROWSER_PROFILE_DIR, platformConfig.storageFile);

  return {
    mode,
    platform: normalizedPlatform,
    url: args.get("url") ?? platformConfig.url ?? DEFAULT_URL,
    storageStatePath: path.resolve(storageStatePath),
    timeoutMs: Number(args.get("timeout-ms") ?? DEFAULT_TIMEOUT_MS),
    headless: args.get("headless") ? !["false", "0", "no", "off"].includes(args.get("headless")!.toLowerCase()) : false,
    userAgent: args.get("user-agent") ?? DEFAULT_USER_AGENT,
  };
};

const waitForEnter = async () => {
  process.stdout.write("\nPress Enter after finishing the login flow...");

  await new Promise<void>((resolve) => {
    process.stdin.setEncoding("utf8");
    process.stdin.resume();
    process.stdin.once("data", () => resolve());
  });
};

const ensureDirectory = async (filePath: string) => {
  await fs.mkdir(path.dirname(filePath), { recursive: true });
};

const run = async () => {
  const config = parseArgs();
  const browser = await chromium.launch({ headless: config.headless });
  const context = await browser.newContext({
    userAgent: config.userAgent,
    storageState: config.mode === "verify" ? config.storageStatePath : undefined,
    viewport: { width: 1440, height: 1600 },
  });
  const page = await context.newPage();
  page.setDefaultTimeout(config.timeoutMs);
  page.setDefaultNavigationTimeout(config.timeoutMs);

  try {
    await page.goto(config.url, { waitUntil: "domcontentloaded", timeout: config.timeoutMs });

    if (config.mode === "save") {
      console.log(`Opened ${config.platform} at ${config.url}`);
      console.log(`Storage state will be saved to ${config.storageStatePath}`);
      await waitForEnter();
      await ensureDirectory(config.storageStatePath);
      await context.storageState({ path: config.storageStatePath });
      console.log(`Saved storage state to ${config.storageStatePath}`);
    } else {
      await page.waitForLoadState("networkidle", { timeout: Math.min(config.timeoutMs, 10_000) }).catch(() => undefined);
      const title = await page.title().catch(() => "");
      const currentUrl = page.url();
      const html = await page.content();

      console.log(`Verified ${config.platform} session against ${currentUrl}`);
      console.log(`Title: ${title || "(empty)"}`);
      console.log(`HTML size: ${html.length} chars`);
      console.log(`Storage state loaded from ${config.storageStatePath}`);
    }
  } finally {
    await page.close().catch(() => undefined);
    await context.close().catch(() => undefined);
    await browser.close().catch(() => undefined);
  }
};

run().catch((error) => {
  console.error("Browser session flow failed:");
  console.error(error instanceof Error ? error.stack ?? error.message : String(error));
  process.exitCode = 1;
});
