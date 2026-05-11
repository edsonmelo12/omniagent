---
name: analytics-tracking
description: Measurement and KPI interpretation for content, marketing, and product workflows. Use when a squad needs to define what to track, read performance signals, and turn them into actions.
type: prompt
version: "1.0.0"
categories: [analytics, measurement, kpi, reporting]
---

# Analytics Tracking

Use this skill when a task needs measurement design, metric interpretation, or a health readout for a content or marketing system.

## When to use

- Monitoring content performance
- Interpreting channel health
- Defining weekly review metrics
- Turning signal patterns into action
- Summarizing what to watch next

## Operating principles

1. Focus on a small set of decision-making metrics.
2. Keep channel-level interpretation separate from overall health.
3. Prefer trend and direction over isolated numbers.
4. State the review cadence and the threshold for concern when possible.
5. If tracking data is incomplete, say so and label the gap.
6. Tie every metric to an action or decision.

## Standard workflow

### 1. Identify the measurement goal

Clarify whether the goal is awareness, engagement, conversion, retention, or operational stability.

### 2. Select the KPIs

Choose only the metrics that directly support the goal and avoid vanity metrics unless they are contextually useful.

### 3. Read the signals

Interpret changes in volume, quality, consistency, and correlation across channels.

### 4. Classify health

Use simple health states such as green, yellow, and red when useful for fast review.

### 5. Recommend actions

Turn the signal into a concrete next step, not a generic observation.

## Output expectations

When used inside a squad, the output should answer:

- What are we measuring?
- What is healthy or unhealthy?
- What should we change first?

## Output shape

```md
# Measurement Summary

## Overall Status
- green / yellow / red

## KPI Priorities
- ...

## Channel Notes
- ...

## Signals to Watch
- ...

## Recommended Actions
- ...
```

## Notes

- This skill stays intentionally lightweight so it can be used in many squad types.
- If a task needs deep statistical analysis, defer to a more specialized analytics skill.
