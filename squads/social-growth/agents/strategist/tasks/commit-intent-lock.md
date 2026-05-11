# Task: Commit Intent Lock (Intention Seal)

## Objective
Persist the strategic intent of the asset in the database to create a technical contract for production.

## Mandate: Lineage & Diversity Lock (1:3:2 Rule)
- [ ] No blog post can be committed without at least 3 social derivatives.
- [ ] Every blog commit must be distributed across at least 2 distinct channels (e.g., Instagram + LinkedIn).
- [ ] Every blog commit must be part of a block (Pai + 3+ Filhos + 2+ Channels).

## Input
- Strategic plan from Eldon (Strategist)
- Backlog IDs and client context

## Action
Run the persistence script in block:
`npx tsx backend/scripts/commit-intent.ts {clientId} {blogId} {intentDataJson}`
`npx tsx backend/scripts/commit-intent.ts {clientId} {socialId1} {intentDataJson}`
`npx tsx backend/scripts/commit-intent.ts {clientId} {socialId2} {intentDataJson}`
`npx tsx backend/scripts/commit-intent.ts {clientId} {socialId3} {intentDataJson}`
(ensure social IDs belong to at least 2 different channels)

## Quality Gate
- [ ] Lineage integrity: minimum 1 blog to 3 social assets ratio.
- [ ] Channel Diversity: minimum 2 distinct platforms.
- [ ] Intent data matches the client's business goals.
- [ ] Output shows "✅ Intent persisted" for the entire block.

## Output
- Database entries (Lineage Package persisted)
- confirmation of intent seal for the bundle.
