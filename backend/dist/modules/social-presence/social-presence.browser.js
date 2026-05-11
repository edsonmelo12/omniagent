import { chromium } from "playwright";
import { env } from "../../app/env.js";
const DEFAULT_USER_AGENT = "Mozilla/5.0 SocialGrowth/1.0";
const parseHeadlessFlag = (value) => {
    if (!value) {
        return true;
    }
    const normalized = value.trim().toLowerCase();
    return !["false", "0", "no", "off"].includes(normalized);
};
export const fetchProfileHtmlWithBrowser = async (profileUrl, input) => {
    const timeoutMs = input?.timeoutMs ?? env.SOCIAL_BROWSER_TIMEOUT_MS;
    const headless = input?.headless ?? parseHeadlessFlag(env.SOCIAL_BROWSER_HEADLESS);
    const userAgent = input?.userAgent ?? env.SOCIAL_BROWSER_USER_AGENT ?? DEFAULT_USER_AGENT;
    const storageStatePath = input?.storageStatePath ?? env.SOCIAL_BROWSER_STORAGE_STATE_PATH;
    const browser = await chromium.launch({ headless });
    const context = await browser.newContext({
        storageState: storageStatePath || undefined,
        userAgent,
        viewport: { width: 1440, height: 1600 },
    });
    const page = await context.newPage();
    page.setDefaultTimeout(timeoutMs);
    page.setDefaultNavigationTimeout(timeoutMs);
    try {
        await page.goto(profileUrl, { waitUntil: "domcontentloaded", timeout: timeoutMs });
        try {
            await page.waitForLoadState("networkidle", { timeout: Math.min(timeoutMs, 10_000) });
        }
        catch {
            // Some social profile pages never fully settle. That is acceptable.
        }
        return {
            html: await page.content(),
            finalUrl: page.url(),
            title: await page.title().catch(() => ""),
        };
    }
    finally {
        await page.close().catch(() => undefined);
        await context.close().catch(() => undefined);
        await browser.close().catch(() => undefined);
    }
};
