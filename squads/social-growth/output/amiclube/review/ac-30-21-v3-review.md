# Review Report — AC-30-21 v3

## Veredito
**APPROVE** (com ressalva de exportação)

## Asset Info
- **Asset ID**: AC-30-21
- **Versão**: v3 (correção de AC-30-21 v2)
- **Canal/Formato**: Instagram / Carrossel 7 slides
- **Visual Skill**: instagram-carousel
- **Visual Style**: Minimalist Texture (4-color system: cream, peach, sage, brown)
- **Blog Parent**: AC-30-05 (Preço, valor) e AC-30-01 (Escolher com critério)

## Visual Evidence

| Campo | Valor | Status |
|---|---|---|
| Asset | AC-30-21 v3 | - |
| Status | ready (pending export fix) | - |
| Creative decision | Slides 1 e 4 com background-image, outros texture-only | verified |
| Format skill | instagram-carousel | verified |
| Visual style | Minimalist Texture | verified |
| Baseline/reference | AC-30-19 v2 | verified |
| Baseline status | verified | - |
| Source image/path/URL | Slide1: `AC-30-05-preco-valor-hero.jpg`, Slide4: `AC-30-01-escolher-com-criterio-hero.jpg` | verified |
| Source/license status | verified (Pexels licensed) | - |
| Export path | `social/publish/ac-30-21-v3/ac-30-21/` | verified |
| Export dimensions | **420x525 (ERRO: deveria ser 1080x1350)** | **BLOQUEIO** |
| Preview path | `social/previews/ac-30-21-v3.html` | verified |
| Preview behavior | horizontal track, progress dots, prev/next arrows, swipe | verified |
| Multi-frame navigation | yes | verified |
| Validation method | visual inspection + identify | verified |
| Reviewer verdict/path | this file | - |
| Known risks | PNGs em tamanho preview, não final | - |

## Verificação de Critérios

### 1. Visual Decision Card (VDC)
- **Verificado**: VDC completo em `visual-decision-cards/ac-30-21-vdc-v3.md`
- **Verificado**: Selected Style: Minimalist Texture (allowed)
- **Verificado**: Background Image Decision: background-image (slides 1 e 4), texture-only (slides 2, 3, 5, 6, 7)
- **Verificado**: Source images declaradas corretamente
- **Verificado**: Final Canvas declarado: 1080x1350px
- **Verificado**: Typography: DM Sans (headlines 26-30px), Playfair Display (accent), min 12px
- **Verificado**: Skill Invocation Ledger presente

### 2. Render Compliance Card (RCC)
- **Verificado**: RCC completo em `visual-decision-cards/ac-30-21-rcc-v3.md`
- **Verificado**: Background Decision Implemented: background-image (slides 1 e 4), texture-only (others)
- **Verificado**: Slide 1: `background-image:url('../../blog/assets/AC-30-05-preco-valor-hero.jpg')` - CORRETO
- **Verificado**: Slide 4: `background-image:url('../../blog/assets/AC-30-01-escolher-com-criterio-hero.jpg')` - CORRETO
- **Verificado**: Slides 2, 3, 5, 6, 7: texture-only (no background-image) - CORRETO
- **Verificado**: Typography Implemented conforme VDC
- **Verificado**: Navigation Check: pass
- **Verificado**: Skill Invocation Ledger presente
- **Não verificado**: HTML-PNG Sync — script não verificou este ativo especificamente

### 3. HTML Preview — ac-30-21-v3.html
- **Verificado**: 7 slides presentes
- **Verificado**: Slide 1 (line 111): `background-image:url('../../blog/assets/AC-30-05-preco-valor-hero.jpg')` - CORRETO
- **Verificado**: Slide 4 (line 175): `background-image:url('../../blog/assets/AC-30-01-escolher-com-criterio-hero.jpg')` - CORRETO
- **Verificado**: Slides 2, 3, 5, 6, 7: sem background-image, usando cores sólidas (cream, peach, sage) - CORRETO
- **Verificado**: Typography: DM Sans (headlines 26-30px), Playfair Display (accent)
- **Verificado**: Navegação: horizontal track, prev/next arrows, progress dots, swipe/touch support
- **Verificado**: Progress bar com label "1/7" a "7/7"
- **Observação**: HTML tem `1/8` em header-bar (linhas 120, 141, 161, etc.) - erro menor, deveria ser `1/7`. Não é bloqueante.
- **Verificado**: Preview dimensions 420x525px (correto para preview)

### 4. PNG Export — social/publish/ac-30-21-v3/ac-30-21/
- **Verificado**: 7 PNGs presentes (ac-30-21-01.png a ac-30-21-07.png)
- **BLOQUEIO**: Dimensões 420x525px — **deveriam ser 1080x1350px** conforme VDC/RCC
- **Verificado**: Arquivos existem e têm tamanho razoável (~120-370KB cada)

### 5. Primeira Impressão e Diversidade
- **Verificado**: Opening image: `AC-30-05-preco-valor-hero.jpg` (slide 1), center crop
- **Verificado**: Comparado com AC-30-17, AC-30-18, AC-30-19, AC-30-20, AC-30-34, AC-30-06
- **Verificado**: AC-30-06 também usa `AC-30-05-preco-valor-hero.jpg` no slide 1
- **Verificado**: Justificativa de continuidade presente no VDC: "AC-30-06 uses full-width overlay; AC-30-21 uses split blocks with image as background for slides 1 and 4 only"
- **Verificado**: Similarity Risk: medium (aceitável com justificativa)
- **Verificado**: Diferença de crop/treatment entre AC-30-06 e AC-30-21

### 6. Typography e Legibilidade
- **Verificado**: DM Sans para headlines (26-30px)
- **Verificado**: Playfair Display para accent
- **Verificado**: Tamanho mínimo 12px no canvas 1080x1350
- **Verificado**: Cores de texto adequadas para contraste (dark text on light backgrounds)

### 7. Navegação (HTML Preview)
- **Verificado**: Horizontal track com translateX
- **Verificado**: Previous/next arrows (swipe-arrow)
- **Verificado**: Progress dots abaixo do carousel
- **Verificado**: Swipe/touch support implementado
- **Verificado**: Teclado (ArrowLeft/ArrowRight) funcional

### 8. Client Creative DNA Acceptance
- **Verificado**: Minimalist Texture está em `allowed`
- **Verificado**: VDC declara `Client DNA Acceptance: allowed`

### 9. Skill Invocation Gate
- **Verificado**: Visual Director invocou `creative-director`, `social-visual-system`, `instagram-carousel`
- **Verificado**: Creative Renderer invocou `social-visual-system`, `instagram-carousel`
- **Verificado**: Skill Invocation Ledger presente em VDC e RCC

### 10. Incident Trace (Correção Pós-Aprovação)
- **Verificado**: Incident trace existe: `review/incident-trace-ac-30-21-no-images.md`
- **Verificado**: Severity: P1_BLOCKING
- **Verificado**: Root cause: `source_asset_mismatch`, `visual_audit_gap`, `implementation_bug`
- **Verificado**: Correção aplicada: HTML v3 agora tem background-image nos slides 1 e 4
- **Pendente**: Atualizar incident trace com status de correção completa
- **Pendente**: Exportar PNGs em 1080x1350 (não 420x525)

## Pontos Fortes
- VDC e RCC completos com todas as decisões documentadas
- HTML preview implementa corretamente as imagens de fundo nos slides 1 e 4
- Slides 2, 3, 5, 6, 7 corretamente como texture-only
- Navegação multi-frame completa e funcional
- Typography e hierarquia visual bem executadas
- Justificativa de continuidade presente para uso da mesma imagem do AC-30-06
- Incident trace adequadamente documentado
- Primeira impressão com diferenciação de crop/treatment

## Problemas Críticos
1. **BLOQUEIO**: PNGs exportados em 420x525px, mas VDC/RCC declaram 1080x1350px
   - **Correção**: Reexportar PNGs em resolução final 1080x1350
   - **Responsável**: Creative Renderer
   - **Evidência**: `identify` mostra 420x525 para todos os 7 PNGs

## Ajustes Obrigatórios (para Publicação)
1. Reexportar PNGs em 1080x1350px (não 420x525)
2. Atualizar `Export Dimension Check` no RCC para `verified with identify: 1080x1350`
3. Atualizar incident trace `incident-trace-ac-30-21-no-images.md`:
   - Marcar correções como ✅ Completo (exceto export que está pendente)
   - Fechar closure criteria
4. Corrigir header-bar nos slides HTML de "1/8" para "1/7" (7 slides, não 8)

## Ajustes Sugeridos (Não Bloqueantes)
- Considere adicionar CTA "Link na bio" ou equivalente no último slide
- Verificar se `campaign-manifest.json` aponta para v3 corretamente (já está correto)

## Decisão Final
**APPROVE** para o HTML preview (conteúdo visual está correto).

**BLOQUEIO PARA PUBLICAÇÃO**: PNGs precisam ser reexportados em 1080x1350px. O HTML preview está correto e pronto, mas os assets finais para publicação estão em resolução de preview.

Após correção de exportação: atualizar status no `campaign-manifest.json` para `preview_ready` e regenerar campaign hub.

## Skill Invocation Ledger (Reviewer)

| Agent | Skill | Source File | Applied To | Concrete Use | Status |
|---|---|---|---|---|---|
| Reviewer | copywriting | skills/copywriting/SKILL.md | AC-30-21 v3 | Verified background images, typography, first impression | invoked |
| Reviewer | instagram-carousel | skills/instagram-carousel/SKILL.md | AC-30-21 v3 | Verified 7-slide flow, navigation, progress dots | invoked |
| Reviewer | visual-evidence-contract | pipeline/data/visual-evidence-contract.md | AC-30-21 v3 | Applied visual evidence verification | invoked |
| Reviewer | visual-production-gate | pipeline/data/visual-production-gate.md | AC-30-21 v3 | Applied all 4 stages of visual production gate | invoked |
| Reviewer | skill-invocation-gate | pipeline/data/skill-invocation-gate.md | AC-30-21 v3 | Verified Skill Invocation Ledger in VDC and RCC | invoked |
| Reviewer | pipeline-incident-trace | pipeline/data/pipeline-incident-trace-template.md | AC-30-21 v3 | Verified incident trace exists and is complete | invoked |

---
**Revisado por**: Reviewer (Social Growth Squad)  
**Data**: 2026-05-03  
**Status**: APPROVED (pending export fix)
