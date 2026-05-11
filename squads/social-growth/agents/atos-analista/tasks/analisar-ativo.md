# Tarefa: Analisar Ativo

## Process
1. Extrair os sinais de distribuição e resposta do ativo a partir do Otiniel Observa.
2. Cruzar os sinais reais com o objetivo primário e o horizonte de retorno definidos no planejamento.
3. Avaliar a causalidade provável do resultado com base em variações de criativo, canal e formato.

## Output Format
YAML

## Output Example
```yaml
ativo_id: "post_2023_10_27_01"
canal: "Instagram"
formato: "Reels"
objetivo_planejado: "Distribuição e Alcance"
horizonte: "Curto Prazo"
evidencias:
  alcance: 15200
  taxa_retencao: 0.65
  salvamentos: 420
  comentarios_qualificados: 15
diagnostico:
  padrao_detectado: "Gancho forte com queda acentuada após 15 segundos."
  conflito: "Alto alcance, mas baixa conversão em seguidores comparado à média."
  causalidade_provavel: "O tema é de alto apelo geral, mas o CTA final foi genérico demais."
decisao: "Repetir com Ajuste"
ajuste_recomendado: "Refinar o CTA para ser mais específico ao ICP e testar novo encerramento."
confianca: "Alta"
gaps_informacao: 
  - "Dados de clique no link da bio não disponíveis nesta janela."
```

## Quality Criteria
- [ ] Decisão baseada em evidência quantitativa e qualitativa.
- [ ] Identificação clara de causa provável.
- [ ] Recomendação de ajuste específica.

## Veto Conditions
- [ ] Análise baseada apenas em métricas de vaidade sem olhar para o objetivo.
- [ ] Falta de decisão clara (Taxonomia de Decisão).
