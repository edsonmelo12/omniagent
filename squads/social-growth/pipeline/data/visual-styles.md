# Visual Styles Library — Social Growth Squad

Esta biblioteca define os padrões estéticos que o Visual Director deve escolher para cada peça. O objetivo é evitar a monotonia e garantir que o visual acompanhe a emoção do conteúdo.

## 1. Dark Premium (Autoridade & Sofisticação)
- **Mood**: Sério, exclusivo, alta percepção de valor.
- **Background**: Preto profundo (#0D0D0D) ou Grafite muito escuro com leve ruído (noise).
- **Tipografia**: Serifada elegante (ex: Playfair Display) para títulos + Sans-serif minimalista para corpo.
- **Cores de Destaque**: Dourado, Bege acinzentado ou Verde Esmeralda escuro.
- **Elementos**: Linhas finas, sombras suaves, muito espaço negativo.

## 2. Editorial Magazine (Educação & Curadoria)
- **Mood**: Informativo, estruturado, dinâmico.
- **Background**: Off-white (creme ou papel levemente amarelado) com textura de papel ou jornal.
- **Tipografia**: Sans-serif extra bold (títulos grandes) + Serifada clássica (corpo).
- **Cores de Destaque**: Vermelho tijolo, Azul Marinho ou Preto absoluto.
- **Elementos**: Blocos de cor sólidos, fotos com bordas irregulares, numeração grande e destacada.

## 3. High-Energy Cyber (Tendências & Notícias)
- **Mood**: Urgente, tecnológico, vibrante.
- **Background**: Roxo escuro ou Azul Noite com gradientes sutis em neon.
- **Tipografia**: Sans-serif condensada e itálica (passa ideia de velocidade).
- **Cores de Destaque**: Rosa Neon, Ciano ou Lima.
- **Elementos**: Efeitos de glitch, brilhos (glow), elementos geométricos flutuantes.

## 4. Minimalist Texture (Clareza & Leveza)
- **Mood**: Calmo, direto, honesto.
- **Background**: Cinza claríssimo ou Bege areia com textura de concreto ou linho.
- **Tipografia**: Geometric Sans-serif (ex: Montserrat ou Futura) com espaçamento entre letras (kerning) generoso.
- **Cores de Destaque**: Tons terrosos ou pastéis saturados.
- **Elementos**: Formas orgânicas, sombras projetadas (soft shadows), foco total no texto.

## 5. Authentic Rough (Marca Pessoal & Conexão)
- **Mood**: Humano, imperfeito, próximo.
- **Background**: Cores vibrantes mas "sujas" (muted colors) com texturas de fita adesiva ou recortes.
- **Tipografia**: Handwritten (escrita à mão) para destaques + Sans-serif mono-espaçada.
- **Cores de Destaque**: Laranja queimado, Amarelo mostarda.
- **Elementos**: Setas desenhadas à mão, destaques estilo "marca-texto", fotos estilo polaroid.

## 6. Motion Social (Reels & Short Video)
- **Mood**: Rítmico, direto, com sensação de movimento contínuo.
- **Background**: Contraste forte com camadas simples para facilitar leitura em movimento.
- **Tipografia**: Sans-serif limpa, pesada para títulos e legível em telas pequenas.
- **Cores de Destaque**: 1 cor principal + 1 cor de alerta + branco ou preto para contraste.
- **Elementos**: cortes rápidos, legendas grandes, barras de progresso, destaques de prova, transições discretas.

## 7. Editorial Myth (Mitos & Provas Sociais)
- **Mood**: Investigativo, educativo, de alto contraste.
- **Background**: Alternância entre fundo escuro (`#1A1918`) e claro (`#F7F3EE`) para ritmo visual.
- **Tipografia**: Playfair Display (headlines) + DM Sans (body). Texto branco em fundo escuro, texto escuro em fundo claro, controlado por `data-text-variant`.
- **Cores de Destaque**: `#C45C1F` (laranja terracota), `#D9A85A` (dourado), `#8C6A5E` (marrom suave).
- **Elementos**: Truth cards (citações em itálico com borda sutil em slides de mito), checklist com marcadores, gradient CTA (`#8C6A5E → #C45C1F`), divider em dourado em fundo escuro.
- **Canvas**: 1080×1350. Preview 420×525.
- **Engine**: `compose.mjs` com `textVariant` + `truthCard` por slide.

## 8. Paper Bulletin (Participação & Escolha)
- **Mood**: Tátil, convidativo, de decisão rápida.
- **Background**: Papel quente (`#F7F0E6`) com areia e bordas suaves, como um mural editorial.
- **Tipografia**: DM Sans em caixa alta para ganchos; corpo limpo e pesado o suficiente para mobile.
- **Cores de Destaque**: `#8E5B47` (marrom queimado), `#D4A373` (areia quente), `#FFF8EF` (papel claro).
- **Elementos**: cartões de escolha, pills orgânicas, blocos adesivos, borda sutil, sombra de papel e CTA em selo.
- **Canvas**: 1080×1920 para Stories. Preview 420×525.
- **Engine**: `compose.mjs` com `choice_pills` e blocos de texto em cartão.

## 9. AD Editorial (Residencial Premium)
- **Mood**: Editorial, sofisticado, muito legível.
- **Background**: Papel quente com gradiente creme e sombra orgânica, evocando revista de interiores.
- **Tipografia**: Serifada clássica para títulos (Playfair Display) + Sans limpa para suporte.
- **Cores de Destaque**: `#A86D49` (bronze), `#181413` (preto editorial), `#F5EFE6` (creme).
- **Elementos**: moldura discreta, pill de baixo contraste, cards translúcidos e progressão limpa.
- **Canvas**: 1080×1920 para Stories. Preview 420×525.
- **Engine**: `compose.mjs` com contraste por `textVariant` e cartões suaves para frames editoriais.

---

### Regra de Ouro para o Visual Director:
"O visual deve servir ao sentimento do post. Se o post é sobre uma 'dor terrível', use Dark Premium ou High-Energy. Se é um 'tutorial passo a passo', use Editorial Magazine ou Minimalist. Se for reel ou vídeo curto, use Motion Social."
