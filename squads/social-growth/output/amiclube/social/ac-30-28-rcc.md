# Render Compliance Card — AC-30-28

## Regeneration Header

| Campo | Valor |
|-------|-------|
| Asset ID | AC-30-28 |
| Tipo | Instagram Post |
| Canal | Instagram |
| Formato | Single post (1080x1350) |
| **Regeneration** | ✅ Sim |
| **Regeneration Date** | 2026-05-13 |
| **Motivo** | Atualização de imagem base para versão otimizada para Instagram |

## Change Log

| Versão | Data | Mudança |
|--------|------|---------|
| 1.0.0 | 2026-05-04 | Criação original |
| 1.1.0 | 2026-05-13 | **Regeneration:** Imagem base atualizada |

## Image Source Change

| Campo | Antes | Depois |
|-------|-------|--------|
| Imagem | `assets/AC-30-13B-home-office-hero.jpg` | `blog/imagens/AC-30-13B-campanha-investimento-em-decoração_-artesanal-no-home-office/instagram-carousel/instagram carousel-investimento-em-decoracao-artesanal-v1.webp` |
| Tipo | Blog hero image | Imagem otimizada para Instagram |
| Justificativa | Imagem do blog | Nova imagem com melhor performance no feed do Instagram |

## Visual Verification

| Verificação | Status | Evidência |
|-------------|--------|-----------|
| Imagem carrega no HTML | ✅ OK | Preview gerado em `social/previews/ac-30-28.html` |
| Overlay aplicado | ✅ OK | Scrim 70% opacidade conforme VDC |
| Legibilidade do texto | ✅ OK | Contraste mantém requisitos de acessibilidade |
| Primeira impressão | ✅ OK | Imagem full-bleed + overlay conforme declarado no VDC |
| Diferença vs anterior | ✅ OK | Nova imagem diferente da versão anterior do blog |

## Render Details

| Campo | Valor |
|-------|-------|
| Canvas | 1080x1350px |
| Skill | social-single-post |
| Estilo | Organic Image-led |
| Background | Full canvas image + scrim overlay |
| Typography | Playfair Display (headline) + DM Sans (body) |
| Mensagens | 1 dominante |
| DNA | ✅ Allowed (dentro do envelope) |

## Copy Alignment

| Elemento | VDC | Render | Status |
|----------|-----|--------|--------|
| Headline | "Seu home office fala sobre você. A questão é: o que ele diz?" | ✅ Match | OK |
| Body | "Uma peça artesanal bem posicionada..." | ✅ Match | OK |
| CTA | "Fale com a AmiClube →" | ✅ Match | OK |

## Compliance Checklist

| Regra | Status |
|-------|--------|
| VDC completo | ✅ |
| Imagem declarada no VDC | ✅ |
| Skill Invocation Ledger | ✅ |
| First Impression Diversity declarado | ✅ |
| DNA Acceptance verificado | ✅ |
| pt-BR accents corretos | ✅ |
| Sem anti-patterns | ✅ |
| Post-preview gerado | ✅ |

## Skill Invocation Ledger

| Agent | Skill | Source File | Applied To | Concrete Use | Status |
|-------|-------|-------------|-------------|--------------|--------|
| Atlas CEO | orchestration | squads/social-growth/agents/atlas-ceo.agent.md | Context loading, handoff | Coordenação da regeneration | invoked |
| Creative Renderer | social-single-post | skills/social-single-post/SKILL.md | HTML render, style application | Geração do post com nova imagem | invoked |
| Creative Renderer | social-visual-system | skills/social-visual-system/SKILL.md | Visual system, tokens | Paleta, tipografia, componentes | invoked |
| Creative Renderer | amiclube-creative-director | skills/amiclube-creative-director/SKILL.md | Client-specific guidance | Regras DNA Amiclube | invoked |

## Output Files

| Arquivo | Caminho | Status |
|---------|---------|--------|
| Preview HTML | `social/previews/ac-30-28.html` | ✅ Atualizado |
| VDC | `social/ac-30-28-vdc.md` | ✅ Atualizado v1.1.0 |
| RCC | `social/ac-30-28-rcc.md` | ✅ Criado |

## Next Step

- **Reviewer:** Validar renderização e compliance
- **Pipeline Auditor:** Validar evidências e compliance completo

---

## Metadata

- **RCC Version:** 1.0.0
- **Created:** 2026-05-13
- **Created by:** Atlas CEO (orquestração)
- **Status:** Ready for Review
- **Fast-track:** Sim (mesma skill, apenas mudança de imagem)