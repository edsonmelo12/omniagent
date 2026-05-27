---
execution: subagent
agent: creator
model_tier: fast
inputFile: squads/social-growth/output/strategy/content-plan.md
outputFile: squads/social-growth/output/content/content-production-package.md
---

# Step 03: Create Content

## Context Loading

Load these files before executing:
- `squads/social-growth/pipeline/data/fast-safe-routing-policy.md` — choose `quick_social_copy`, `blog_derived_social`, or `full_campaign_asset`
- `squads/social-growth/state-summary.md` — current client/status context
- current brand profile from the database-backed client workspace or latest client report
- `squads/social-growth/output/strategy/content-plan.md` — approved strategy
- `squads/social-growth/output/blog/blog-brief.md` — canonical brief when present
- `squads/social-growth/output/blog/blog-post.md` — approved discovery-optimized blog when present
- `squads/social-growth/output/repurposing/content-repurpose.md` — approved repurpose package when present
- `squads/social-growth/pipeline/data/generation-contract.md` — canonical checklist for publishable caption and routing fields
- `squads/social-growth/pipeline/data/tone-of-voice.md` — tone options for the client
- `squads/social-growth/pipeline/data/output-examples.md` — quality reference
- `squads/social-growth/pipeline/data/skill-invocation-gate.md` — mandatory skill invocation evidence for social generation
- `skills/copywriting/SKILL.md` — REQUIRED before writing social copy
- `skills/content-trend-researcher/SKILL.md` — REQUIRED only when research/trend context is used
- `_opensquad/core/best-practices/copywriting.md` — hook and CTA rules
- `_opensquad/core/best-practices/instagram-feed.md` — feed/carousel rules
- `_opensquad/core/best-practices/instagram-reels.md` — reel rules
- `_opensquad/core/best-practices/instagram-stories.md` — story rules
- `_opensquad/core/best-practices/facebook-post.md` — Facebook feed/link-preview rules
- `_opensquad/core/best-practices/linkedin-post.md` — LinkedIn post rules
- `_opensquad/core/best-practices/linkedin-article.md` — LinkedIn article rules
- `remotion-video-skill` — programmatic motion/video production for short-form campaign pieces

## Instructions

### Process
0. Determine the route using `fast-safe-routing-policy.md`. If the source blog is already final, keep this step concise and preserve the repurposed thesis instead of recreating the strategy.
1. Choose one clear editorial angle for each planned format.
1a. Invoke the required skills before drafting. At minimum, load `skills/copywriting/SKILL.md` and apply it to hook, proof, CTA and channel adaptation decisions.
2. Read the brand profile first and reuse the confirmed facts, inferred signals and proof gaps.
3. Use the approved blog brief, blog and repurpose package, when present, as the upstream source for final social assembly.
4. Draft each piece as `hook -> proof -> explanation -> CTA`.
5. Adapt the same idea to platform-native structure.
6. Keep language aligned with the approved tone and visual context.
7. Carry forward the approved blog word-count target and featured-image direction as constraints that downstream assets must not contradict; source rationale only when image research is active.
8. Preserve the brief's family ledger entry and proof freshness gate when the social idea came from long-form blog work.
9. Avoid generic placeholders; every slide or frame needs a specific job.
10. Assemble a production-ready package for review.
11. If the plan includes short-form video, translate the script into scene beats that can be rendered with Remotion.
12. Keep this step focused on social and LinkedIn deliverables; long-form blog posts are handled by the blog architecture and dedicated blog steps.
13. Do not emit briefing markers in the final copy. The publishable text must not show `Hook`, `CTA`, `autoridade de marca`, `negocio premium` or similar internal notes.
14. Add a `Skill Invocation Ledger` proving which skills were loaded and which concrete copy decisions came from them.
15. For every social asset, include a publishable caption contract: `asset_id`, `channel`, `format`, `final_caption`, `cta`, `hashtags`, `link_target`, `link_strategy`, and `alt_text`.
16. Ensure the production package can satisfy `generation-contract.md` before handoff: identity, routing, creative decision, caption/link and export/proof fields must be derivable from this output.

## Output Format

```
# Content Production Package

## Tone Chosen
[tone name and why]

## Instagram Feed
[hook, proof, development and CTA by slide]

## Instagram Reels
[hook, beats, proof cue and CTA]

## Remotion Video
[scene list, timing, voiceover notes, captions and render-ready instructions]
[explicit hook timing, proof reveal timing, and CTA timing tuned to the brand profile]

## Instagram Stories
[frame-by-frame sequence with action and CTA]

## Facebook Post
[single-frame post or link-preview copy with hook, proof/context and CTA]

## Facebook Reels
[hook, beats, proof cue, caption notes and CTA when Facebook Reels are in scope]

## Facebook Stories
[frame-by-frame sequence with action and CTA when Facebook Stories are in scope]

## LinkedIn Post
[hook, proof, body and CTA]

## LinkedIn Article
[article outline or draft]

## Blog Constraints
[word-count target, featured-image direction, source rationale, blog brief alignment, family ledger note, and any downstream notes the package must respect]

## Social Caption Contracts
| Asset ID | Channel | Format | Final Caption | CTA | Hashtags | Link Target | Link Strategy | Alt Text |
|---|---|---|---|---|---|---|---|---|

## Skill Invocation Ledger
| Agent | Skill | Source File | Applied To | Concrete Use | Status |
|---|---|---|---|---|---|
```

### Publishable Copy Rule

The text inside each channel block must be ready to publish as-is. If you need internal labels for drafting, keep them only in the reviewer or notes layer. Do not let those labels appear in the final social copy.

## Output Example

```
# Content Production Package

## Tone Chosen
Consultivo e confiante — the client needs authority without sounding rigid.

## Instagram Feed
Tema: 5 erros que travam o crescimento.
Slide 1: promessa forte.
Slide 2-6: um erro por slide, com exemplo pratico.
CTA: salve para revisar antes da proxima postagem.

## Instagram Reels
Hook: "Postar mais nao resolve se o sistema esta errado."
Script: 3 ideias praticas em 20-25 segundos.
CTA: siga para ver o proximo bloco da serie.

## Instagram Stories
Frame 1: pergunta forte.
Frame 2: contexto curto.
Frame 3: enquete.
Frame 4: CTA para responder no DM.

## LinkedIn Post
Hook em primeira pessoa.
3 paragrafos curtos.
4 aprendizados.
Pergunta final.

## LinkedIn Article
Titulo: estrategia de conteudo para crescer com consistencia.
Seções: contexto, metodo, exemplos, conclusao.
```

## Veto Conditions

Reject and redo if ANY are true:
1. The package ignores the platform-specific structure.
2. The CTA is generic or missing.
3. The package does not include a `Skill Invocation Ledger`.
4. `copywriting` was not invoked before social copy was created.
5. A ledger row lists a skill without a concrete decision taken from that skill.

## Quality Criteria

- [ ] Each format is natively adapted.
- [ ] The hook is strong in every piece.
- [ ] The proof appears early enough to support the promise.
- [ ] CTA is specific and actionable.
- [ ] Copy is broken into readable blocks, not a wall of text.
- [ ] Tone is consistent with the brand.
- [ ] The package respects the blog word-count target and featured-image direction.
- [ ] Required skills were invoked and evidenced in `Skill Invocation Ledger`.
