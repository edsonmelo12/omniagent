---
type: checkpoint
outputFile: squads/social-growth/pipeline/data/intake-sources.md
---

# Step 00: Intake Sources

## Context Loading

Load these files before executing:
- `_opensquad/_memory/company.md` — current company context
- `squads/social-growth/pipeline/data/social-intelligence-intake.md` — automatic social data collection rules
- `squads/social-growth/pipeline/data/client-intake-guide.md` — accepted inputs and editable fields
- `squads/social-growth/pipeline/data/client-record-template.md` — structure that will be generated next

## Instructions

### Process
1. Start by discovering official social profiles from the website and public web references.
2. Ask the user to paste website links, social links and/or document names only if discovery is incomplete.
3. Also ask for market scope, competitor references, product priority and any visual or brand constraints that affect creative work.
4. Encourage them to include any notes about goals, offers or corrections.
5. Save the raw source list and the discovery notes before proceeding.
6. Keep the wording editable and easy to reuse.

## Output Format

```
# Intake Sources

## Links
- [link 1]
- [link 2]

## Documents
- [document 1]

## Notes
[free-form user notes]

## Creative and Market Hints
- market scope
- competitor references
- priority products or services
- visual references or brand constraints
```

## Output Example

```
# Intake Sources

## Links
- https://portaldemidias.com
- https://www.instagram.com/portaldemidias/

## Documents
- briefing-cliente.pdf
- proposta-comercial.docx

## Notes
Quero foco em social media, com prioridade para Instagram e TikTok.
```

## Veto Conditions

Reject and redo if ANY are true:
1. The source list or discovery notes are not captured before extraction begins.
2. The user cannot edit or clarify the sources later.

## Quality Criteria

- [ ] Links were captured clearly.
- [ ] Documents were captured clearly.
- [ ] User notes were preserved.
- [ ] The source list is editable after onboarding.
