function normalize(text) {
  return String(text || '').toLowerCase().trim();
}

function detectIntent(prompt) {
  const value = normalize(prompt);
  if (['oi', 'olá', 'ola', 'bom dia', 'boa tarde', 'boa noite'].some((greeting) => value === greeting || value.startsWith(`${greeting} `) || value.startsWith(`${greeting},`) || value.startsWith(`${greeting}!`) || value.startsWith(`${greeting}.`))) return 'greeting';
  if (value.includes('agente') || value.includes('agentes') || value.includes('falar com') || value.includes('posso falar')) return 'agents';
  if (value.includes('atlas')) return 'atlas';
  if ((value.includes('campanha') || value.includes('ciclo')) && (value.includes('como está') || value.includes('como esta') || value.includes('status') || value.includes('andamento'))) return 'campaign-status';
  if ((value.includes('quantos') || value.includes('total') || value.includes('distribui')) && (value.includes('canal') || value.includes('tipo'))) return 'published-breakdown';
  if (value.includes('presença') || value.includes('presenca') || value.includes('presença digital') || value.includes('digital')) return 'presence';
  if (value.includes('engaj') || value.includes('likes') || value.includes('coment')) return 'engagement';
  if (value.includes('próxima campanha') || value.includes('proxima campanha') || value.includes('nova campanha') || value.includes('próximo ciclo') || value.includes('proximo ciclo') || value.includes('sugere')) return 'campaign-strategy';
  if (value.includes('artigo') || value.includes('blog') || value.includes('briefing')) return 'articles';
  if (value.includes('agenda') || value.includes('schedule') || value.includes('agend')) return 'schedule';
  if (value.includes('monitor') || value.includes('performance') || value.includes('publicad') || value.includes('presença') || value.includes('presenca') || value.includes('digital')) return 'monitor';
  if (value.includes('produto') || value.includes('catalog')) return 'products';
  if (value.includes('aprova') || value.includes('revis')) return 'review';
  if (value.includes('proposta') || value.includes('deck') || value.includes('relatório') || value.includes('relatorio')) return 'proposal';
  return 'next-step';
}

function detectPolicy(prompt) {
  const value = normalize(prompt);
  const governanceTerms = [
    'novo agente', 'nova agente', 'criar agente', 'crie um agente', 'instalar skill', 'instale skill', 'nova skill', 'arquitetura da squad', 'mudar arquitetura', 'alterar arquitetura', 'dinâmica da squad', 'dinamica da squad', 'mudar pipeline', 'alterar pipeline', 'permissões', 'permissoes', 'governança', 'governanca', 'mudar regras', 'alterar regras', 'contrato dos agentes', 'comportamento do atlas', 'alterar agente', 'modificar agente'
  ];
  if (governanceTerms.some((term) => value.includes(term))) return 'governance_change';

  const actionRegex = /(^|\s)(crie|criar|gere|gerar|atualize|atualizar|publique|publicar|agende|agendar|execute|executar|salve|salvar|prepare|preparar|reorganize|reorganizar|corrija|corrigir)(\s|$)/;
  if (actionRegex.test(value)) return 'operational_action';

  return 'operational_query';
}

function detectMode(prompt, currentMode = 'normal') {
  const value = normalize(prompt);
  if (value.includes('modo normal') || value.includes('desativar agente') || value.includes('sair do atlas')) return 'normal';
  if (value.includes('atlas')) return 'atlas';
  if (value.includes('strategist') || value.includes('estrategista')) return 'strategist';
  if (value.includes('researcher') || value.includes('pesquisador') || value.includes('pesquisa')) return 'researcher';
  if (value.includes('reviewer') || value.includes('revisor') || value.includes('auditor')) return 'reviewer';
  if (value.includes('visual director') || value.includes('diretor visual') || value.includes('direção visual') || value.includes('direcao visual')) return 'visual-director';
  if (value.includes('blogger') || value.includes('artigos') || value.includes('artigo')) return currentMode === 'normal' ? 'blogger' : currentMode;
  if (value.includes('scheduler') || value.includes('agenda')) return currentMode === 'normal' ? 'scheduler' : currentMode;
  if (value.includes('monitor')) return currentMode === 'normal' ? 'monitor' : currentMode;
  return currentMode || 'normal';
}

function escapeHtml(value) {
  return String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function list(items, formatter) {
  if (!items || !items.length) return '<li>Nenhum item encontrado nesta categoria.</li>';
  return items.map(formatter).join('');
}

function stateSentence(context) {
  return `Estou vendo ${context.counts.campaignItems} ativos da campanha da ${escapeHtml(context.client.name)}: ${context.counts.status.published || 0} publicados, ${context.counts.status.scheduled || 0} agendados e ${context.counts.status.review || 0} em revisão. Também há ${context.counts.articles} artigos e ${context.counts.products} produtos disponíveis no dashboard.`;
}

function modeIntro(mode) {
  if (mode === 'atlas') return '<p>Atlas aqui. Vou pensar contigo como orquestrador: primeiro clareza, depois rota, e execução só quando fizer sentido.</p>';
  if (mode === 'blogger') return '<p><strong>Blogger ativo.</strong> Vou olhar principalmente artigos, briefing, promessa editorial e derivados sociais.</p>';
  if (mode === 'scheduler') return '<p><strong>Scheduler ativo.</strong> Vou olhar datas, fila, canais e riscos de publicação.</p>';
  if (mode === 'monitor') return '<p><strong>Monitor ativo.</strong> Vou olhar publicados, sinais de performance e aprendizados.</p>';
  if (mode === 'strategist') return '<p><strong>Strategist ativo.</strong> Vou olhar campanha, posicionamento, narrativa e próximo ciclo.</p>';
  if (mode === 'researcher') return '<p><strong>Researcher ativo.</strong> Vou olhar evidências, mercado, público e hipóteses.</p>';
  if (mode === 'reviewer') return '<p><strong>Reviewer ativo.</strong> Vou olhar riscos, critérios de aprovação e possíveis vetos.</p>';
  if (mode === 'visual-director') return '<p><strong>Visual Director ativo.</strong> Vou olhar coerência visual, direção criativa e critérios de criação.</p>';
  return '';
}

function hasRecentContext(history) {
  return Array.isArray(history) && history.length > 1;
}

function blockersFor(context) {
  const blockers = [];
  if ((context.counts.status.review || 0) > 0) blockers.push(`${context.counts.status.review} asset(s) ainda em revisão`);
  if ((context.counts.status.blocked || 0) > 0) blockers.push(`${context.counts.status.blocked} asset(s) bloqueado(s)`);
  if (!context.counts.articles) blockers.push('nenhum artigo carregado em articles-data.js');
  return blockers;
}

function blockersSentence(context) {
  const blockers = blockersFor(context);
  if (!blockers.length) return '';
  return `<p>O principal cuidado agora: ${blockers.map(escapeHtml).join('; ')}.</p>`;
}

function nextActionFor(context) {
  if ((context.counts.status.review || 0) > 0) return 'priorizar aprovação ou correção dos assets em revisão';
  if ((context.counts.status.scheduled || 0) > 0) return 'conferir a agenda e preparar monitoramento dos próximos posts';
  return 'atualizar os artefatos do cliente e planejar o próximo lote de conteúdo';
}

function responseForGreeting(context, mode) {
  return [
    mode === 'atlas'
      ? '<p>Boa noite, Edson. Atlas por aqui.</p>'
      : `<p>Boa noite. Estou conectado aos artefatos atuais da ${escapeHtml(context.client.name)}.</p>`,
    mode === 'atlas'
      ? '<p>Posso te ajudar a decidir o caminho da campanha, chamar o agente certo ou preparar uma execução segura. Se envolver arquivo, agenda ou publicação, eu te mostro o plano antes.</p>'
      : '<p>Posso atuar como terminal operacional da squad. Peça algo direto, como “e por tipo?”, “quais artigos faltam?”, “ative Atlas” ou “sugira a próxima campanha”.</p>',
  ];
}

function responseForNextStep(context, mode, history) {
  if (mode === 'atlas') {
    return [
      hasRecentContext(history) ? '' : `<p>${stateSentence(context)}</p>`,
      `<p>Edson, eu iria pelo caminho mais seguro: <strong>${escapeHtml(nextActionFor(context))}</strong>.</p>`,
      '<p>Motivo simples: ainda tem decisão pendente. Se a gente empurra nova produção antes de limpar revisão, a campanha fica com duas verdades ao mesmo tempo: uma parte pronta para publicar e outra ainda pedindo julgamento.</p>',
      '<p>Eu faria assim: primeiro separo o que pode ser aprovado rápido, depois o que precisa voltar para ajuste, e só então chamo Scheduler ou Monitor para a próxima etapa.</p>',
      '<p>Quer que eu faça essa triagem em modo de conversa primeiro, sem alterar nada?</p>',
    ];
  }
  return [
    modeIntro(mode),
    hasRecentContext(history) ? '' : `<p>${stateSentence(context)}</p>`,
    `<p>Meu próximo movimento seria <strong>${escapeHtml(nextActionFor(context))}</strong>.</p>`,
    '<p>Eu não começaria um novo lote agora, porque ainda existe trabalho de decisão pendente. Se aprovarmos ou devolvermos os itens em revisão primeiro, a agenda fica mais segura e o monitoramento deixa de misturar peças prontas com peças ainda abertas.</p>',
    '<p>Itens que eu colocaria na frente:</p>',
    '<ul>',
    list(context.samples.pendingReview, (item) => `<li>${escapeHtml(item.assetId || '-')} - ${escapeHtml(item.title || '-')} (${escapeHtml(item.channel || '-')} / ${escapeHtml(item.type || '-')})</li>`),
    '</ul>',
    '<p>Se quiser, eu sigo revisando estes assets por prioridade ou separo o que pode ir para agendamento.</p>',
  ];
}

function responseForCampaignStatus(context, mode, history) {
  const review = context.counts.status.review || 0;
  const scheduled = context.counts.status.scheduled || 0;
  const published = context.counts.status.published || 0;
  if (mode === 'atlas') {
    return [
      hasRecentContext(history) ? '' : `<p>${stateSentence(context)}</p>`,
      `<p>Edson, a campanha está andando, mas ainda não está “limpa”. Temos ${published} publicados, ${scheduled} agendados e ${review} em revisão.</p>`,
      '<p>Minha leitura: o ciclo já tem corpo e material suficiente para aprender, mas a frente de revisão ainda está segurando a próxima decisão. Eu não trataria isso como problema grave; trataria como gargalo de fechamento.</p>',
      '<p>O melhor movimento agora é decidir os itens em revisão e, em paralelo, pedir ao Monitor uma leitura dos publicados para não planejar a próxima campanha no escuro.</p>',
    ];
  }
  return [
    hasRecentContext(history) ? '' : `<p>${stateSentence(context)}</p>`,
    `<p>A campanha está em estágio intermediário: ${published} publicados, ${scheduled} agendados e ${review} em revisão.</p>`,
    '<p>O gargalo principal é revisão. Depois disso, a agenda e o monitoramento ficam mais confiáveis.</p>',
  ];
}

function responseForPublishedBreakdown(context, mode) {
  return [
    modeIntro(mode),
    `<p>Sim. Considerando apenas os ${context.counts.status.published || 0} assets publicados da campanha, a distribuição está assim:</p>`,
    '<p><strong>Por canal</strong></p>',
    '<ul>',
    list(context.counts.publishedByChannel, (item) => `<li>${escapeHtml(item.label)}: ${item.count}</li>`),
    '</ul>',
    '<p><strong>Por tipo de post</strong></p>',
    '<ul>',
    list(context.counts.publishedByType, (item) => `<li>${escapeHtml(item.label)}: ${item.count}</li>`),
    '</ul>',
    '<p>Leitura rápida: eu usaria essa distribuição para comparar formato versus desempenho antes de definir o mix da próxima campanha.</p>',
  ];
}

function responseForEngagement(context, mode) {
  const summary = context.counts.engagement;
  return [
    modeIntro(mode),
    summary
      ? `<p>O snapshot de engajamento mostra ${summary.totalEngagement || 0} interações totais, média de ${summary.averageEngagement || 0} por post e pico de ${summary.peakEngagement || 0} em ${escapeHtml(summary.peakDate || '-')}. Ainda não tenho vínculo perfeito post-a-post com asset ID, então estou lendo pelos registros de série disponíveis.</p>`
      : '<p>Não encontrei um resumo de engajamento carregado nos artefatos atuais.</p>',
    '<p>Registros com maior engajamento no snapshot:</p>',
    '<ul>',
    list(context.samples.topEngagement, (item) => `<li>${escapeHtml(item.label || item.date || '-')} · ${escapeHtml(item.type || '-')} · ${item.engagement || 0} engajamentos (${item.likes || 0} likes, ${item.comments || 0} comentários)</li>`),
    '</ul>',
    '<p>Próximo passo: reconciliar esses registros com os assets publicados para responder “qual post” com ID, título e link, não só data/tipo.</p>',
  ];
}

function responseForPresence(context, mode) {
  const presence = context.counts.presence || {};
  const social = presence.social || {};
  const blog = presence.blog || {};
  return [
    modeIntro(mode || 'monitor'),
    '<p>Monitor ativo. Pela presença digital disponível nos artefatos, eu olharia três frentes: comunidade social, tráfego do blog e conexão desses sinais com os posts publicados.</p>',
    '<ul>',
    `<li><strong>Instagram:</strong> ${social.instagram?.followers || 0} seguidores, ${social.instagram?.posts || 0} posts, variação ${social.instagram?.followersChange || 0}.</li>`,
    `<li><strong>Facebook:</strong> ${social.facebook?.fans || 0} fãs, ${social.facebook?.talkingAbout || 0} falando sobre, variação ${social.facebook?.fanChange || 0}.</li>`,
    `<li><strong>Blog:</strong> ${blog.sessions || 0} sessões, ${blog.users || 0} usuários, ${blog.pageviews || 0} pageviews.</li>`,
    '</ul>',
    '<p>Minha leitura: antes de aumentar volume de campanha, eu validaria quais temas estão puxando tráfego e quais formatos sociais conseguem transformar esse interesse em conversa ou clique.</p>',
  ];
}

function responseForCampaignStrategy(context, mode) {
  return [
    modeIntro(mode || 'atlas'),
    `<p>Eu não abriria a próxima campanha ainda sem fechar os ${context.counts.status.review || 0} assets em revisão, mas já dá para desenhar a direção.</p>`,
    '<p>Minha sugestão para a próxima campanha da AmiClube: sair de “prova de valor/premium” para uma campanha de <strong>confiança + uso prático + conversão assistida</strong>.</p>',
    '<ul>',
    '<li><strong>Eixo 1:</strong> prova de confiança: reputação, atendimento, segurança e escolha sem arrependimento.</li>',
    '<li><strong>Eixo 2:</strong> uso prático: presente, decoração, coleção, home office e cuidado infantil.</li>',
    '<li><strong>Eixo 3:</strong> conversão: posts com produto recomendado, link claro e comparação de opções.</li>',
    '</ul>',
    '<p>Eu manteria carrosséis para educação, reels para prova sensorial/ASMR e posts Facebook para argumentos diretos. Antes de produzir, eu fecharia as revisões abertas e olharia os formatos com melhor engajamento.</p>',
  ];
}

function responseForAtlas(context) {
  return [
    '<p>Estou aqui, Edson. Atlas ativo.</p>',
    `<p>${stateSentence(context)}</p>`,
    '<p>Minha leitura rápida: o ciclo está vivo, mas com energia presa na revisão. Eu não chamaria isso de atraso; chamaria de ponto de decisão.</p>',
    '<p>Eu posso conversar contigo sobre a campanha, chamar o agente certo ou preparar uma execução operacional. Só não vou mexer na estrutura da squad, criar agentes ou mudar governança por aqui.</p>',
  ];
}

function responseForAgents() {
  return [
    '<p>Temos 19 agentes definidos na Social Growth Squad. No chat, eu consigo simular a conversa com os principais modos operacionais, mas a execução real de pipeline ainda precisa de confirmação.</p>',
    '<p>Os principais para conversar aqui são:</p>',
    '<ul>',
    '<li><strong>Atlas CEO</strong>: orquestração, diagnóstico, decisão de rota e governança.</li>',
    '<li><strong>Strategist</strong>: campanha, posicionamento, narrativa e próximos ciclos.</li>',
    '<li><strong>Researcher</strong>: inteligência de mercado, público, concorrência e sinais externos.</li>',
    '<li><strong>Blog Architect / Blog Writer</strong>: arquitetura e produção de artigos.</li>',
    '<li><strong>Visual Director</strong>: direção visual, linguagem, sistema visual e critérios de criação.</li>',
    '<li><strong>Creative Renderer</strong>: renderização/produção visual quando houver baseline aprovado.</li>',
    '<li><strong>Content Repurposer</strong>: transformar artigos em posts, stories, reels e derivados.</li>',
    '<li><strong>Scheduler</strong>: agenda, fila, datas, riscos e consistência de publicação.</li>',
    '<li><strong>Monitor</strong>: publicados, engajamento, sinais de performance e aprendizados.</li>',
    '<li><strong>Reviewer / Pipeline Auditor</strong>: revisão independente, compliance e veto.</li>',
    '</ul>',
    '<p>Você pode falar com eles assim: “Ative Atlas”, “fale como Monitor”, “ative Scheduler”, “chame o Blogger para os artigos” ou “quero uma visão do Strategist”.</p>',
    '<p>Regra importante: quando um agente sugerir execução ou alteração de arquivo, eu devo pedir confirmação antes.</p>',
  ];
}

function responseForGovernanceBlock(prompt) {
  return [
    '<p>Isso entra em governança ou arquitetura da squad, então eu não executo pelo chat operacional.</p>',
    '<p>Posso ajudar de duas formas seguras:</p>',
    '<ul>',
    '<li>registrar a necessidade como sugestão para revisão fora do fluxo operacional;</li>',
    '<li>preparar uma proposta de mudança, sem alterar agentes, pipeline, permissões ou arquitetura.</li>',
    '</ul>',
    `<p>Pedido recebido: <em>${escapeHtml(prompt)}</em></p>`,
    '<p>Se a intenção era operacional, reformule como tarefa de campanha, presença digital, artigos, agenda, monitoramento ou revisão.</p>',
  ];
}

function actionOwnerFor(intent, mode) {
  if (intent === 'articles') return 'blogger';
  if (intent === 'schedule') return 'scheduler';
  if (intent === 'monitor' || intent === 'engagement') return 'monitor';
  if (intent === 'review') return 'reviewer';
  if (intent === 'campaign-strategy') return 'strategist';
  if (intent === 'products') return 'strategist';
  if (mode && mode !== 'normal' && mode !== 'atlas') return mode;
  return 'atlas';
}

function responseForOperationalAction(prompt, context, intent, mode) {
  const owner = actionOwnerFor(intent, mode);
  return [
    `<p>Consigo fazer isso como tarefa operacional da campanha da ${escapeHtml(context.client.name)}. Antes de alterar qualquer artefato, eu vou te mostrar o combinado.</p>`,
    '<p><strong>Plano de execução</strong></p>',
    '<ul>',
    `<li><strong>Agente responsável:</strong> ${escapeHtml(owner)}</li>`,
    `<li><strong>Pedido:</strong> ${escapeHtml(prompt)}</li>`,
    '<li><strong>Escopo permitido:</strong> artefatos de cliente/campanha, diagnóstico, relatório, briefing, agenda, revisão ou monitoramento.</li>',
    '<li><strong>Fora de escopo:</strong> arquitetura da squad, criação de agentes, permissões, skills e regras centrais de pipeline.</li>',
    '<li><strong>Critério de veto:</strong> asset sem aprovação, dados insuficientes ou risco de alterar governança.</li>',
    '</ul>',
    '<p>Se quiser seguir, responda: <strong>confirmo execução</strong>. Se preferir só pensar junto, diga “só orientar”.</p>',
  ];
}

function responseForArticles(context, mode, history) {
  return [
    modeIntro(mode),
    hasRecentContext(history) ? '' : `<p>${stateSentence(context)}</p>`,
    '<p>Para artigos, eu focaria nos que já têm preview pronto, mas ainda precisam validação final de briefing, destino e publicação.</p>',
    '<ul>',
    list(context.samples.articles, (item) => `<li>${escapeHtml(item.assetId)} - ${escapeHtml(item.title)} · ${escapeHtml(item.status)} · ${escapeHtml(item.targetDate || '-')}</li>`),
    '</ul>',
    '<p>Próximo passo: escolha um asset ID de artigo para eu orientar a revisão, ou abra a página Artigo para fazer a triagem visual.</p>',
    blockersSentence(context),
  ];
}

function responseForSchedule(context, mode, history) {
  return [
    modeIntro(mode),
    hasRecentContext(history) ? '' : `<p>${stateSentence(context)}</p>`,
    '<p>Na agenda, estes são os próximos itens que aparecem na fila de publicação:</p>',
    '<ul>',
    list(context.samples.scheduled, (item) => `<li>${escapeHtml(item.assetId)} · ${escapeHtml(item.channel)} · ${escapeHtml(item.publishAt || '-')} · ${escapeHtml(item.status)}</li>`),
    '</ul>',
    '<p>Próximo passo: conferir datas, canais e vínculo de produto antes de deixar a fila rodar.</p>',
    blockersSentence(context),
  ];
}

function responseForMonitor(context, mode, history) {
  return [
    modeIntro(mode),
    hasRecentContext(history) ? '' : `<p>${stateSentence(context)}</p>`,
    '<p>Para monitoramento, eu começaria pelos publicados mais recentes e registraria sinais de desempenho por objetivo do asset.</p>',
    '<ul>',
    list(context.samples.published, (item) => `<li>${escapeHtml(item.assetId)} - ${escapeHtml(item.title)} (${escapeHtml(item.channel || '-')} / ${escapeHtml(item.type || '-')})</li>`),
    '</ul>',
    '<p>Próximo passo: comparar resultado com objetivo editorial e transformar os aprendizados em ajuste do próximo lote.</p>',
  ];
}

function responseForProducts(context, mode, history) {
  return [
    modeIntro(mode),
    hasRecentContext(history) ? '' : `<p>${stateSentence(context)}</p>`,
    '<p>No catálogo, estes produtos estão disponíveis como amostra para marcação ou recomendação nos conteúdos comerciais:</p>',
    '<ul>',
    list(context.samples.products, (item) => `<li>${escapeHtml(item.name)} · ${escapeHtml(item.price || '-')} · ${escapeHtml(item.availability || '-')}</li>`),
    '</ul>',
    '<p>Próximo passo: garantir que posts de conversão tenham produto recomendado, URL de venda e coerência com o tema do post.</p>',
  ];
}

function responseForReview(context, mode, history) {
  return [
    modeIntro(mode),
    hasRecentContext(history) ? '' : `<p>${stateSentence(context)}</p>`,
    '<p>O gargalo operacional está nos assets em revisão. Eu resolveria estes antes de mexer em novos conteúdos:</p>',
    '<ul>',
    list(context.samples.pendingReview, (item) => `<li>${escapeHtml(item.assetId)} - ${escapeHtml(item.title)} (${escapeHtml(item.channel || '-')} / ${escapeHtml(item.type || '-')})</li>`),
    '</ul>',
    '<p>Próximo passo: aprovar, corrigir ou devolver cada asset. Depois disso, a fila de agendamento fica mais limpa.</p>',
  ];
}

function responseForProposal(context, mode, history) {
  return [
    modeIntro(mode || 'atlas'),
    hasRecentContext(history) ? '' : `<p>${stateSentence(context)}</p>`,
    '<p>Checkpoint de proposta: este ciclo também deve gerar um documento único com a proposta comercial, deck e relatório consolidado?</p>',
    '<p>Se sim, eu rotearia o ciclo pelo módulo de proposta e consolidaria a entrega em <code>output/&lt;client-slug&gt;/client-report.md</code>. Se não, sigo tratando apenas pesquisa, estratégia e conteúdo.</p>',
  ];
}

function responseForIntent(intent, context, mode, history) {
  if (intent === 'greeting') return responseForGreeting(context, mode);
  if (intent === 'agents') return responseForAgents(context);
  if (intent === 'atlas') return responseForAtlas(context);
  if (intent === 'campaign-status') return responseForCampaignStatus(context, mode, history);
  if (intent === 'published-breakdown') return responseForPublishedBreakdown(context, mode);
  if (intent === 'presence') return responseForPresence(context, mode);
  if (intent === 'engagement') return responseForEngagement(context, mode);
  if (intent === 'campaign-strategy') return responseForCampaignStrategy(context, mode);
  if (intent === 'articles') return responseForArticles(context, mode, history);
  if (intent === 'schedule') return responseForSchedule(context, mode, history);
  if (intent === 'monitor') return responseForMonitor(context, mode, history);
  if (intent === 'products') return responseForProducts(context, mode, history);
  if (intent === 'review') return responseForReview(context, mode, history);
  if (intent === 'proposal') return responseForProposal(context, mode, history);
  return responseForNextStep(context, mode, history);
}

export function buildChatResponse({ prompt, context, history = [], mode = 'normal' }) {
  const policy = detectPolicy(prompt);
  const intent = detectIntent(prompt);
  const activeMode = detectMode(prompt, mode);
  if (policy === 'governance_change') {
    return {
      intent: 'governance-blocked',
      mode: activeMode,
      policy,
      answerHtml: responseForGovernanceBlock(prompt).join(''),
      contextSummary: context.counts,
    };
  }
  if (policy === 'operational_action' && !normalize(prompt).includes('confirmo execução') && !normalize(prompt).includes('confirmo execucao')) {
    return {
      intent: 'action-confirmation-required',
      mode: activeMode,
      policy,
      answerHtml: responseForOperationalAction(prompt, context, intent, activeMode).join(''),
      contextSummary: context.counts,
    };
  }
  return {
    intent,
    mode: activeMode,
    policy,
    answerHtml: responseForIntent(intent, context, activeMode, history).filter(Boolean).join(''),
    contextSummary: context.counts,
  };
}

export { detectIntent, detectMode, detectPolicy };
