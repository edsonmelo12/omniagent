---
execution: subagent
agent: geo-audit
model_tier: powerful
outputFile: squads/social-growth/output/context/geo-discoverability-summary.md
---

# Step 01B: GEO / AI Discoverability

## Context Loading

Load these files before executing:
- `squads/social-growth/output/context/social-intelligence-summary.md` — social evidence and profile signals
- `squads/social-growth/pipeline/data/geo-discoverability-summary-template.md` — required output structure
- `squads/social-growth/pipeline/data/contextual-market-intelligence.md` — scope and reporting rules
- `squads/social-growth/pipeline/data/client-intake-guide.md` — accepted inputs and editable fields
- `squads/social-growth/pipeline/data/research-record.md` — research intent and framing
- `_opensquad/_memory/company.md` — current company context
- `_opensquad/core/best-practices/geo-ai-discoverability.md` — site-level GEO audit rules
- `_opensquad/core/best-practices/content-discovery-optimization.md` — article-level discovery context
- `_opensquad/core/best-practices/blog-seo.md` — SEO and intent context for downstream content

## Instructions

### Process
1. Read the client record, website and social evidence to identify the canonical brand summary page.
2. Evaluate whether the site clearly states who the company is, what it sells and who it serves.
3. Identify proof pages, evidence density, FAQ opportunities and schema readiness.
4. Score the site for entity clarity, answerability, sourceability, retrieval structure and risk.
5. Mark whether the site is ready for article scaling or needs upstream fixes first.
6. Keep confirmed facts, inferred signals and open gaps separate.
7. Output a concise GEO summary that strategy and discovery can reuse.

## Output Format

Use the structure defined in `geo-discoverability-summary-template.md`.

## Veto Conditions

Reject and redo if ANY are true:
1. The output does not name a canonical summary page or equivalent source of truth.
2. The output invents proof, schema or claims that are not visible.
3. The output does not state a fix order.
4. The output does not make it clear whether content scaling is safe yet.
5. **[GEO Gate]** If GEO score < 55 (Rework Needed), the pipeline MUST block blog content scaling until site-level GEO fixes are applied. The output must include a `blocking_gate: true` flag when score is below threshold.

## Quality Criteria

- [ ] A canonical page or source-of-truth page was identified.
- [ ] The entity and offer are clear or the gap is explicit.
- [ ] Proof density and schema readiness were evaluated.
- [ ] Risk flags and priority fixes are present.
- [ ] The summary is reusable by strategy and discovery.
