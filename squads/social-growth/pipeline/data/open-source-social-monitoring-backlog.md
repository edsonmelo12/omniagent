# Open Source Social Monitoring Backlog

## Purpose

Build a low-cost social monitoring layer for the `social-growth` squad without relying on paid third-party APIs.

## Phase 1 - Foundation

1. Create a browser profile strategy for authenticated sessions.
2. Add Brave Search as the public discovery layer.
3. Define a normalized social signal schema.
4. Store raw observations and summaries separately.
5. Create a manual runbook for data refresh and validation.

## Phase 2 - Collection Adapters

1. Build a web discovery adapter for competitor websites.
2. Build a browser-based collection adapter for Instagram.
3. Build a browser-based collection adapter for LinkedIn.
4. Build a browser-based collection adapter for X/Twitter.
5. Build a browser-based collection adapter for YouTube.
6. Build a browser-based collection adapter for Reddit when needed.

## Phase 3 - Research Outputs

1. Generate competitor snapshots.
2. Generate platform-by-platform signal summaries.
3. Generate a comparative matrix for the `Researcher`.
4. Generate a decision brief for the `Strategist`.
5. Generate an editable intake note for client records.

## Phase 4 - Reliability

1. Add timestamped runs.
2. Add confidence flags.
3. Add duplicate suppression.
4. Add error notes when a platform changes layout or access rules.
5. Add a human review checkpoint before downstream use.

## Priority order

1. Brave discovery
2. Browser-authenticated collection
3. Research normalization
4. Researcher synthesis
5. Strategist decisioning

## Non-goals for now

- no paid social intelligence API
- no private data extraction
- no direct bypass of platform restrictions
- no fully autonomous publishing layer

## Success criteria

- the squad can collect public signals from at least one target per platform
- the research output is reusable by strategy
- the system works with local sessions and open web discovery
