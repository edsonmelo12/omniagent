---
task: "Finalize Optimized Post"
order: 2
input: |
  - optimization_plan: Retrieval plan with preserve rules from Task 1
  - draft_post: The original blog draft
  - architecture_context: Brief, architecture, and strategy references
output: |
  - optimized_blog_post: Final blog post ready for review
---

# Finalize Optimized Post

Apply the optimization plan and produce the final review-ready article.

## Process

1. Apply the chosen opening pattern deliberately: optional top summary block only when justified; otherwise strengthen the direct-answer path in the opening without adding a default `TL;DR`.
2. Preserve the chosen hook, thesis, and family-specific arc while improving extractability.
3. Keep the featured-image sections specific and consistent with the article thesis.
4. Deliver the full final `# Blog Post` format expected by the step.

## Output Format

```markdown
# Blog Post

## Topic and Intent

## Copy Brief Preservation

## Opening Pattern Decision

## Top Summary Block
[optional; include only when justified]

## Author Block

## Title Tag

## Meta Description

## H1

## Intro

## Body

## FAQ

## Source Notes

## Schema

## Conclusion

## Discovery Optimization Notes

## Structural Preservation Notes

## Word Count Target

## Featured Image

## Featured Image Source Search

## Featured Image Selection Criteria

## Family Ledger Entry
```

## Output Example

> Follow the step contract exactly. The preservation notes must show that optimization strengthened retrieval without normalizing the article.

## Quality Criteria

- [ ] The final article is easier to scan and cite.
- [ ] The article still sounds like the same argument, not a new generic version.
- [ ] The copy brief preservation section explains what survived the pass.
- [ ] A top summary block, when present, is justified and not merely habitual.

## Veto Conditions

Reject and redo if ANY are true:
1. The final version is more extractable but less distinctive.
2. The structural preservation notes are missing or not credible.
