# Auditoria de Execução — AC-30-31/32/33

## Resumo Executivo

Os assets AC-30-31, AC-30-32 e AC-30-33 tiveram desvio de padrão porque a regra de diversidade visual ficou mais forte que a regra de coerência de marca. O problema começou na direção visual: o Visual Director selecionou ou aceitou estilos que mudavam demais a personalidade visual da AmiClube. O Creative Renderer executou o briefing recebido. O Reviewer validou conformidade técnica, mas não bloqueou o VDC por desalinhamento com o DNA criativo do cliente.

## Causa Raiz

- A diversidade de primeira impressão foi interpretada como troca radical de estilo.
- Faltava um contrato objetivo de aceite por DNA criativo do cliente.
- O Reviewer conferia se o render seguia o VDC, mas não se o VDC era aceitável para a marca.
- O hub apontava para previews v3, enquanto manifest e publish assets apontavam para v2.

## Evidências

| Evidência | Achado |
|---|---|
| `creative-dna.md` | AmiClube deve parecer quente, humana, artesanal, expressiva e útil. |
| `ac-30-31-vdc-v3.md` | Selecionou `High-Energy Cyber`, bloqueado pelo DNA atual. |
| `ac-30-33-vdc-v3.md` | Selecionou `High-Energy Cyber`, bloqueado pelo DNA atual. |
| `ac-30-31-32-33-v2-review.md` | Aprovou variação forte de estilos como prova de diversidade. |
| `campaign-hub.html` | Apontava para v3, divergindo do manifest e dos assets de publicação. |
| `campaign-manifest.json` | Aponta para v2 para os três assets. |
| `social-publish-assets.json` | Aponta para v2 para os três assets. |

## Onde Os Agentes Se Perderam

| Agente | Avaliação |
|---|---|
| Visual Director | Origem principal do desvio. Priorizou anti-repetição e estilos diferentes acima do DNA da AmiClube. |
| Creative Renderer | Não foi a causa principal. Renderizou conforme o estilo declarado no VDC. |
| Reviewer | Falhou como gate de marca. Validou VDC/RCC, export, formato e navegação, mas não bloqueou desalinhamento com DNA criativo. |
| Pipeline | Permitia VDC tecnicamente completo avançar mesmo quando o estilo era inadequado para o cliente. |

## Decisão De Aceite Implementada

Foi criado o contrato `output/amiclube/creative-dna-acceptance.json` com três níveis:

- `allowed`: estilos que podem avançar quando o VDC está completo.
- `conditional`: estilos que exigem justificativa ligada ao DNA e ao objetivo do asset.
- `blockedByDefault`: estilos rejeitados sem aprovação explícita do usuário.

Para AmiClube, `High-Energy Cyber` ficou bloqueado por padrão porque leva a marca para uma estética tecnológica/neon/glitch que conflita com o DNA artesanal, quente e humano.

## Correção Aplicada

- Criado `creative-dna-acceptance.json` da AmiClube.
- Criado `validate-creative-dna-acceptance.mjs`.
- Adicionado script `social:validate:creative-dna` ao `package.json`.
- Atualizados Visual Director, Creative Renderer e Reviewer para aplicar o Client Creative DNA Acceptance Gate.
- Atualizados steps 03B, 03C e 04 para exigir o gate antes de renderização e aprovação.
- Atualizado `visual-production-gate.md` com Stage 0 — Client Creative DNA Acceptance Gate.
- Corrigido `campaign-hub.html` para apontar para os previews v2 aprovados e registrados.
- Atualizados VDCs v2 com bloco explícito de Client DNA Acceptance.

## Validação

```bash
npm run -s social:validate:creative-dna -- --client amiclube --assets AC-30-31,AC-30-32,AC-30-33 --version v2
```

Resultado: OK, com atenção para estilos condicionais `Motion Social` e `Authentic Rough`.

```bash
npm run -s social:validate:creative-dna -- --client amiclube --assets AC-30-31,AC-30-32,AC-30-33 --version v3
```

Resultado: FAIL para AC-30-31 e AC-30-33 por `High-Energy Cyber`.

## Recomendação

Usar v2 como versão ativa até nova regeneração. Qualquer v3 ou nova versão precisa passar no Client Creative DNA Acceptance Gate antes de renderização, hub, manifest, exportação ou publicação.
