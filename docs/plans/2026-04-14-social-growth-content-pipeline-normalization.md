# Social Growth Content Pipeline Normalization Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Normalize the social-growth pipeline so the execution steps, review gates, and schedule approval flow read blog -> discovery optimization -> repurpose -> content production package consistently.

**Architecture:** Update the step documents first, then align the operational index and README references, then refresh squad memory. Keep the final content production package as the last assembly layer, but make the blog and repurpose artifacts the explicit upstream sources in every pipeline gate.

**Tech Stack:** Markdown docs, squad memory notes, local file edits.

---

### Task 1: Update content creation step docs

**Files:**
- Modify: `squads/social-growth/pipeline/steps/step-03-create-content.md`
- Modify: `squads/social-growth/pipeline/steps/step-03b-create-visual-direction.md`

**Step 1: Review the current inputs and output language**
- Confirm the step loads the blog and repurpose artifacts where present.
- Confirm the final content production package remains the assembled output, not the upstream source.

**Step 2: Update the step instructions**
- Make the blog and repurpose package explicit sources.
- Keep the content production package as the final assembly layer.
- Adjust the output examples to match the new flow.

**Step 3: Verify the wording**
- Run `rg -n "content production package|discovery-optimized blog|repurpose package" squads/social-growth/pipeline/steps/step-03-create-content.md squads/social-growth/pipeline/steps/step-03b-create-visual-direction.md`
- Expected: the steps mention the new upstream sources and no longer imply the package is the only input.

### Task 2: Update review and approval gates

**Files:**
- Modify: `squads/social-growth/pipeline/steps/step-04-review-content.md`
- Modify: `squads/social-growth/pipeline/steps/step-05-approve-schedule.md`
- Modify: `squads/social-growth/pipeline/steps/step-06-schedule-delivery.md`

**Step 1: Review the current gate prompts**
- Confirm the review step validates blog, repurpose, and render outputs.
- Confirm approval and scheduling steps present the package as a final artifact, not the starting point.

**Step 2: Update the gate prompts**
- Mention the blog and repurpose outputs before the content production package.
- Keep the approval wording explicit about final assembly.
- Ensure the schedule step groups the approved assets in the correct order.

**Step 3: Verify the wording**
- Run `rg -n "content production package|discovery-optimized blog|repurpose package" squads/social-growth/pipeline/steps/step-04-review-content.md squads/social-growth/pipeline/steps/step-05-approve-schedule.md squads/social-growth/pipeline/steps/step-06-schedule-delivery.md`
- Expected: the upstream sources are explicit in each gate.

### Task 3: Update operator-facing indexes and squad memory

**Files:**
- Modify: `squads/social-growth/pipeline/data/operational-index.md`
- Modify: `squads/social-growth/README.md`
- Modify: `squads/social-growth/_memory/memories.md`

**Step 1: Review the current navigation text**
- Identify any label that still frames the content production package as the main source.
- Identify any memory note that still uses the legacy wording.

**Step 2: Update the references**
- Rename the current package label to reflect final assembly language if needed.
- Keep the usage order aligned with blog -> discovery optimization -> repurpose -> content production package.
- Add a memory note summarizing the normalization so future runs inherit the convention.

**Step 3: Verify the wording**
- Run `rg -n "Current Content Package|Content Package|discovery-optimized blog|repurpose package" squads/social-growth/pipeline/data/operational-index.md squads/social-growth/README.md squads/social-growth/_memory/memories.md`
- Expected: navigation and memory match the normalized flow.
