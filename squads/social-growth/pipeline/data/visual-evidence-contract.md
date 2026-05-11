# Visual Evidence Contract

Este contrato define como o squad deve provar decisões e validações de peças visuais. Ele existe para evitar alucinação operacional, como declarar baseline, aprovação, exportação, teste de preview ou fonte de imagem sem evidência verificável.

## Regra central

Toda peça visual precisa separar claramente:

- **Decisão criativa**: escolha estética, direção de arte, mood, composição e justificativa.
- **Evidência verificada**: arquivo, URL, dimensão, preview, validação ou veredito que foi de fato consultado.
- **Inferência**: conclusão plausível quando não há evidência direta, sempre marcada como inferida.

Nunca apresentar inferência como fato verificado.

## Proibições

- Não inventar baseline aprovado.
- Não inventar fonte de imagem, licença, autoria ou URL.
- Não declarar que o preview foi testado sem indicar método ou evidência.
- Não declarar que o export está correto sem informar dimensão e caminho do arquivo.
- Não declarar aprovação do Reviewer sem caminho do veredito ou registro equivalente.
- Não transformar preferência estética em regra factual.
- Não omitir riscos conhecidos de fit, contraste, corte, navegação ou legibilidade.

## Manifest mínimo por asset

Cada asset visual deve registrar este bloco antes de ser considerado pronto:

```md
## Visual Evidence

- Asset:
- Status:
- Creative decision:
- Format skill:
- Visual style:
- Baseline/reference:
- Baseline status: verified | inferred | missing
- Source image/path/URL:
- Source/license status: verified | inferred | not used | missing
- Export path:
- Export dimensions:
- Preview path:
- Preview behavior:
- Multi-frame navigation: yes | no | not applicable
- Validation method:
- Reviewer verdict/path:
- Known risks:
```

## Campos obrigatórios

- `Asset`: identificador da peça.
- `Status`: `draft`, `ready for review`, `approved`, `rejected` ou `blocked`.
- `Creative decision`: escolha visual e motivo estratégico.
- `Format skill`: skill visual usada.
- `Visual style`: estilo visual selecionado.
- `Baseline/reference`: caminho, URL ou nota explícita de inferência.
- `Export path`: caminho do arquivo final quando houver export.
- `Export dimensions`: dimensões reais ou esperadas, com método de verificação quando possível.
- `Preview path`: caminho do HTML ou interface de revisão.
- `Validation method`: comando, inspeção, screenshot, Playwright, `identify`, revisão manual registrada ou outro método.
- `Reviewer verdict/path`: veredito e caminho do arquivo quando a peça já foi revisada.

## Estados de evidência

Use somente estes estados:

- `verified`: há arquivo, URL, comando, screenshot, veredito ou outro registro concreto.
- `inferred`: a decisão foi deduzida a partir do briefing ou contexto, mas não há evidência direta.
- `not used`: campo não se aplica à peça.
- `missing`: evidência necessária está ausente.

## Veto automático

O asset deve ser bloqueado quando houver:

- baseline obrigatório com estado `missing`;
- fonte ou licença de imagem externa com estado `missing`;
- export final sem caminho ou dimensões;
- preview HTML ausente quando a entrega depende de revisão visual;
- multi-frame sem navegação de revisão;
- validação declarada sem método;
- veredito de aprovação sem registro quando a etapa de review já deveria ter ocorrido.

## Rubrica visual mínima

Quando o Reviewer avaliar uma peça visual, usar notas de 0 a 5:

- Hierarquia visual
- Contraste e legibilidade
- Uso da imagem ou background
- Adequação ao estilo selecionado
- Fidelidade ao baseline ou referência
- Variação no lote, quando aplicável
- Comportamento de preview e export

Critério de aprovação:

- qualquer nota abaixo de 3 gera `REJECT`;
- média abaixo de 4 gera `REVISE`;
- falha de evidência obrigatória gera `BLOCKED`, mesmo se a peça parecer boa.

## Linguagem obrigatória

Use formulações explícitas:

- `Verificado:` para fatos com evidência.
- `Inferido:` para decisões sem evidência direta.
- `Não verificado:` para itens ainda pendentes.
- `Bloqueio:` para falhas que impedem aprovação.

## Exemplo curto

```md
## Visual Evidence

- Asset: AC-30-20 Instagram Stories
- Status: approved
- Creative decision: sequência vertical com ritmo educativo e CTA final.
- Format skill: stories-sequence
- Visual style: Authentic Rough + Motion Social
- Baseline/reference: output/amiclube/social/publish/ac-30-17/
- Baseline status: verified
- Source image/path/URL: not used
- Source/license status: not used
- Export path: output/amiclube/social/publish/ac-30-20/
- Export dimensions: 1080x1920, verified with identify
- Preview path: output/amiclube/social/previews/ac-30-20-instagram-stories.html?preview=1
- Preview behavior: responsive review mode with frame navigation
- Multi-frame navigation: yes
- Validation method: identify + Playwright navigation check
- Reviewer verdict/path: output/amiclube/review/ac-30-19-20-34-review-verdict.md
- Known risks: none open

## Regra de Transição CSS para Export

Todo asset social com animação CSS (`transition` em `.carousel-track`, `.reels-track` ou wrapper similar) deve documentar no Render Compliance Card:

```md
- **CSS Transition Active**: [yes/no]
- **Transition Duration**: [value em ms]
- **Freeze Method**: [CSS override injetado via export script + wait >= 600ms]
- **Screenshot Timing**: [antes/depois da transição]
```

Se `CSS Transition Active: yes` e o export script não congelar a transição, o RCC recebe `BLOCKED` até correção.

O script `export-social-publish-assets.mjs` deve:
1. Injetar `transition: none !important` no track/wrapper via CSS overrides E via JS inline
2. Aguardar **mínimo 600ms** entre mudança de frame e screenshot (para cobrir transitions de até 450ms)
3. Após exportar, rodar `identify` e falhar se dimensões ou tamanho de arquivo indicarem captura em transição
```
