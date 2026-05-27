# Design System — Plano de Implementação

**Data:** 2026-05-10
**Status:** Fase 1 implementada
**Contexto:** Squad Social Growth — Otimização de tokens e tempo na geração de artes visuais

---

## 1. Problema

O pipeline visual (Step 03B + 03C) é o maior consumidor de tokens da squad pelos seguintes motivos:

| Fonte | Consumo | Por quê |
|-------|---------|---------|
| **Visual Director** | Alto (contexto) | Carrega ~25 arquivos por execução, incluindo skills completas de 200-600 linhas cada |
| **Creative Renderer** | **Crítico (output)** | LLM gera HTML+CSS do zero — até 1200 linhas por carrossel de 7 slides (~4000 tokens só de output) |
| **Recriações** | Redundante | Alterar 1 palavra = regenerar HTML inteiro |

**Meta:** Reduzir tokens de render em ~85% e tempo de geração em ~80%, mantendo (ou aumentando) a qualidade visual.

---

## 2. Arquitetura do Design System

### Estrutura em Camadas

```
design-system/
├── tokens.css                     # Foundation: cores, tipografia, spacing 8px, breakpoints
├── styles/                        # Style Presets (existentes: 4) — apenas CSS variables
│   ├── dark-premium.css
│   ├── editorial-magazine.css
│   ├── editorial-myth.css          # (criado 2026-05-10)
│   └── dark-premium.css
│   # Pendentes: high-energy-cyber, minimalist-texture, authentic-rough, motion-social
├── templates/                     # Format Templates (existentes: 2) — HTML + placeholders
│   ├── instagram-carousel.hbs
│   ├── post-preview.hbs            # (criado 2026-05-10 — galeria + caption)
│   # Pendentes: linkedin-carousel, stories-sequence, reels-sequence,
│   #            facebook-post, social-single-post, pinterest-pin
├── engine/                        # Motor de composição — Node.js, 0 LLM
│   └── compose.mjs                # Lê JSON → template → HTML
│       # Formatos suportados: instagram-carousel, post-preview
│       # Engine capabilities: data-text-variant (light/dark), truthCard,
│       #   --format override CLI, slide background (image/gradient/solid)
```

### Total: ~16 arquivos de template + 1 engine

---

## 2a. Extensibilidade — Criar ou Importar Novos Design Systems

O sistema foi desenhado para que **qualquer preset de estilo possa ser adicionado ou importado sem modificar engine, templates ou pipeline**.

### Criação de Novo Preset

Para adicionar um estilo visual inédito, o Visual Director (ou qualquer skill autorizada) cria um arquivo `.css` na pasta `styles/`:

```
design-system/styles/
├── dark-premium.css
├── editorial-magazine.css
├── editorial-myth.css          # Criado — paleta #C45C1F/#1A1918/#F7F3EE, alternância dark/light
└── (pendentes: high-energy-cyber, minimalist-texture, authentic-rough, motion-social)
└── client-amiclube-sazonal-2026.css   ← NOVO preset específico de cliente
```

O engine descobre todos os `.css` da pasta automaticamente. Nenhuma linha de código precisa mudar.

### Importação de Design System Externo

**De brand guide do cliente (cores + tipografia):**
O Visual Director analisa o guia, extrai paleta e fontes, e gera o preset:
```bash
node design-system/engine/preset-from-brand.mjs \
  --name "client-amiclube-sazonal-2026" \
  --primary "#2C5F2D" \
  --accent "#FFE77A" \
  --heading "Fraunces" \
  --body "Nunito Sans"
```

**De arquivo CSS/JSON externo:**
O engine aceita importação via schema padronizado:
```json
{
  "name": "client-amiclube-sazonal-2026",
  "tokens": {
    "bg": "#1A3A2A",
    "bg_alt": "#2C5F2D",
    "text_heading": "#FFE77A",
    "text_body": "#E8E8E8",
    "accent": "#D4AF37",
    "heading_font": "Fraunces",
    "body_font": "Nunito Sans",
    "noise_opacity": 0.03
  }
}
```
O engine converte esse JSON para `styles/client-amiclube-sazonal-2026.css` automaticamente.

### Restrições e Garantia de Qualidade

| Requisito | Como é garantido |
|-----------|-----------------|
| Todos os tokens obrigatórios existem | Engine valida contra schema fixo na criação |
| O preset não quebra templates existentes | Engine valida tokens essenciais antes de compor o HTML |
| Consistência com os formatos | Um preset funciona em **todos** os 7 formatos de imediato (CSS variables) |
| Qualidade visual | O preset entra no mesmo fluxo de validação (DNA Acceptance Gate + Reviewer) |
| Remoção segura | Basta deletar o `.css` — engine ignora presets ausentes com erro claro |

### Casos de Uso

| Situação | Ação |
|----------|------|
| Cliente novo com brand guide próprio | Visual Director cria preset específico do cliente |
| Campanha sazonal (Natal, Dia das Mães) | Importar preset temporário, remover após campanha |
| Teste A/B de estilo | Criar 2 presets, alternar no JSON manifest |
| Fornecedor externo de design | Enviar JSON de tokens → engine gera `.css` |

---

## 3. JSON Manifest — O Novo Output do Visual Director

Em vez de gerar brief textual + VDC, o LLM gera um **JSON estruturado** com as decisões criativas.

```json
{
  "asset_id": "ac-30-05",
  "client": "amiclube",
  "style": "dark-premium",
  "format": "instagram-carousel",
  "canvas": { "width": 1080, "height": 1350 },
  "preview": { "width": 420, "height": 525 },
  "slides": [
    {
      "type": "cover",
      "background": {
        "type": "solid",
        "color": "#0D0D0D",
        "texture": "noise-4"
      },
      "title": {
        "text": "O Segredo do Marketing Digital",
        "size": "hero",
        "color": "#F5F5DC",
        "align": "center"
      },
      "subtitle": {
        "text": "3 pilares essenciais que ninguém te conta",
        "size": "body",
        "color": "#AAAAAA"
      }
    },
    {
      "type": "content",
      "background": {
        "type": "solid",
        "color": "#1A1A1A"
      },
      "heading": {
        "text": "Pilar 1: Autoridade",
        "size": "heading",
        "color": "#F5F5DC"
      },
      "body": {
        "text": "Conteúdo relevante educa seu público e gera confiança naturalmente.",
        "size": "body",
        "color": "#CCCCCC"
      }
    },
    {
      "type": "cta",
      "background": {
        "type": "gradient",
        "from": "#0D0D0D",
        "to": "#1A1A1A"
      },
      "title": {
        "text": "Quer aplicar isso hoje?",
        "size": "heading",
        "color": "#FFFFFF"
      },
      "cta": {
        "text": "Envie 'MARKETING' no Direct",
        "style": "gold-outline"
      }
    }
  ],
  "design_tokens": {
    "accent_color": "#D4AF37",
    "heading_font": "Playfair Display",
    "body_font": "DM Sans",
    "noise_opacity": 0.04
  },
  "first_impression": {
    "image_crop": "macro",
    "role": "texture",
    "similarity_risk": "low"
  }
}
```

**Dimensão estimada:** ~40-60 linhas / ~250-400 tokens

---

## 4. Como o Engine Funciona

```
JSON Manifest
     │
     ▼
┌─────────────────────┐
│  engine/compose.mjs  │
│                      │
│  1. Lê JSON          │
│  2. Carrega style    │  ← style/dark-premium.css
│  3. Carrega template │  ← templates/instagram-carousel.hbs
│  4. Injeta JSON      │
│     nos placeholders │
│  5. Gera HTML final  │
│  6. Salva preview    │  → output/amiclube/social/previews/
└─────────────────────┘
     │
     ▼
   Playwright screenshot (inalterado)
```

### Custos

| Passo | Tokens | Tempo |
|-------|--------|-------|
| 1-6 (engine) | **0** | ~50ms |
| Playwright | 0 | ~2-5s |
| **Total** | **0** | **~2-5s** |

---

## 5. Mudanças nos Agentes

### Visual Director (Step 03B)

**Antes:**
- Carrega ~25 arquivos de contexto + skills
- Gera brief textual + VDC markdown (~200 linhas)
- LLM descreve estética em texto

**Depois:**
- Carrega ~15 arquivos (elimina skills visuais redundantes)
- Gera **JSON manifest** (~40 linhas)
- LLM toma decisões criativas e as estrutura em JSON
- Skills de formato **não são mais carregadas** — o template já codifica as regras

**Skills removidas do carregamento:**
- `social-visual-system/SKILL.md` (213 linhas)
- `social-visual-system/references/*` (5 arquivos)
- Skills de formato nativas (instragram-carousel 619 linhas, etc.)

**Economia no contexto:** ~1500+ linhas de skill que não precisam mais ser carregadas.

### Creative Renderer (Step 03C)

**Antes:**
- Carrega ~15 arquivos
- LLM gera HTML+CSS do zero (~800-1200 linhas)

**Depois:**
- Carrega ~8 arquivos (só contexto do cliente + JSON)
- **LLM não gera HTML** — chama o engine `compose.mjs` passando o JSON
- Foco: validação, orquestração de export, sincronia HTML-PNG

**O que o Renderer perde:**
- Geração de HTML/CSS (eliminado)

**O que o Renderer ganha:**
- Papel mais estratégico: validador visual, orquestrador de export
- Tempo liberado para verificar qualidade em vez de codar layout

---

## 6. Mudanças no Pipeline

### Step 03B (visual-direction)

| Item | Antes | Depois |
|------|-------|--------|
| Output | `visual-direction.md` (markdown) | `visual-direction.json` (JSON) |
| Arquivos carregados | ~25 | ~15 |
| Skills carregadas | creative-director + social-visual-system + formato | creative-director apenas |
| Tamanho do output | ~200 linhas | ~40-60 linhas |

### Step 03C (render-creative)

| Item | Antes | Depois |
|------|-------|--------|
| Input | visual-direction.md | visual-direction.json |
| Geração HTML | LLM (1000+ tokens) | Engine (0 tokens) |
| Arquivos carregados | ~15 | ~8 |
| Papel do LLM | Codar HTML | Validar output, orquestrar export |
| Papel do Playwright | Screenshot | Screenshot (inalterado) |

### Novos arquivos no pipeline

```
pipeline/data/design-system-tokens.md     — Referência dos tokens disponíveis
pipeline/data/design-system-manifest.md   — Schema do JSON manifest
```

---

## Status Geral

| Fase | Descrição | Status | Data |
|------|-----------|--------|------|
| Fase 1 | Fundação (tokens + 1 template + engine + 1 preset) | ✅ Completa | 2026-05-10 |
| Fase 2 | Estilos e Formatos (8 presets, 8 templates, engine multi-formato) | ✅ Completa | 2026-05-10 |
| Fase 3 | Integração ao Pipeline (Step 03B/03C + agentes) | ✅ Completa | 2026-05-10 |

## 7. Plano de Migração — 3 Fases

### Fase 1: Fundação (prioridade alta)

**O que:** Criar tokens base + 1 template + engine  
**Entregas:**
- `design-system/tokens.css` — cores, fontes, spacing
- `design-system/templates/instagram-carousel.hbs` — template principal (formato mais usado)
- `design-system/engine/compose.mjs` — motor de composição
- `design-system/styles/dark-premium.css` — 1° preset

**Teste:** Gerar 1 carrossel via engine, comparar output com HTML gerado pelo LLM  
**Validação:** Visual idêntico, tokens em 0, tempo < 5s

### Fase 2: Estilos e Formatos (prioridade média)

**O que:** Completar todos os presets + templates  
**Entregas:**
- 5 presets restantes
- 6 templates restantes
- Componentes compartilhados

### Fase 3: Integração ao Pipeline (prioridade alta)

**O que:** Modificar Step 03B e 03C  
**Entregas:**
- Visual Director gera JSON em vez de markdown
- Creative Renderer chama engine em vez de codar HTML
- Skills de formato removidas do carregamento
- Scripts de export adaptados (se necessário)

---

## 8. Impacto Estimado

| Métrica | Hoje | Fase 1 | Fase 2 | Fase 3 |
|---------|------|--------|--------|--------|
| **Tokens por carrossel** | ~4000 | **~400** | **~300** | **~250** |
| **Tempo por asset** | ~45s | **~8s** | **~5s** | **~3s** |
| **Arquivos carregados (03B)** | 25 | 25 | 25 | **~15** |
| **Arquivos carregados (03C)** | 15 | 15 | 15 | **~8** |
| **Skills carregadas (03C)** | 3-4 | 3-4 | 3-4 | **1** |
| **Consistência visual** | Variável | Alta | Alta | **Determinística** |
| **Erros de layout** | Ocorrem | Zero | Zero | **Zero** |

---

## 9. Riscos e Mitigações

| Risco | Probabilidade | Mitigação |
|-------|--------------|-----------|
| Template não cobre variação criativa | Média | JSON permite `design_tokens` para customizações locais |
| Engine quebra em formato não previsto | Baixa | Fallback: LLM gera HTML manualmente |
| JSON limita a criatividade do Visual Director | Média | Template engine aceita CSS/HTML custom inline via JSON |
| Migração trava pipeline ativo | Alta | Fase 1 em paralelo ao pipeline; Fase 3 só após aprovação |

---

## 10. Próximos Passos Imediatos

1. [x] **Aprovar este plano** (Edson)
2. [x] Criar `design-system/tokens.css` com design tokens fundamentais
3. [x] Criar `design-system/styles/dark-premium.css` (1° preset)
4. [x] Criar `design-system/templates/instagram-carousel.hbs` (1° template)
5. [x] Criar `design-system/engine/compose.mjs` (motor)
6. [x] Criar `design-system/engine/preset-from-brand.mjs` (importador de brand guides)
7. [x] Testar: gerar carrossel via engine, comparar com output LLM atual
8. [x] Apresentar resultado para aprovação antes de expandir

## 11. Entrega da Fase 1

**Implementado em:** 2026-05-10

Arquivos funcionais criados:
- `squads/social-growth/design-system/tokens.css`
- `squads/social-growth/design-system/styles/dark-premium.css`
- `squads/social-growth/design-system/templates/instagram-carousel.hbs`
- `squads/social-growth/design-system/components/*.hbs`
- `squads/social-growth/design-system/engine/compose.mjs`
- `squads/social-growth/design-system/engine/preset-from-brand.mjs`
- `squads/social-growth/design-system/examples/ac-30-design-manifest.json`
- `squads/social-growth/design-system/README.md`
- `squads/social-growth/pipeline/data/design-system-manifest.md`
- `squads/social-growth/pipeline/data/design-system-tokens.md`

Validação executada:
- `node squads/social-growth/design-system/engine/compose.mjs --manifest squads/social-growth/design-system/examples/ac-30-design-manifest.json --out squads/social-growth/output/amiclube/social/previews/ac-30-design-system-demo.html`
- `node --check squads/social-growth/design-system/engine/compose.mjs`
- `node --check squads/social-growth/design-system/engine/preset-from-brand.mjs`
- Playwright abriu o HTML gerado e salvou screenshot de verificação em `squads/social-growth/output/amiclube/social/previews/ac-30-design-system-demo-check.png`
- Playwright validou `body.export-mode` e salvou screenshot final em `squads/social-growth/output/amiclube/social/previews/ac-30-design-system-demo-export-check.png`
- Verificação independente: nenhum bloqueio de Fase 1 encontrado após correção do `export-mode`

Higienização executada:
- Artefatos de validação removidos de `squads/social-growth/output/amiclube/social/previews/` para não poluir o output operacional do cliente.
- Revalidação deve usar `/tmp/opencode` até um piloto real ser aprovado.
- README atualizado com checklist de higiene e piloto controlado.

### Fase 1: Fundação (prioridade alta) — ✅ Completa

**O que:** Criar tokens base + 1 template + engine  
**Entregas:**
- `design-system/tokens.css` — cores, fontes, spacing
- `design-system/templates/instagram-carousel.hbs` — template principal (formato mais usado)
- `design-system/engine/compose.mjs` — motor de composição
- `design-system/styles/dark-premium.css` — 1° preset

### Fase 2: Estilos e Formatos — ✅ Completa

**Entregas:**
- 8 presets: dark-premium, editorial-magazine, editorial-myth, high-energy-cyber, minimalist-texture, authentic-rough, motion-social, paper-bulletin
- 8 templates: instagram-carousel, reels-sequence, stories-sequence, linkedin-carousel, facebook-post, pinterest-pin, social-single-post, post-preview
- Engine multi-formato com validação por schema
- 5 manifests de exemplo + 2 manifests de piloto

### Fase 3: Integração ao Pipeline — ✅ Completa

**Entregas:**
- Step 03B: contexto do DS + opção de gerar JSON manifest
- Step 03C: chamada ao `compose.mjs` para render determinística
- Visual Director: instruções de output JSON
- Creative Renderer: instruções de engine call (0 tokens)
- Skills de formato nativas não precisam mais ser carregadas no caminho DS
