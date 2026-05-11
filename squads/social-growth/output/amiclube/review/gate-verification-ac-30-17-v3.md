# Gate Verification — AC-30-17 V3

**Asset:** AC-30-17 — Checklist: Qualidade antes do preço
**Platform:** Instagram Carrossel
**Objective:** Descoberta
**Date:** 2026-05-02
**Version:** V3 (correções pós-auditoria rigorosa)

---

## Gate Audit (10 gates)

### G1: Asset Exists ✅ PASS
- Preview: `ac-30-17-carousel-v3.html`
- Published: 7 PNGs (ac-30-17-01.png a ac-30-17-07.png)
- Dimensões: 1080×1350 (4:5) — correto para Instagram carrossel

### G2: Copy Matches Brief ✅ PASS (FIXED)
- Brief exigia 5 sinais: Densidade Constante, Fio Mercerizado, Junções Perfeitas, Trava Interna, Base Estruturada
- V1 (errado): Acabamento, Propósito, Confiança, Cuidado, Coerência → **REJEITADO**
- V3 (correto): Todos os 5 sinais presentes com títulos e descriptions corretos
- Slide 7 CTA: "SALVE ESTE CHECKLIST" + "enviar curadoria" + "link está na bio"

### G3: Image Match ✅ PASS
- Background image: `AC-30-01b-source-amigurumi-crocheted-chicks-austria.jpg`
- Imagem relacionada a amigurumi — coerente com tema

### G4: Aspect Ratio ✅ PASS
- 1080×1350 (4:5) — corresponde ao brief e dimensões Instagram carrossel

### G5: Vertical Alignment ✅ PASS (FIXED)
- `.content` usa `justify-content: center` (não mais `space-between`)
- Pills usam `margin-top: auto` para rodapé
- Todos os slides centralizados verticalmente
- Nenhum `flex-start` ou `space-between` no container principal

### G6: Export Rules ✅ PASS (FIXED)
- Sem mock header, botões de interação ou navegação HTML
- `.progress` com `body.export-mode .progress { display: none !important; }`
- Navegação apenas via teclado (← →) e swipe
- Clean export ready

### G7: Link Distribution ✅ PASS (FIXED)
- Draft `article_url`: `https://amiclube.com.br/escolher-com-criterio`
- Slide 7: "Quer saber mais? O link está na bio"
- Caption: "Tem mais sobre isso no blog — link na bio"
- Instagram → link na bio conforme brief

### G8: Creative DNA ✅ PASS
- Dark Premium style (fundo escuro, gradientes, tipografia serifada)
- Check cards brancos com contraste alto
- Gold accent para números (01-05)
- Hierarquia tipográfica clara

### G9: pt-BR Compliance ✅ PASS
- Todos os acentos corretos (não, é, você, critérios, proporção)
- Sem palavras estrangeiras
- Ortografia brasileira

### G10: Status Consistency ✅ PASS (FIXED)
- Draft status: `preview_ready`
- Manifest status: `preview_ready` (era `Preview pronto (aprovado)` → corrigido)
- Hub → v3 preview
- Manifest canonicalPreviewPath → v3

---

## Defeitos Corrigidos nesta V3

| # | Defeito | Severidade | Correção |
|---|---------|------------|----------|
| 1 | Conteúdo v1 divergia do brief (5 sinais genéricos) | P0 | V3 com 5 sinais corretos do brief |
| 2 | Manifest/hub apontavam para v1 errado | P0 | Atualizados para v3 |
| 3 | Draft `article_url: null` | P1 | Preenchido com URL do artigo |
| 4 | CTA "link na bio" ausente no slide 7 | P1 | Adicionado com texto do brief |
| 5 | `justify-content: space-between` no `.content` | P1 | Alterado para `center` em todos os slides |
| 6 | CTA era `<div>`, não elemento interativo | P2 | Slide 7 CTA agora é `<a>` |
| 7 | Status do manifest não padronizado | P3 | `preview_ready` |
| 8 | Pills em fluxo flex sem `margin-top: auto` | P2 | Adicionado `margin-top: auto` + `padding-top` |
| 9 | Progress bar visível em export | P2 | `body.export-mode .progress { display: none }` |
| 10 | PNGs publicados eram do v1 | P1 | 7 PNGs regenerados do v3 a 1080×1350 |

---

## Incident Traces

| Trace | Defeito | Veredito |
|-------|---------|----------|
| `incident-trace-ac-30-17-brief-mismatch.md` | Conteúdo v1 ≠ brief | MITIGATED |
| `incident-trace-ac-30-17-missing-cta.md` | CTA link na bio ausente | MITIGATED |

---

## Status Final

| Gate | Status |
|------|--------|
| G1-G10 | ✅ PASS (após correções V3) |

**Resultado:** ✅ APROVADO (V3 — conteúdo correto + alignment + CTA)

**Nota:** PNGs publicados regenerados com sucesso (7 slides, 1080×1350, 2026-05-02).
