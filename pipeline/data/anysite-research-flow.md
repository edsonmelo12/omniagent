# AnySite Research Flow

This is the shared research workflow for the `social-growth` squad when
external signals are needed.

## Goal

Turn open-ended business questions into evidence-backed research inputs for
strategy, content planning, and validation.

## Decision tree

1. If the question is about the category or market, use market research.
2. If the question is about a specific rival or positioning, use competitor analysis.
3. If the question is about timing, topics, or momentum, use trend analysis.
4. If the question is about a person, founder, investor, or executive, use person analysis.
5. If the question is about the client's own sources, start with intake and website context first.

## Standard sequence

1. Define the research question in one sentence.
2. Choose the smallest AnySite research mode that can answer it.
3. Call `discover(source, category)` if the endpoint is not already known.
4. Fetch the first useful page with `execute(...)`.
5. Paginate only if the first page is not enough.
6. Use `query_cache(...)` to filter, compare, or aggregate the evidence.
7. Summarize the findings as:
   - facts;
   - inferred meaning;
   - business recommendation.
8. Save the output into the squad's research artifact.

## Evidence rules

- Cite the source type when available.
- Do not merge observation and interpretation into one sentence.
- Mark uncertainty explicitly when the signal is weak.
- Prefer cross-checking across platforms when the conclusion affects strategy.

## Deliverable structure

- Executive summary
- Observed signals
- Competitive or market implications
- Risks or gaps
- Recommended next action

## Agents that should read this file

- `Researcher`
- `Strategist`
- `Intake`
