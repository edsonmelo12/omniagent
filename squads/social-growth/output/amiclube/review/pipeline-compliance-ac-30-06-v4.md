# Pipeline Compliance Report — AC-30-06 v4

## Veredito

**PASS — ready for queued publication**

## Escopo

- **Cliente:** AmiClube
- **Ativo:** AC-30-06
- **Canal/Formato:** Instagram / Carrossel
- **Versão:** v4
- **Preview canônico:** `social/previews/ac-30-06-instagram-carrossel-v4.html`
- **Exports finais:** `social/publish/ac-30-06-v4/ac-30-06-01.png` a `ac-30-06-07.png`

## Evidências Verificadas

| Gate | Evidência | Status |
|------|-----------|--------|
| Visual Decision Card | `visual-decision-cards/ac-30-06-vdc-v4.md` | PASS |
| Render Compliance Card | `visual-decision-cards/ac-30-06-rcc-v4.md` | PASS |
| Review dedicado | `review/ac-30-06-v4-review.md` | PASS após correção de export |
| Incident Trace | `review/incident-trace-ac-30-06-no-images.md` | PASS |
| Manifest canônico | `campaign-manifest.json` aponta para preview v4 | PASS |
| PNGs finais | `file` confirmou `1080 x 1350` em `ac-30-06-01.png` e `ac-30-06-07.png` | PASS |
| Skill Invocation Ledger | Presente no VDC, RCC e review | PASS |

## Correção Confirmada

O review anterior registrava bloqueio por exportação em `420x525`. A verificação atual dos arquivos referenciados pela fila confirmou dimensão final correta:

```text
squads/social-growth/output/amiclube/social/publish/ac-30-06-v4/ac-30-06-01.png: PNG image data, 1080 x 1350
squads/social-growth/output/amiclube/social/publish/ac-30-06-v4/ac-30-06-07.png: PNG image data, 1080 x 1350
```

## Resultado

- O incidente original de ausência de imagem está mitigado pelo VDC/RCC v4 e pelo preview com `background-image`.
- A pendência de dimensão dos PNGs está resolvida para os arquivos finais usados na fila.
- O ativo pode permanecer `queued` para a janela de 2026-05-10, sem promoção para `published`.

## Skill Invocation Ledger

| Agent | Skill/Contrato | Source File | Applied To | Concrete Use | Status |
|-------|----------------|-------------|------------|--------------|--------|
| Pipeline Auditor | pipeline-compliance-audit | `skills/pipeline-compliance-audit/SKILL.md` | AC-30-06 v4 | Verificação de VDC, RCC, review, incident trace, manifest e PNG final | invoked |
| Pipeline Auditor | visual-production-gate | `pipeline/data/visual-production-gate.md` | AC-30-06 v4 | Confirmação de imagem obrigatória e export final | invoked |
