import { createError } from "../../shared/http/errors.js";
import { findClientById } from "../clients/clients.repository.js";
import { requireAgencyAccess } from "../tenancy/tenancy.service.js";
import { findLatestClientRecordByClientId } from "../client-record/client-record.repository.js";
import { listProductsByClientId } from "../client-products/client-products.repository.js";
import { findLatestMarketResearchByClientId } from "../market-research/market-research.repository.js";
import { findLatestProposalByClientId } from "../proposals/proposals.repository.js";
import { listLatestSnapshotByClientId } from "../social-intelligence/social-intelligence.repository.js";
import { findLatestContentPackageByClientId, findLatestContentPlanByClientId, findLatestScheduleByClientId } from "../content/content.repository.js";
import { findLatestMonitoringReportByClientId } from "../monitoring/monitoring.repository.js";
import { listApprovalsByClientId } from "../approvals/approvals.repository.js";
import { listSocialProfilesByClientId } from "../social-discovery/social-discovery.repository.js";
import { getCampaignState } from "../campaign/campaign.service.js";

type PayloadRecord = Record<string, unknown>;

type ConsultationContext = {
  campaign: Awaited<ReturnType<typeof getCampaignState>>;
  clientRecord: Awaited<ReturnType<typeof findLatestClientRecordByClientId>>;
  marketResearch: Awaited<ReturnType<typeof findLatestMarketResearchByClientId>>;
  proposal: Awaited<ReturnType<typeof findLatestProposalByClientId>>;
  snapshot: Awaited<ReturnType<typeof listLatestSnapshotByClientId>>;
  contentPlan: Awaited<ReturnType<typeof findLatestContentPlanByClientId>>;
  contentPackage: Awaited<ReturnType<typeof findLatestContentPackageByClientId>>;
  schedule: Awaited<ReturnType<typeof findLatestScheduleByClientId>>;
  monitoring: Awaited<ReturnType<typeof findLatestMonitoringReportByClientId>>;
  approvals: Awaited<ReturnType<typeof listApprovalsByClientId>>;
  profiles: Awaited<ReturnType<typeof listSocialProfilesByClientId>>;
  products: Awaited<ReturnType<typeof listProductsByClientId>>;
};

const asRecord = (value: unknown): PayloadRecord | null => (typeof value === "object" && value !== null ? (value as PayloadRecord) : null);

const asArray = (value: unknown): unknown[] => (Array.isArray(value) ? value : []);

const formatList = (items: string[], emptyLabel = "nenhum") => (items.length > 0 ? items.join(" · ") : emptyLabel);

const getArtifactStatus = (value: unknown) => {
  if (typeof value !== "string" || value.trim().length === 0) return "sem status";
  return value.trim().toLowerCase();
};

const getScheduleItems = (schedule: Awaited<ReturnType<typeof findLatestScheduleByClientId>>) => {
  const payload = asRecord(schedule?.payload_json);
  return asArray(payload?.items).length;
};

const getContentRhythm = (contentPlan: Awaited<ReturnType<typeof findLatestContentPlanByClientId>>) => {
  const payload = asRecord(contentPlan?.payload_json);
  const content = asRecord(payload?.content);
  const rhythm = content?.rhythm;
  return typeof rhythm === "string" && rhythm.trim().length > 0 ? rhythm.trim() : null;
};

const getEditorialPautas = (contentPlan: Awaited<ReturnType<typeof findLatestContentPlanByClientId>>) => {
  const payload = asRecord(contentPlan?.payload_json);
  const editorial = asRecord(payload?.editorial);
  return asArray(editorial?.pautas)
    .map((pauta) => {
      const pautaRecord = asRecord(pauta);
      return typeof pautaRecord?.title === "string" ? pautaRecord.title.trim() : "";
    })
    .filter(Boolean)
    .slice(0, 4);
};

const getMonitoringObservations = (monitoring: Awaited<ReturnType<typeof findLatestMonitoringReportByClientId>>) => {
  const payload = asRecord(monitoring?.payload_json);
  const signals = asRecord(payload?.signals);
  const interpretations = asArray(signals?.interpretations)
    .map((value) => (typeof value === "string" ? value.trim() : ""))
    .filter(Boolean)
    .slice(0, 3);
  return interpretations;
};

const getActiveProduct = (products: Awaited<ReturnType<typeof listProductsByClientId>>) => {
  return products.find((product) => product.is_active) ?? products[0] ?? null;
};

const getMarketResearchPublicSignals = (marketResearch: Awaited<ReturnType<typeof findLatestMarketResearchByClientId>>) => {
  if (!marketResearch || typeof marketResearch.payload_json !== "object" || marketResearch.payload_json === null) {
    return { sourceCount: 0, queryCount: 0, summary: null as string | null };
  }

  const payload = marketResearch.payload_json as PayloadRecord;
  const publicSignals = asRecord(payload.publicSignals);

  return {
    sourceCount: typeof publicSignals?.sourceCount === "number" && Number.isFinite(publicSignals.sourceCount) ? publicSignals.sourceCount : 0,
    queryCount: typeof publicSignals?.queryCount === "number" && Number.isFinite(publicSignals.queryCount) ? publicSignals.queryCount : 0,
    summary: typeof publicSignals?.summary === "string" && publicSignals.summary.trim().length > 0 ? publicSignals.summary.trim() : null,
  };
};

const compactList = (items: string[], limit = 2) => items.slice(0, limit);

const buildCampaignRepairSuggestion = (blockers: string[], campaignStage: string | null) => {
  const joined = blockers.join(" ").toLowerCase();

  if (joined.includes("client record")) {
    return "Revisar a base e regerar research, proposta, plano e agenda.";
  }

  if (joined.includes("market research")) {
    return "Regerar a pesquisa e atualizar proposta e plano.";
  }

  if (joined.includes("proposal")) {
    return "Regerar a proposta antes de seguir.";
  }

  if (joined.includes("content plan")) {
    return "Regerar o plano e reenfileirar pacote, agenda e aprovações.";
  }

  if (joined.includes("content production package")) {
    return "Regerar o pacote de produção antes de seguir para a agenda.";
  }

  if (joined.includes("schedule") || joined.includes("agenda")) {
    return "Regerar a agenda e liberar as aprovações.";
  }

  if (joined.includes("monitoring")) {
    return "Regerar o monitoramento após atualizar a base.";
  }

  if (joined.includes("approval")) {
    return "Fechar as aprovações para destravar a publicação.";
  }

  if (blockers.length > 0) {
    return campaignStage ? `Resolver os bloqueios para sair de ${campaignStage}.` : "Resolver os bloqueios para avançar a campanha.";
  }

  return null;
};

const buildOrganicLaunchReadiness = (input: {
  campaignStage: string;
  campaignBlockers: string[];
  hasClientRecord: boolean;
  hasMarketResearch: boolean;
  hasProposal: boolean;
  hasContentPlan: boolean;
  hasContentPackage: boolean;
  hasSchedule: boolean;
  activeProduct: { name: string; status: string } | null;
}) => {
  const { campaignStage, campaignBlockers, hasClientRecord, hasMarketResearch, hasProposal, hasContentPlan, hasContentPackage, hasSchedule, activeProduct } = input;
  const hasBase = hasClientRecord && Boolean(activeProduct);
  const hasOrganicStructure = hasMarketResearch && hasProposal && hasContentPlan;
  const hasExecutionLayer = hasContentPackage || hasSchedule;
  const hasStructuralBlockers = campaignBlockers.some((blocker) => /missing|stale|needs approval|incoherent|contradictory/i.test(blocker));

  if (!hasBase) {
    return {
      readiness: "bloqueado" as const,
      reason: !hasClientRecord ? "client record ainda não existe" : "produto foco ainda não foi definido",
      nextStep: !hasClientRecord ? "fechar intake e client record" : "definir o produto foco",
    };
  }

  if (!hasOrganicStructure || !hasExecutionLayer || hasStructuralBlockers) {
    return {
      readiness: "em preparação" as const,
      reason: hasExecutionLayer
        ? "base existe, mas o ciclo orgânico ainda precisa de pesquisa/estratégia para ganhar tração"
        : "base existe, mas a operação orgânica ainda está montando pesquisa, estratégia e pacote",
      nextStep: "fechar research, strategy e content plan",
    };
  }

  return {
    readiness: "pronto" as const,
    reason: campaignStage === "strategy" || campaignStage === "content_plan" || campaignStage === "content_production_package" || campaignStage === "schedule"
      ? "a base já sustenta o início do orgânico"
      : "o ciclo orgânico já está estruturado para execução",
    nextStep: "iniciar ou manter a cadência orgânica",
  };
};

const buildFollowUpPrompts = (input: {
  campaignStage: string | null;
  questionFocus: string;
  missingArtifacts: string[];
  pendingApprovals: number;
  contentRhythm: string | null;
  editorialPautas: string[];
  scheduleItems: number;
  monitoringObservations: string[];
  hasClientRecord: boolean;
  hasProposal: boolean;
  hasContentPlan: boolean;
  hasSchedule: boolean;
  hasMonitoring: boolean;
}) => {
  const {
    campaignStage,
    questionFocus,
    missingArtifacts,
    pendingApprovals,
    contentRhythm,
    editorialPautas,
    scheduleItems,
    monitoringObservations,
    hasClientRecord,
    hasProposal,
    hasContentPlan,
    hasSchedule,
    hasMonitoring,
  } = input;

  if (questionFocus === "approval") {
    return pendingApprovals > 0
      ? [
          "Priorizar a aprovação mais antiga",
          pendingApprovals > 1 ? "Liberar a fila restante de aprovações" : "Avançar para produção",
        ]
      : ["Manter a revisão leve e seguir para produção"];
  }

  if (questionFocus === "publish") {
    return hasSchedule
      ? [
          `Executar a agenda atual (${scheduleItems} item(ns), ritmo ${contentRhythm ?? "não informado"})`,
          editorialPautas.length > 0 ? `Usar as pautas prioritárias: ${compactList(editorialPautas).join(" · ")}` : "Conectar a pauta ao client record e à proposta",
        ]
      : ["Fechar a agenda operacional antes de publicar"];
  }

  if (questionFocus === "bottleneck") {
    return missingArtifacts.length > 0
      ? [`Fechar primeiro os artefatos ausentes: ${compactList(missingArtifacts).join(" · ")}`]
      : pendingApprovals > 0
        ? ["Liberar a governança para reduzir a latência do ciclo"]
        : ["Ajustar a cadência sem reabrir o planejamento"];
  }

  if (questionFocus === "strategy") {
    return hasClientRecord && hasProposal
      ? ["Transformar a tese em pauta editorial recorrente"]
      : ["Reforçar client record e proposta antes de ampliar o volume"];
  }

  if (questionFocus === "next") {
    return hasSchedule
      ? [
          `Avançar a campanha em ${campaignStage ?? "estado indefinido"}`,
          "Revisar apenas as pendências de governança",
        ]
      : [`Fechar os artefatos faltantes: ${compactList(missingArtifacts).join(" · ")}`];
  }

  if (questionFocus === "risk") {
    return monitoringObservations.length > 0
      ? ["Tratar as observações de monitoramento como backlog de correção"]
      : pendingApprovals > 0
        ? ["Acompanhar as aprovações diariamente até zerar a fila"]
        : ["Proteger a cadência e observar a resposta do público"];
  }

  if (hasMonitoring && hasSchedule && pendingApprovals === 0) {
    return [];
  }

  if (hasContentPlan || hasClientRecord || hasProposal) {
    return ["Fechar o ciclo atual antes de abrir nova frente"];
  }

  return ["Completar os artefatos-base para fechar a visão do cliente"];
};

const detectFocus = (text: string) => {
  const normalized = text.trim().toLowerCase();

  if (normalized.includes("gargalo") || normalized.includes("bloqueio") || normalized.includes("trav")) return "bottleneck";
  if (normalized.includes("organ")) return "organic";
  if (normalized.includes("public")) return "publish";
  if (normalized.includes("aprova")) return "approval";
  if (normalized.includes("estrat")) return "strategy";
  if (normalized.includes("próximo") || normalized.includes("proximo") || normalized.includes("agora") || normalized.includes("falta")) return "next";
  if (normalized.includes("risco")) return "risk";
  return "general";
};

const buildReasonedConsultation = (
  question: string,
  context: ConsultationContext,
  history: Array<{ role: "user" | "assistant"; content: string }>,
) => {
  const normalized = question.trim().toLowerCase();
  const clientRecordStatus = getArtifactStatus(context.clientRecord?.status);
  const proposalStatus = getArtifactStatus(context.proposal?.status);
  const contentPlanStatus = getArtifactStatus(context.contentPlan?.status);
  const scheduleStatus = getArtifactStatus(context.schedule?.status);
  const monitoringStatus = getArtifactStatus(context.monitoring?.status);
  const pendingApprovals = context.approvals.filter((approval) => approval.status === "pending").length;
  const approvedApprovals = context.approvals.filter((approval) => approval.status === "approved").length;
  const contentRhythm = getContentRhythm(context.contentPlan);
  const editorialPautas = getEditorialPautas(context.contentPlan);
  const scheduleItems = getScheduleItems(context.schedule);
  const monitoringObservations = getMonitoringObservations(context.monitoring);
  const activeProduct = getActiveProduct(context.products);
  const marketResearchPublicSignals = getMarketResearchPublicSignals(context.marketResearch);
  const campaignStage = context.campaign.state.stage;
  const campaignBlockers = context.campaign.state.blockers;
  const organicLaunch = buildOrganicLaunchReadiness({
    campaignStage,
    campaignBlockers,
    hasClientRecord: Boolean(context.clientRecord),
    hasMarketResearch: Boolean(context.marketResearch),
    hasProposal: Boolean(context.proposal),
    hasContentPlan: Boolean(context.contentPlan),
    hasContentPackage: Boolean(context.contentPackage),
    hasSchedule: Boolean(context.schedule),
    activeProduct: activeProduct ? { name: activeProduct.name, status: activeProduct.status } : null,
  });
  const missingArtifacts = [
    !context.snapshot ? "inteligência social" : null,
    !context.clientRecord ? "client record" : null,
    !context.proposal ? "proposta" : null,
    !context.contentPlan ? "plano de conteúdo" : null,
    !context.schedule ? "agenda operacional" : null,
    !context.monitoring ? "monitoramento" : null,
  ].filter((value): value is string => Boolean(value));

  const operationalBlockers: string[] = [];
  if (!context.clientRecord) operationalBlockers.push("falta client record aprovado");
  if (!context.contentPlan) operationalBlockers.push("falta plano de conteúdo");
  if (!context.schedule) operationalBlockers.push("falta agenda operacional");
  if (pendingApprovals > 0) operationalBlockers.push(`${pendingApprovals} aprovação(ões) pendente(s)`);
  if (!context.monitoring) operationalBlockers.push("monitoramento ainda não foi fechado");

  const sourceTrail = [
    `${context.snapshot ? "Inteligência social disponível" : "Sem snapshot social"}`,
    `${context.marketResearch ? `Pesquisa de mercado v${context.marketResearch.version}` : "Sem pesquisa de mercado"}`,
    marketResearchPublicSignals.sourceCount > 0
      ? `Brave Search ${marketResearchPublicSignals.sourceCount} fonte(s) em ${marketResearchPublicSignals.queryCount} consulta(s)`
      : "Brave Search aguardando chave",
    `${context.clientRecord ? `Client record v${context.clientRecord.version} (${clientRecordStatus})` : "Sem client record"}`,
    `${context.proposal ? `Proposta v${context.proposal.version} (${proposalStatus})` : "Sem proposta"}`,
    `${context.contentPlan ? `Plano v${context.contentPlan.version} (${contentPlanStatus})` : "Sem plano de conteúdo"}`,
    `${context.schedule ? `Agenda v${context.schedule.version} (${scheduleStatus})` : "Sem agenda operacional"}`,
    `${context.monitoring ? `Monitoramento (${monitoringStatus})` : "Sem monitoramento"}`,
    `${activeProduct ? `Produto foco ${activeProduct.name} (${activeProduct.status})` : "Sem produto foco"}`,
  ];

  const threadFocus = [...history]
    .reverse()
    .map((message) => detectFocus(message.content))
    .find((focus) => focus !== "general");

  const questionFocus = detectFocus(normalized) !== "general" ? detectFocus(normalized) : threadFocus ?? "general";
  const threadSummary =
    history.length > 0
      ? `Memória ativa: ${history.length} turno(s) recentes, foco atual ${questionFocus}.`
      : "Memória ativa: primeiro turno da conversa.";

  let answer = "";
  const recommendations: string[] = [];
  const risks: string[] = [];

  switch (questionFocus) {
    case "approval":
      answer =
        pendingApprovals > 0
          ? `O gargalo atual está na governança: há ${pendingApprovals} aprovação(ões) pendente(s) e ${approvedApprovals} já liberada(s).`
          : "A governança está limpa no momento. Não vejo pendências de aprovação bloqueando a execução.";
      recommendations.push(
        pendingApprovals > 0 ? "Priorize a fila de aprovação mais antiga antes de expandir a cadência." : "Mantenha a revisão leve e avance para produção.",
        context.schedule ? "Use a agenda operacional como trilho principal para não perder ritmo." : "Feche a agenda operacional antes de escalar produção.",
      );
      risks.push(
        pendingApprovals > 0 ? "Pendências podem atrasar publicação e revisão." : "O risco principal é sair da cadência e perder consistência.",
      );
      break;
    case "publish":
      answer = context.schedule
        ? `A campanha está em ${campaignStage}. A publicação já tem trilho: ${scheduleItems} item(ns) na agenda, ritmo ${contentRhythm ?? "não informado"} e ${editorialPautas.length} pauta(s) editorial(is) priorizada(s).`
        : "Ainda não há uma agenda operacional pronta para publicação.";
      recommendations.push(
        context.schedule ? "Publique seguindo a agenda atual e mantenha o mesmo ritmo por pelo menos um ciclo." : "Feche a agenda operacional antes de tentar publicar em volume.",
        editorialPautas.length > 0 ? `Use as pautas prioritárias: ${formatList(editorialPautas, "nenhuma pauta")}.` : "Crie pautas editoriais a partir do client record e da proposta.",
      );
      risks.push(
        context.schedule ? "Se a agenda virar só fila, a consistência de mensagem cai." : "Sem agenda, a execução vira improviso.",
      );
      break;
    case "bottleneck":
      answer = operationalBlockers.length > 0 ? `O principal gargalo hoje é ${formatList(operationalBlockers, "nenhum")}.` : "Não vejo gargalo estrutural relevante no momento.";
      recommendations.push(
        missingArtifacts.length > 0 ? `Feche primeiro os artefatos ausentes: ${formatList(missingArtifacts, "nenhum")}.` : "Siga para a calibração fina do conteúdo e da distribuição.",
        pendingApprovals > 0 ? "Liberar a governança reduz a latência do ciclo." : "Mantenha a produção em lotes pequenos para preservar o padrão.",
      );
      risks.push(
        missingArtifacts.length > 0 ? "Pular etapa faz o sistema perder coerência entre diagnóstico e execução." : "A pressão operacional pode esconder um desvio de estratégia.",
      );
      break;
    case "strategy":
      answer =
        context.proposal && context.clientRecord
          ? `A estratégia atual está alinhada ao client record v${context.clientRecord.version} e à proposta v${context.proposal.version}. O próximo ajuste é transformar essa tese em consistência editorial e prova recorrente.`
          : "A estratégia ainda depende de client record e proposta mais claros para virar uma tese operacional confiável.";
      recommendations.push(
        context.proposal ? "Use a tese da proposta como eixo das próximas pautas." : "Revise a proposta antes de avançar em volume de conteúdo.",
        context.clientRecord ? "Conecte os temas editoriais aos problemas que o client record já mapeou." : "Feche o client record para ganhar direção estratégica.",
      );
      risks.push(
        context.proposal ? "Sem disciplina de pauta, a estratégia vira só discurso." : "Sem tese, o conteúdo tende a ficar reativo.",
      );
      break;
    case "organic":
      answer = `Início do orgânico: ${organicLaunch.readiness}. ${organicLaunch.reason}. Próximo passo: ${organicLaunch.nextStep}.`;
      recommendations.push(
        organicLaunch.readiness === "bloqueado"
          ? organicLaunch.nextStep
          : "Mantenha o produto foco e feche a base antes de aumentar a cadência.",
        organicLaunch.readiness === "pronto"
          ? "Abra o primeiro ciclo com cadência simples e repetível."
          : "Feche research, strategy e content plan para sair da preparação.",
      );
      risks.push(
        organicLaunch.readiness === "bloqueado"
          ? "Iniciar sem base gera retrabalho e desalinha o produto."
          : "Acelerar antes da hora tende a travar o ciclo na execução.",
      );
      break;
    case "next":
      answer = context.schedule
        ? `O próximo passo mais eficiente é executar a agenda em cima das ${scheduleItems} entradas já planejadas e revisar as pendências de governança em paralelo.`
        : `O próximo passo é fechar os artefatos faltantes: ${formatList(missingArtifacts, "nenhum")}.`;
      recommendations.push(
        context.schedule ? "Execute a agenda atual sem alterar o foco do ciclo." : "Finalize os artefatos-base antes de abrir a frente de publicação.",
        pendingApprovals > 0 ? "Resolva as aprovações para liberar a fila de execução." : "Depois disso, parta para monitoramento e aprendizagem.",
      );
      risks.push(context.schedule ? "Alterar o plano toda hora reduz velocidade e consistência." : "Pular etapa gera retrabalho.");
      break;
    case "risk":
      answer =
        monitoringObservations.length > 0
          ? `Os riscos mais claros estão no monitoramento: ${monitoringObservations.join(" | ")}.`
          : pendingApprovals > 0
            ? `O risco mais imediato está na governança, com ${pendingApprovals} pendência(s) aberta(s).`
            : "No momento, o risco principal é operacional: manter consistência entre client record, conteúdo e agenda.";
      recommendations.push(
        monitoringObservations.length > 0 ? "Trate as interpretações de monitoramento como backlog de correção." : "Monitore se a execução está respeitando a proposta e o client record.",
        pendingApprovals > 0 ? "Acompanhe as aprovações diariamente até zerar a fila." : "Reforce a cadência antes de aumentar a ambição do ciclo.",
      );
      risks.push("Perder o vínculo entre diagnóstico e execução enfraquece o consultor e o resultado final.");
      break;
    default:
      answer = context.monitoring
        ? `O sistema está operando com ${context.profiles.length} perfil(is), ${context.approvals.length} aprovação(ões) e ${scheduleItems} item(ns) de agenda. O consultor vê mais valor em proteger a cadência do que em abrir novas frentes agora.`
        : `Tenho contexto suficiente para orientar, mas ainda faltam ${formatList(missingArtifacts, "nenhum")}.`;
      recommendations.push(
        context.monitoring ? "Proteja a cadência atual e observe a resposta do público." : "Complete os artefatos que faltam para a visão ficar fechada.",
        context.contentPlan ? "Ajuste apenas o necessário no plano, sem reabrir o ciclo inteiro." : "Feche o planejamento antes de expandir o escopo.",
      );
      risks.push(
        context.monitoring ? "Adicionar mais frentes agora pode diluir foco." : "A leitura ficará incompleta enquanto faltar contexto estrutural.",
      );
      break;
  }

  const productFocusLine = activeProduct
    ? `Produto foco atual: ${activeProduct.name} (${activeProduct.status}).`
    : "Produto foco atual: nenhum definido.";

  const publicSignalsLine =
    marketResearchPublicSignals.sourceCount > 0
      ? `Sinais públicos via Brave Search: ${marketResearchPublicSignals.sourceCount} fonte(s) em ${marketResearchPublicSignals.queryCount} consulta(s).`
      : "Sinais públicos via Brave Search não foram usados neste ciclo.";

  const blockerLine = campaignBlockers.length > 0 ? `Bloqueio atual da campanha: ${formatList(campaignBlockers, "nenhum")}.` : "Nenhum bloqueio estrutural de campanha no momento.";
  const repairSuggestion = buildCampaignRepairSuggestion(campaignBlockers, campaignStage);

  answer = `${blockerLine} ${productFocusLine} ${publicSignalsLine} ${answer}`.trim();

  if (repairSuggestion) {
    recommendations.unshift(repairSuggestion);
  }

  return {
    answer,
    summary:
      `${activeProduct ? `Produto foco: ${activeProduct.name}. ` : ""}` +
      `${campaignBlockers.length > 0 ? `Bloqueios: ${formatList(campaignBlockers, "nenhum")}. ` : ""}` +
      (context.monitoring && context.schedule
        ? "Consultoria operacional com base no ciclo fechado mais recente."
        : "Consultoria operacional com base no estado atual do cliente."),
    threadSummary,
    recommendations,
    risks,
    nextQuestions: buildFollowUpPrompts({
      campaignStage,
      questionFocus,
      missingArtifacts,
      pendingApprovals,
      contentRhythm,
      editorialPautas,
      scheduleItems,
      monitoringObservations,
      hasClientRecord: Boolean(context.clientRecord),
      hasProposal: Boolean(context.proposal),
      hasContentPlan: Boolean(context.contentPlan),
      hasSchedule: Boolean(context.schedule),
      hasMonitoring: Boolean(context.monitoring),
    }).concat(repairSuggestion ? [repairSuggestion] : []),
    sources: sourceTrail,
    context: {
      campaignStage,
      campaignBlockers,
      organicLaunchReadiness: organicLaunch.readiness,
      organicLaunchReason: organicLaunch.reason,
      organicLaunchNextStep: organicLaunch.nextStep,
      missingArtifacts,
      pendingApprovals,
      approvedApprovals,
      contentRhythm,
      scheduleItems,
      editorialPautas,
      monitoringObservations,
      productCount: context.products.length,
      activeProductName: activeProduct?.name ?? null,
      activeProductStatus: activeProduct?.status ?? null,
    },
  };
};

export const consultClient = async (input: {
  userId: string;
  agencyId: string;
  clientId: string;
  question?: string;
  history?: Array<{ role: "user" | "assistant"; content: string }>;
}) => {
  await requireAgencyAccess(input.userId, input.agencyId);
  const client = await findClientById(input.agencyId, input.clientId);

  if (!client) {
    throw createError("NOT_FOUND", "Client not found", 404);
  }

  const [campaign, clientRecord, marketResearch, proposal, snapshot, contentPlan, contentPackage, schedule, monitoring, approvals, profiles, products] = await Promise.all([
    getCampaignState({
      userId: input.userId,
      agencyId: input.agencyId,
      clientId: input.clientId,
    }),
    findLatestClientRecordByClientId(input.clientId),
    findLatestMarketResearchByClientId(input.clientId),
    findLatestProposalByClientId(input.clientId),
    listLatestSnapshotByClientId(input.clientId),
    findLatestContentPlanByClientId(input.clientId),
    findLatestContentPackageByClientId(input.clientId),
    findLatestScheduleByClientId(input.clientId),
    findLatestMonitoringReportByClientId(input.clientId),
    listApprovalsByClientId(input.clientId),
    listSocialProfilesByClientId(input.clientId),
    listProductsByClientId(input.clientId),
  ]);

  const context: ConsultationContext = {
    campaign,
    clientRecord,
    marketResearch,
    proposal,
    snapshot,
    contentPlan,
    contentPackage,
    schedule,
    monitoring,
    approvals,
    profiles,
    products,
  };

  const question = input.question?.trim() || "O que precisa ser decidido agora?";
  const response = buildReasonedConsultation(question, context, input.history ?? []);

  return {
    client,
    question,
    ...response,
  };
};
