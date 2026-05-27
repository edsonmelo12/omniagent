# NLM Visual Prototype

## Purpose

`NLM Visual Prototype` is an optional pre-visualization layer for social assets. It uses NotebookLM to generate a fast visual reference before the Social Growth Squad creates the final asset through the normal production pipeline.

NotebookLM is allowed to help the squad see a creative direction earlier. It is not allowed to replace Visual Director, Creative Renderer, Reviewer, Pipeline Auditor, or the Design System render path.

## Status

- Stage type: optional prototype step.
- Output type: reference only.
- Publication status: never publish-ready.
- Canonical final path: Visual Director -> Creative Renderer -> Reviewer -> Pipeline Auditor.

## When To Use

Use this stage when at least one condition is true:

- the asset is a new carousel;
- the asset has a complex narrative sequence;
- the team needs to compare visual directions quickly;
- the Visual Director needs a fast composition reference;
- the Creator needs to test slide rhythm before final copy direction;
- Atlas identifies that a prototype will reduce uncertainty before production.

Do not use this stage when:

- the asset is a simple recurrent post;
- the design path is already obvious from a proven baseline;
- the deadline is only blocked by export or scheduling;
- the content needs no new visual exploration;
- using NotebookLM would add more review work than it saves.

## Required Inputs

Before using NotebookLM, the operator must provide:

- approved planning or campaign objective;
- active client context;
- approved source copy or draft direction;
- active visual contract and veto conditions;
- target format and canvas;
- CTA strategy;
- known claims that must not be exaggerated;
- the prompt from `nlm-visual-prototype-prompts.md` adapted to the asset.

## Approved Notebook

For the current pilot, use the registered NotebookLM notebook:

- Name: `AmiClube - Teste NLM Visual Prototype`
- Local MCP id: `amiclube-teste-nlm-visual-prot`

If another client is active, create or register a client-specific notebook before running the prototype. Do not reuse AmiClube sources as if they were universal.

## Operating Flow

1. Atlas decides whether the prototype is useful for the asset and records the reason in the handoff.
2. Creator prepares the source direction and selects the correct prompt template.
3. NotebookLM generates the prototype manually through Studio/Presentation, or through any supported future MCP feature when available.
4. Visual Director reviews the prototype and extracts only the useful direction: narrative rhythm, composition idea, hierarchy, mood, or visual metaphor.
5. Visual Director creates the real Visual Decision Card using the squad contract and Design System rules.
6. Creative Renderer produces the final asset through the normal render path.
7. Reviewer validates the final asset against sources, pt-BR copy, visual contract, export evidence, and publication rules.

## What Can Be Reused

The squad may reuse:

- slide sequence;
- headline direction;
- CTA framing;
- mood and visual metaphor;
- hierarchy pattern;
- composition reference;
- risk notes.

The squad must not reuse directly as final:

- NotebookLM watermark;
- generated PDF pages as publishable assets;
- unsupported typography;
- unsupported claims;
- layouts that break the active format contract;
- generic brand styling not validated against client DNA;
- any image or visual element whose usage rights are unclear.

## Mandatory Evaluation Checklist

Every prototype must be evaluated before it informs production:

- [ ] All pages match the requested format and orientation.
- [ ] Copy is in pt-BR with correct accents and diacritics.
- [ ] No claim, benefit, number, guarantee, or feature was invented.
- [ ] CTA matches the campaign route.
- [ ] Prototype does not include fake social UI or mock platform chrome.
- [ ] Prototype does not include a publishable NotebookLM watermark.
- [ ] Visual direction is useful rather than generic.
- [ ] Visual direction can be adapted to the client creative DNA.
- [ ] Final production still requires VDC, RCC, Review, and Compliance Audit.

## Veto Conditions

Reject the prototype as a production reference if any are true:

1. It creates horizontal slides for a vertical carousel.
2. It invents claims, statistics, guarantees, or capabilities.
3. It has uncorrected pt-BR orthographic or accent errors in user-facing copy.
4. It uses fake Instagram or social platform UI.
5. It relies on the NotebookLM watermark or exported PDF as final art.
6. It conflicts with the active client creative DNA.
7. It makes the final production slower than the standard pipeline.
8. It is visually attractive but strategically generic.

## Handoff Format

Use this short handoff when sending the prototype to Visual Director:

```md
## NLM Visual Prototype Handoff

- Asset ID:
- Client:
- Source notebook:
- Prompt used:
- Prototype file/link:
- Target format:
- Useful elements to preserve:
- Elements to discard:
- Claims requiring source validation:
- Format issues:
- CTA route:
- Atlas decision: use as reference / discard / regenerate
```

## Test Summary

The AmiClube pilot showed that NotebookLM is useful for ideation after the prompt explicitly defines:

- creative persona;
- vertical 4:5 format as a hard requirement;
- no widescreen output;
- careful, non-absolute copy;
- no fake social UI;
- no direct publication.

The approved operational conclusion is: NotebookLM can accelerate prototype creation, but final assets remain owned by the Social Growth Squad pipeline.
