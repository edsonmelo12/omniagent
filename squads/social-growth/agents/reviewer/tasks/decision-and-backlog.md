---
task: "Decision and Backlog"
order: 2
input: |
  - scorecard_pass: Weighted score, blockers, and notes from Task 1
  - review_inputs: Blog post and supporting materials
output: |
  - final_review: Final content review with verdict and backlog update
---

# Decision and Backlog

Turn the scorecard into a final verdict the next step can trust.

## Process

1. Convert the scorecard pass into the full `# Content Review` output.
2. Separate required fixes from optional improvements and keep verdict logic consistent with the thresholds.
3. Update the client editorial backlog with recurring discrepancy patterns and future opportunities.
4. Make sure genericity and repetition are treated as delivery risks, not style opinions.
5. If the scorecard pass found missing or vague skill invocation evidence, the final verdict must be `BLOCKED` or `REJECT`.

## Output Format

```markdown
# Content Review

## Verdict

## Scores

## Publication Scorecard

## Blog Notes

## Blog Architecture Notes

## Structure Variety Notes

## Copy and Hook Notes

## Repurpose Notes

## Visual Notes

## Render Notes

## Skill Invocation Gate Notes

## Required Fixes

## Suggestions

## Client Editorial Backlog Update
```

## Output Example

> Follow the pipeline step exactly. The verdict must line up with the weighted total and blocker severity.

## Quality Criteria

- [ ] The verdict matches the score and blocker severity.
- [ ] Required fixes are truly blocking and specific.
- [ ] The backlog update captures reusable learnings.
- [ ] The final verdict reflects any missing skill invocation as a blocker.

## Veto Conditions

Reject and redo if ANY are true:
1. The verdict is softer than the blockers justify.
2. The backlog update is generic or empty.
3. The review omits Skill Invocation Gate findings for social generation work.
