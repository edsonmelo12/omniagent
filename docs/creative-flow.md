# Processo Criativo OmniAgent

## 1. Propósito

O objetivo é gerar peças que soem profissionais e prontas para publicação, não apenas composições técnicas. Precisamos que o sistema automatizado trabalhe em parceria com:

- briefing vivo (intent, métrica, público, tom)
- camada criativa do cliente
- um designer/editor responsável pela estética final
- agentes especialistas (copy + visual + revisão)
- stakeholders que avaliem e liberem a peça

## 2. Fluxo Documentado

**Passo 1 – Briefing vivo (input humano + tabela do cliente)**

1. Registrar propósito claro
1. Ler a tabela persistida do cliente: nicho, oferta, público, tom, palette, logo, redes, prova e imagem recomendada
1. Ler a creative profile do cliente: mood, ambiente, composição, fundo, overlay, tipografia e regras de imagem
1. Validar tom e diferenciação: o que torna a peça reconhecível sem o logo
1. Identificar métricas de sucesso, CTA desejado e constraints

**Passo 2 – Mock/Referência**

1. Designer cria referência rápida (wireframe, moodboard, apontamentos de cor e tipografia)
1. Define o ancoramento visual do cliente e do post: tipo de imagem, fundo, overlay, contraste e ritmo
1. Compartilha com os agentes e orienta sobre layout e blocos esperados (GANCHO / DESENVOLVIMENTO / FECHO)

**Passo 3 – Execução automatizada**

1. O gerador pega a tabela do cliente + creative profile + briefs + mock para ajustar `visualDirection`, `workflowTrail`, `layoutStyle` e `theme`
1. Cada variante recebe hero/intervenção/assinatura de agente distinta (já implementado)
1. O conteúdo passa por revisão editorial antes de considerar pronto

**Passo 4 – Feedback & aprovação**

1. Expõe preview (story/feed) com callouts importantes
1. Captura feedback (cor, ritmo, leitura) e volta para o passo 2/3
1. Registra logs de decisão (ex.: “color palette aprovada”, “precisa de mais contraste no CTA”)

## 3. Roles necessários além dos agentes

- **Creative Lead / Designer:** transforma briefing em referências e valida estética final.
- **Revisor editoral:** garante que o gancho/desenvolvimento/fecho soem como tese, não orientação de bastidor.
- **Stakeholder / Cliente:** aprova o tom, CTA e paleta.
- **Engenharia (nós):** mantém o gerador responsivo, documenta o fluxo e fornece checkpoints (briefing, mock, feedback).

## 4. Checklist operacional

1. Existe briefing (propósito + tom + CTA)?
1. Foi criado mock (cores, bloqueio por layout, assinatura do agente)?
1. O gerador usou o workflow trail e aplicou `layoutStyle` + `theme` correto?
1. Há nota de feedback e próximos passos?

## 5. Integração com a ferramenta

- Documentar o uso deste esquema no repositório (p.ex., README de `docs/creative-flow.md`)
- Atualizar treinamento/briefing com as referências usadas pelos designers (cores, tipografia)
- Adicionar um checkpoint manual (talvez um issue ou card) antes de considerar a peça “pronta”

## 6. Próximos passos

1. Reunir o time criativo para validar briefing + mock seguindo este processo.
2. Sincronizar com stakeholders e baixar feedback real antes da próxima geração.
3. Usar o fluxo como base para a próxima geração de peças e documentar aprendizados.
