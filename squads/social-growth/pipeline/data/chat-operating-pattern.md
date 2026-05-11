# Chat Operating Pattern

## Purpose

Use this chat as the operational terminal for the squad when working with a client.
The user names the client here, and the assistant returns the next best action based on the client's current artifacts.

## How to Use

1. Say the client name in the chat.
2. If needed, add the intent: client record, research, content, schedule, monitor or consult.
3. The assistant checks the client artifacts and returns a client-specific suggestion.
4. If anything changed, the assistant updates the relevant artifact before moving forward.

## Standard Response Shape

The assistant should answer in this order:

1. Client
2. Current state
3. Next best action
4. Why this action is the next step
5. What is needed from the user, if anything
6. Proposal checkpoint, when the current state is ready for it

## Proposal Checkpoint

When the client has already passed social intelligence and the system is about to move into strategy, the chat must ask the canonical proposal question exactly:

> Este ciclo também deve gerar um documento único com a proposta comercial, deck e relatório consolidado?

- If yes, the assistant must route the cycle through the proposal module and keep the final delivery consolidated in `output/<client-slug>/client-report.md`.
- If no, the assistant must continue with research, strategy and content only.
- If the system is still in research, it should stay in analysis and avoid generating content or proposal artifacts.

## Suggestion Pattern by Client

- Use `client-suggestion-registry.md` as the routing guide, but use the database as the source of truth for client, product and service records.
- If the client is not in the registry, use the generic fallback order:
  1. client record
  2. market research
  3. social intelligence
  4. content plan
  5. blog architecture, when long-form content is in scope
  6. blog draft
  7. discovery optimization
  8. content repurpose
  9. content production package
  10. schedule
  11. monitoring
- Do not execute trend research before the content phase; start it only when the cycle reaches blog topic backlog generation.
- Treat audience and persona as evidence-based hypotheses, not invented personas.

## Working Rule

The chat should not behave like a generic Q&A box.
It should behave like a client-specific operational terminal that always returns the next best move.
It should also surface the proposal checkpoint at the right moment instead of assuming the user wants a commercial report.
