---
execution: subagent
agent: wagner-wordpress
model_tier: fast
inputFile: squads/social-growth/output/{client}/publishing/wordpress-status.md
outputFile: squads/social-growth/output/{client}/publishing/wordpress-validation.md
---

# Step 06D: Post-Publish SEO Validation

## Context Loading

Load these files before executing:
- `squads/social-growth/output/{client}/publishing/wordpress-status.md` — publication evidence with post ID
- `squads/social-growth/pipeline/data/wordpress-scheduling-cron-policy.md` — Required SEO Fields

## Instructions

### Process
1. Ler o `wordpress-status.md` para extrair o WordPress Post ID de cada artigo publicado.
2. Para cada post ID, executar o validador:
   ```bash
   node squads/social-growth/scripts/post-publish-validator.mjs --post-id {id} --fix
   ```
3. Coletar o score e os resultados de cada validação.
4. Se o score for <60%, marcar como **ALERTA** no relatório.
5. Se o score for ≥85%, marcar como **APROVADO**.
6. Registrar no arquivo de saída.

## Output Format

```markdown
# WordPress SEO Validation Report

## Summary
- **Posts Validated**: [N]
- **Average Score**: [N]%
- **Status**: [APROVADO / ATENÇÃO / ALERTA]

## Per-Post Results
### Post [ID] - [Title]
- **Score**: [N]%
- **Critical Checks**: [N] ✅ | [N] ❌ | [N] 🔧
- **Auto-Fixes Applied**: [descrição]
- **Pending Manual Review**: [issues que exigem curadoria humana]
- **Edit URL**: [link]

## Pending Items
[lista consolidada de itens que exigem atenção manual]
```

## Veto Conditions

Reject and redo if ANY are true:
1. A validação não foi executada (post sem relatório).
2. Score <60% sem justificativa no relatório.

## Quality Criteria
- [ ] Todos os posts publicados foram validados.
- [ ] Auto-fixes foram aplicados onde possível.
- [ ] Itens pendentes foram consolidados para revisão manual.
