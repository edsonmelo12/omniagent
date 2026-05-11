# Open Source Social Collection Flow

## Goal

Collect competitive signals from the web and social platforms without using a paid API.
The flow should rely on public web search, authenticated browser sessions, and local normalization.

## Inputs

- client record
- target brand or competitor list
- platform list
- research question
- browser profile with an authenticated session, when needed

## Recommended stack

1. **Brave Search API**
   - discover public pages, posts, profiles, and news
   - find official accounts and competitor websites

2. **Authenticated browser automation**
   - open social profiles that are visible to the logged-in session
   - extract visible posts, bios, follower counts, engagement signals, and pinned content

3. **Local normalization**
   - standardize all observations into one research record
   - keep raw source, timestamp, platform, and confidence

4. **Squad synthesis**
   - `Researcher` converts observations into facts, inference, and recommendations
   - `Strategist` turns the findings into editorial and growth decisions
   - `Intake` stores what was observed and what still needs validation

## Operating steps

1. Define the question in one sentence.
2. Search the web for official sites and public profiles.
3. Open the target profile in the authenticated browser session if the platform requires login.
4. Capture only what is visibly available to the session.
5. Normalize every field into a single record:
   - platform
   - account URL
   - observed metric
   - source type
   - timestamp
   - confidence
6. Cross-check important signals with a second source when possible.
7. Write the final summary in the squad's research artifact.

## What to collect

- profile bio and positioning
- follower / subscriber / connection counts when visible
- recent post themes
- content cadence
- engagement patterns
- recurring CTAs
- evidence of offers, services, or campaigns
- social proof and proof points

## What not to do

- do not use private data that the session cannot legitimately access
- do not store secrets in markdown files
- do not copy raw pages without normalization
- do not mix observation and inference in the same line

## Output shape

```md
## Executive Summary
## Observed Signals
## Competitive Implications
## Risks or Gaps
## Next Action
```

## Best fit

This flow is best for:

- social media competitor analysis
- brand monitoring
- content benchmarking
- market signal collection
- audience and positioning research
