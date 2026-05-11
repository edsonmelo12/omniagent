---
name: data-analysis
description: Practical analysis and synthesis for marketing, product, and operational data. Use when a squad needs to turn raw signals into concise findings, KPI readouts, trends, risks, and recommendations.
type: prompt
version: "1.0.0"
categories: [analytics, research, reporting, strategy]
---

# Data Analysis

Use this skill when a task asks for structured analysis, synthesis, or a decision-ready readout from data, research, or observed signals.

## When to use

- Research summaries
- Market and competitor readouts
- KPI interpretation
- Trend and pattern analysis
- Funnel or performance diagnosis
- Risk and opportunity framing
- Executive reporting

## Operating principles

1. Separate facts, inference, and recommendation.
2. Prefer concise, decision-ready output over raw commentary.
3. State confidence when evidence is partial.
4. Preserve the source of truth and note unknowns explicitly.
5. Use quantitative readouts when the input supports them.
6. Avoid inventing metrics, sources, or certainty.

## Standard workflow

### 1. Read the inputs

Identify the source documents, signals, and any existing summaries. Treat the most recent persisted record as the source of truth when one exists.

### 2. Extract observed facts

List what is directly supported by the input. Keep this block clean and editable.

### 3. Derive implications

Explain what the facts suggest. Distinguish inference from evidence.

### 4. Identify opportunities and risks

Prioritize the items that matter most for planning, execution, or review.

### 5. Add a quantitative readout

Use counts, scores, percentages, confidence labels, or simple ranges when useful. If the data is not strong enough for precise numbers, say so.

### 6. Produce a reusable conclusion

End with a short recommendation that another agent or human can act on immediately.

## Output expectations

When used in a squad, the output should usually answer:

- What do we know?
- What does it mean?
- What should happen next?

## Writing rules

- Keep headings short and scannable.
- Use bullet lists for findings.
- Mark uncertain items as assumptions or open questions.
- Never blur evidence and opinion.
- Prefer practical language over academic language.

## Good output shape

```md
# Analysis Summary

## Executive Summary
- ...

## Observations
- ...

## Interpretation
- ...

## Risks and Unknowns
- ...

## Recommendations
- ...
```

## Notes

- This skill is intentionally broad so squads can use it for research, reporting, and decision support.
- If a task needs deeper statistical or machine learning methods, use a more specialized analytics skill instead.
