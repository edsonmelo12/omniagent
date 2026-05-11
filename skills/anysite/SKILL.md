---
name: anysite
description: >
  Multi-platform intelligence for market research, competitor analysis,
  trend detection, audience analysis, and person intelligence using the
  AnySite MCP server.
description_pt-BR: >
  Inteligencia multiplataforma para pesquisa de mercado, analise de
  concorrencia, deteccao de tendencias, analise de audiencia e analise de
  perfis usando o servidor MCP da AnySite.
type: mcp
version: "1.0.0"
mcp:
  server_name: anysite
  command: npx
  args: ["-y", "@anysite/mcp"]
env:
  - ANYSITE_API_KEY
  - ANYSITE_ACCOUNT_ID
categories: [research, intelligence, social-listening, market-research]
---

# AnySite MCP

## When to use

Use AnySite when you need structured external research for:

- market and category analysis;
- competitor intelligence;
- trend and momentum tracking;
- audience analysis;
- person, founder, and executive research;
- social and web signal collection.

## Operating principles

1. Start with the smallest research scope that answers the question.
2. Always discover available endpoints before calling data tools.
3. Use cached results and pagination instead of repeating expensive calls.
4. Separate raw observations from inference and recommendations.
5. Prefer evidence from multiple sources when the decision depends on confidence.

## Standard workflow

### 1. Discover the tool surface

Call `discover(source, category)` first when you are not sure which endpoint to use.

### 2. Fetch the smallest useful dataset

Use `execute(source, category, endpoint, params)` to collect the first page of results.

### 3. Expand only when needed

If the response includes `next_offset`, use `get_page(cache_key, offset, limit)` to continue.

### 4. Analyze without re-fetching

Use `query_cache(cache_key, conditions, sort_by, aggregate, group_by)` to filter and summarize cached data.

### 5. Export the evidence

Use `export_data(cache_key, format)` when the analysis needs a reusable CSV, JSON, or JSONL output.

## Research map

- `anysite-market-research` style work:
  - sector overview
  - startup ecosystem signals
  - public company and market context
- `anysite-competitor-analyzer` style work:
  - homepage messaging
  - pricing and packaging
  - leadership and hiring signals
  - social proof and positioning
- `anysite-trend-analysis` style work:
  - emergent topics
  - hashtag momentum
  - cross-platform pattern detection
- `anysite-person-analyzer` style work:
  - founder profiles
  - executive activity
  - investor and partner signals

## Output expectations

When used inside a squad, the output should always answer:

- What was observed?
- What does it imply?
- What should we do next?

## Notes

- This skill depends on the AnySite MCP server being configured in the
  project MCP settings.
- Required environment variables:
  - `ANYSITE_API_KEY`
  - `ANYSITE_ACCOUNT_ID`
