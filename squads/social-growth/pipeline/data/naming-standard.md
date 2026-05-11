# Naming Standard

## Scope

This standard applies to the `social-growth` squad artifacts, guides and reusable templates.

## Rules

1. Use kebab-case for filenames.
2. Use one primary term per concept:
   - client record
   - market research
   - market intel
   - client report
   - content plan
   - blog draft
   - discovery optimization
   - content repurpose
   - content production package
   - content review
   - schedule plan
   - monitoring plan
3. Use the same term consistently across guides, indexes and outputs.
4. Keep entry-point names short:
   - start here
   - master guide
   - operational index
   - internal quickstart
5. Keep operational docs in English if they are system-level references.
6. Keep client-facing briefs in the client language when possible, but preserve the same structure.
7. Name consolidated client deliveries with the pattern `output/<client-slug>/client-report.md`.

## Preferred Labels

- Intake
- Record
- Market Research
- Strategy
- Content
- Review
- Schedule
- Monitor

## Avoid

- mixing "plan", "guide" and "template" for the same artifact;
- using multiple names for the same stage;
- renaming the same concept differently in README, index and output files;
- adding new docs without checking if a current concept already exists.
- splitting the final client delivery into multiple top-level markdown files when one consolidated report is enough.

## Usage Rule

Before adding a new artifact, ask:
"Does this file introduce a new concept, or does it duplicate an existing one?"

If it duplicates one, reuse the existing label.
