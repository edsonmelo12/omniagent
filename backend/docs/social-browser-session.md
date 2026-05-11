# Social Browser Session

This backend can capture social presence through an authenticated browser session instead of a paid API.
Browser sessions are saved in `_opensquad/_browser_profile/` by default so they line up with the Opensquad runbooks.

## Covered platforms

- Instagram
- LinkedIn
- X/Twitter
- YouTube
- Reddit
- Facebook
- Threads
- Pinterest
- TikTok

## Generate a session

Run:

```bash
cd backend
npm run browser:state -- --platform=instagram
```

For Instagram specifically, you can use the shortcut:

```bash
cd backend
npm run browser:instagram:state
```

That saves to `_opensquad/_browser_profile/instagram.json`.

Other shortcuts:

```bash
npm run browser:linkedin:state
npm run browser:x:state
npm run browser:twitter:state
npm run browser:youtube:state
npm run browser:reddit:state
npm run browser:facebook:state
```

`x` and `twitter` use the same stored session file: `_opensquad/_browser_profile/twitter.json`.

The script opens Chromium, lets you log in manually, and then saves the session cookies/local storage to the path you pass in.

## Verify a session

Run:

```bash
cd backend
npm run browser:verify -- --platform=instagram
```

For Instagram specifically:

```bash
cd backend
npm run browser:instagram:verify
```

The matching verify command reads `_opensquad/_browser_profile/instagram.json`.

Other verify shortcuts:

```bash
npm run browser:linkedin:verify
npm run browser:x:verify
npm run browser:twitter:verify
npm run browser:youtube:verify
npm run browser:reddit:verify
npm run browser:facebook:verify
```

## Capture via API

The same session can be used by the existing social presence endpoint:

```bash
curl -X POST "http://localhost:3001/api/v1/clients/{clientId}/social-presence" \
  -H "content-type: application/json" \
  -H "x-agency-id: {agencyId}" \
  -H "authorization: Bearer {token}" \
  -d '{
    "mode": "browser",
    "note": "Instagram authenticated capture"
  }'
```

The backend will read the Instagram profile URLs already stored in the client discovery data and capture them with the browser session.

## Recommended env vars

```env
SOCIAL_BROWSER_STORAGE_STATE_PATH=/absolute/path/to/_opensquad/_browser_profile/instagram.json
SOCIAL_BROWSER_HEADLESS=false
SOCIAL_BROWSER_TIMEOUT_MS=60000
SOCIAL_BROWSER_USER_AGENT=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36
```

## Notes

- Keep the storage state file out of git.
- Use `SOCIAL_BROWSER_HEADLESS=false` for initial debugging.
- Switch to `true` after you confirm the session works.
