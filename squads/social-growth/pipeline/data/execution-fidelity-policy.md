# Execution Fidelity Policy — Social Growth Squad

Esta política define o nível de rigor esperado na execução dos passos do pipeline. O não cumprimento destas regras resulta em rejeição automática da fase.

## 1. Soberania dos Ativos Locais
- **Proibição de MCP Genérico**: É terminantemente proibido o uso de ferramentas como `pencil` ou `template-designer` genéricos. Toda produção visual deve utilizar a skill `social-visual-system` e os scripts/templates HTML da squad localizados em `backend/src/modules/content/remotion` ou scripts Python da raiz.
- **Fallbacks Proibidos**: Se a ferramenta visual falhar, o agente NÃO deve inventar um layout genérico. Ele deve reportar a falha técnica ou utilizar o motor de renderização alternativo previsto no `squad.yaml`.

## 2. Granularidade de Ativos
- **Rastreabilidade 1:1**: Cada item da pauta (ex: AC-30-01) deve possuir seu próprio arquivo de saída.
- **Proibição de Consolidação**: Não agrupe previews de diferentes posts em um único arquivo HTML, a menos que seja o `campaign-hub.html` (dashboard central).

## 3. Composição de Design (Rigor Skill-Driven)
- **Mandato das 3 Camadas**: Todo post social deve obrigatoriamente seguir a Composição em 3 Camadas (L1: Background Visível com Transparência, L2: UI da Marca, L3: Evidência/Janela de Tese se houver).
- **Legibilidade Mobile**: Textos principais nunca menores que 14px. Contraste AA obrigatório.

## 4. Zona de Veto (Pivot Obrigatório)
- Qualquer sinal de conteúdo técnico (passo a passo, receitas, pontos de crochê para AmiClube) deve ser pivotado para Business, Autoridade ou Estilo de Vida. O descumprimento desta regra é falta grave.

## 5. Protocolo de Erro
- Após 2 falhas consecutivas de qualquer ferramenta de automação, o agente deve pausar, documentar o erro no `logs/cli.log` e solicitar orientação ou aplicar o fallback manual documentado, nunca alucinar uma solução que ignore os padrões visuais.

---
*Assinado: Arquiteto Opensquad · 2026-04-25*
