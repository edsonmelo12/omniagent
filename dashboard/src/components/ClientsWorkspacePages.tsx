import * as React from "react";
import { useEffect, useMemo, useState } from "react";
import { AppIcon } from "@/components/AppIcon";
import { LoadingPanel } from "@/components/LoadingPanel";
import { EmptyStateNotice } from "@/components/EmptyStateNotice";
import { lazyNamed } from "@/lib/lazyNamedComponent";
import { getClientRelationshipLabel } from "@/lib/clientRelationships";
import { backendApi } from "@/lib/backendApi";
import { readSelectedClientId, writeSelectedClientId } from "@/lib/clientSelection";
import { ptBR } from "@/i18n/pt-BR";
import type { Client, Product } from "@/types/backend";
import type { ContentResult } from "@/lib/backendApi";

type WorkspaceScreen = "dashboard" | "clients" | "client-form";

type WorkspaceShellProps = {
  activeScreen: WorkspaceScreen;
  onNavigateDashboard: () => void;
  onNavigateClients: () => void;
  onNavigateCreate: () => void;
  children: React.ReactNode;
  topbar: React.ReactNode;
};

type ClientManagerPageProps = {
  onNavigateDashboard: () => void;
  onCreateClient: () => void;
  onEditClient: (clientId: string) => void;
};

type ClientFormPageProps = {
  clientId: string | null;
  onNavigateDashboard: () => void;
  onNavigateClients: () => void;
  onPersistClientId: (clientId: string | null) => void;
};

type DraftProduct = {
  name: string;
  category: string;
  offerType: string;
  priceLabel: string;
  promise: string;
  problemSolved: string;
  audience: string;
  status: Product["status"];
  priority: string;
  landingUrl: string;
  proofPoints: string;
  notes: string;
  focus: boolean;
};

const EMPTY_DRAFT_PRODUCT: DraftProduct = {
  name: "",
  category: "",
  offerType: "",
  priceLabel: "",
  promise: "",
  problemSolved: "",
  audience: "",
  status: "draft",
  priority: "0",
  landingUrl: "",
  proofPoints: "",
  notes: "",
  focus: false,
};

const statusLabels = ptBR.dashboard.products.status;
const ClientProductsPanel = lazyNamed(() => import("@/components/ClientProductsPanel"), "ClientProductsPanel");

const asRecord = (value: unknown): Record<string, unknown> | null => (typeof value === "object" && value !== null ? (value as Record<string, unknown>) : null);
const asString = (value: unknown): string | null => (typeof value === "string" && value.trim().length > 0 ? value.trim() : null);
const asArray = (value: unknown): unknown[] => (Array.isArray(value) ? value : []);

const profileSummary = (profile: Record<string, unknown> | null, fallback: string) => asString(profile?.summary) ?? fallback;
const profileVersion = (profile: Record<string, unknown> | null) => {
  const value = profile?.version;
  return typeof value === "number" && Number.isFinite(value) ? value : null;
};

const briefSnapshot = (record: Record<string, unknown> | null) => {
  const payload = asRecord(record?.payload_json) ?? record;
  const client = asRecord(payload?.client);
  const contact = asRecord(payload?.contact);
  const visualIdentity = asRecord(payload?.visualIdentity);
  const productsPolicy = asRecord(payload?.productsPolicy);

  return {
    summary: asString((payload?.narrative as Record<string, unknown> | undefined)?.summary) ?? asString(payload?.summary) ?? null,
    recommendedPositioning:
      asString((payload?.narrative as Record<string, unknown> | undefined)?.recommendedPositioning) ??
      asString((payload?.offerRecommendation as Record<string, unknown> | undefined)?.focus) ??
      null,
    websiteUrl: asString(client?.websiteUrl) ?? null,
    segment: asString(client?.segment) ?? null,
    note: asString(payload?.note) ?? null,
    contactEmail: asString(contact?.email) ?? null,
    visualPalette: asArray(visualIdentity?.palette).map((value) => asString(value)).filter((value): value is string => Boolean(value)),
    productsByDemand: typeof productsPolicy?.productsByDemand === "boolean" ? productsPolicy.productsByDemand : null,
  };
};

const brandSnapshot = (profile: Record<string, unknown> | null) => {
  const confirmed = asRecord(profile?.confirmed_json) ?? profile;
  const inferred = asRecord(profile?.inferred_json);
  const visualPalette = asArray(confirmed?.visualPalette ?? inferred?.visualPalette)
    .map((value) => asString(value))
    .filter((value): value is string => Boolean(value));
  const socialProfiles = asArray(confirmed?.socialProfiles)
    .map((value) => asRecord(value))
    .filter((value): value is Record<string, unknown> => Boolean(value));

  return {
    websiteTitle: asString(confirmed?.websiteTitle) ?? asString(confirmed?.website) ?? null,
    contactEmail: asString(confirmed?.contactEmail) ?? null,
    logoUrl: asString(confirmed?.logoUrl) ?? null,
    visualPalette,
    socialProfiles,
  };
};

const offerPrimaryProduct = (content: ContentResult | null) => content?.primaryProduct ?? null;
const offerProfileRecord = (content: ContentResult | null) => asRecord(content?.offerProfile);
const brandProfileRecord = (content: ContentResult | null) => asRecord(content?.brandProfile);

export function WorkspaceShell({ activeScreen, onNavigateDashboard, onNavigateClients, onNavigateCreate, children, topbar }: WorkspaceShellProps) {
  return (
    <div className="dashboard-shell" style={shellStyle}>
      <aside className="dashboard-sidebar" style={sidebarStyle}>
        <div style={brandStyle}>
          <div style={brandMarkStyle}>O</div>
          <div>
            <div style={brandTitleStyle}>OmniAgent</div>
            <div style={brandEyebrowStyle}>{ptBR.dashboard.brandEyebrow}</div>
          </div>
        </div>

        <nav style={navStyle}>
          <button
            type="button"
            className={activeScreen === "dashboard" ? "nav-item nav-item--active" : "nav-item"}
            style={activeScreen === "dashboard" ? navActiveStyle : navItemStyle}
            onClick={onNavigateDashboard}
          >
            {activeScreen === "dashboard" ? <span className="nav-indicator" /> : null}
            <AppIcon name="space_dashboard" style={navIconStyle} />
            <span>{ptBR.dashboard.sidebar.dashboard}</span>
          </button>
          <button
            type="button"
            className={activeScreen === "clients" ? "nav-item nav-item--active" : "nav-item"}
            style={activeScreen === "clients" ? navActiveStyle : navItemStyle}
            onClick={onNavigateClients}
          >
            {activeScreen === "clients" ? <span className="nav-indicator" /> : null}
            <AppIcon name="groups" style={navIconStyle} />
            <span>{ptBR.dashboard.sidebar.clientManager}</span>
          </button>
          <button
            type="button"
            className={activeScreen === "client-form" ? "nav-item nav-item--active" : "nav-item"}
            style={activeScreen === "client-form" ? navActiveStyle : navItemStyle}
            onClick={onNavigateCreate}
          >
            {activeScreen === "client-form" ? <span className="nav-indicator" /> : null}
            <AppIcon name="person_add" style={navIconStyle} />
            <span>Cliente novo</span>
          </button>
        </nav>

        <div style={sidebarFooterStyle}>
          <button type="button" className="action-button action-button--primary" style={primaryActionStyle} onClick={onNavigateCreate}>
            <AppIcon name="add" style={actionIconStyle} />
            {ptBR.dashboard.sidebar.newCampaign}
          </button>
          <div style={supportRowStyle}>
            <button type="button" className="support-link" style={supportLinkStyle} onClick={onNavigateDashboard}>
              <AppIcon name="dashboard" style={supportIconStyle} />
              <span>Visão geral</span>
            </button>
            <button type="button" className="support-link" style={supportLinkStyle} onClick={onNavigateClients}>
              <AppIcon name="help" style={supportIconStyle} />
              <span>{ptBR.dashboard.sidebar.support}</span>
            </button>
          </div>
        </div>
      </aside>

      <div style={contentStyle}>
        {topbar}
        {children}
      </div>
    </div>
  );
}

export function ClientManagerPage({ onNavigateDashboard, onCreateClient, onEditClient }: ClientManagerPageProps) {
  const [search, setSearch] = useState("");
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deletingClientId, setDeletingClientId] = useState<string | null>(null);
  const [selectedClientId, setSelectedClientId] = useState(() => readSelectedClientId());
  const [selectedProducts, setSelectedProducts] = useState<Product[]>([]);
  const [selectedProductsLoading, setSelectedProductsLoading] = useState(false);
  const [selectedProductsError, setSelectedProductsError] = useState<string | null>(null);
  const [selectedContent, setSelectedContent] = useState<ContentResult | null>(null);
  const session = backendApi.getSession();
  const anonymousSessionActive = session.mode === "anonymous";

  const loadClients = async () => {
    setLoading(true);
    setError(null);

    try {
      const { clients: nextClients } = await backendApi.loadAccessibleClients();
      setClients(nextClients);

      const stored = readSelectedClientId();
      const nextSelectedId = nextClients.find((client) => client.id === stored)?.id ?? nextClients[0]?.id ?? "";
      setSelectedClientId(nextSelectedId);
      if (nextSelectedId) {
        writeSelectedClientId(nextSelectedId);
      }
    } catch (loadError) {
      setClients([]);
      setError(loadError instanceof Error ? loadError.message : "Não foi possível carregar clientes.");
    } finally {
      setLoading(false);
    }
  };

  const enableAnonymousMode = async () => {
    try {
      setLoading(true);
      setError(null);
      await backendApi.ensureAnonymousSession();
      await loadClients();
    } catch (anonymousError) {
      setError(anonymousError instanceof Error ? anonymousError.message : "Não foi possível ativar o modo anônimo.");
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadClients();
  }, []);

  const selectedClient = useMemo(() => clients.find((client) => client.id === selectedClientId) ?? clients[0] ?? null, [clients, selectedClientId]);

  useEffect(() => {
    let cancelled = false;

    const loadSelectedProducts = async () => {
      if (!selectedClient?.id) {
        setSelectedProducts([]);
        setSelectedProductsError(null);
        setSelectedContent(null);
        return;
      }

      setSelectedProductsLoading(true);
      setSelectedProductsError(null);

      try {
        const [result, content] = await Promise.all([
          backendApi.loadProducts(selectedClient.id),
          backendApi.loadContent(selectedClient.id).catch(() => null),
        ]);
        if (cancelled) return;
        setSelectedProducts(result.products);
        setSelectedContent(content);
      } catch (productError) {
        if (cancelled) return;
        setSelectedProducts([]);
        setSelectedContent(null);
        setSelectedProductsError(productError instanceof Error ? productError.message : "Não foi possível carregar o catálogo.");
      } finally {
        if (!cancelled) {
          setSelectedProductsLoading(false);
        }
      }
    };

    void loadSelectedProducts();

    return () => {
      cancelled = true;
    };
  }, [selectedClient?.id]);

  const filteredClients = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return clients;

    return clients.filter((client) => {
      return [client.name, client.slug, client.segment ?? "", client.website_url ?? "", client.parent_client_name ?? ""].some((value) =>
        value.toLowerCase().includes(term),
      );
    });
  }, [clients, search]);

  const activeProduct = useMemo(() => selectedProducts.find((product) => product.is_active) ?? selectedProducts[0] ?? null, [selectedProducts]);
  const clientBrief = briefSnapshot(selectedContent?.clientRecord ? asRecord(selectedContent.clientRecord) : null);
  const brandProfile = brandProfileRecord(selectedContent);
  const brandSignals = brandSnapshot(brandProfile);
  const offerProfile = offerProfileRecord(selectedContent);
  const offerProduct = offerPrimaryProduct(selectedContent);
  const selectedClientRelationshipLabel = getClientRelationshipLabel(selectedClient);

  const onSelectClient = (client: Client) => {
    setSelectedClientId(client.id);
    writeSelectedClientId(client.id);
  };

  const handleDeleteClient = async (client: Client) => {
    if (deletingClientId === client.id) return;

    const confirmed = window.confirm(`Excluir o cliente "${client.name}"? Os produtos e artefatos ligados a ele também serão removidos.`);
    if (!confirmed) return;

    setDeletingClientId(client.id);
    setError(null);

    try {
      await backendApi.deleteClient(client.id);
      await loadClients();
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : "Não foi possível excluir o cliente.");
    } finally {
      setDeletingClientId(null);
    }
  };

  const clientCount = clients.length;
  const activeCount = clients.filter((client) => client.status === "active").length;
  const withSiteCount = clients.filter((client) => Boolean(client.website_url)).length;

  return (
    <WorkspaceShell
      activeScreen="clients"
      onNavigateDashboard={onNavigateDashboard}
      onNavigateClients={() => undefined}
      onNavigateCreate={onCreateClient}
      topbar={
        <header className="dashboard-topbar" style={topbarStyle}>
          <div style={topbarLeftStyle}>
            <div style={searchShellStyle}>
              <AppIcon name="search" style={searchIconStyle} />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Pesquisar clientes, segmentos ou sites..."
                style={searchInputStyle}
              />
            </div>
            <nav style={topbarNavStyle}>
              <button type="button" className="topbar-link" style={topbarLinkStyle} onClick={loadClients}>
                Atualizar
              </button>
              <button type="button" className="topbar-link" style={topbarLinkStyle} onClick={onNavigateDashboard}>
                Dashboard
              </button>
            </nav>
          </div>

          <div style={topbarRightStyle}>
            <button type="button" className="topbar-link" style={anonymousSessionActive ? anonymousModeActiveStyle : topbarLinkStyle} onClick={enableAnonymousMode}>
              <AppIcon name="person_search" style={topbarLinkIconStyle} />
              {anonymousSessionActive ? "Modo anônimo ativo" : "Entrar como anônimo"}
            </button>
            <button type="button" className="action-button" style={secondaryActionStyle} onClick={onCreateClient}>
              <AppIcon name="person_add" style={actionIconStyle} />
              Novo cliente
            </button>
            <button type="button" className="action-button" style={primaryActionStyle} onClick={loadClients}>
              Recarregar
            </button>
          </div>
        </header>
      }
    >
      <main className="soft-scrollbar" style={mainStyle}>
        <section className="section-card animate-rise-in" style={headerCardStyle}>
          <div style={headerCardTextStyle}>
            <div style={eyebrowStyle}>{ptBR.dashboard.client.eyebrow}</div>
            <h1 style={pageTitleStyle}>Gerenciar Clientes</h1>
            <p style={pageSubtitleStyle}>
              Acompanhe o portfólio, identifique o cliente em foco e entre direto no onboarding quando precisar ajustar o contexto.
            </p>
          </div>

          <div style={statRowStyle}>
            <StatTile label="Clientes" value={clientCount} tone="indigo" />
            <StatTile label="Ativos" value={activeCount} tone="green" />
            <StatTile label="Com site" value={withSiteCount} tone="violet" />
          </div>
        </section>

        <section style={filterBarStyle}>
          <div style={filterPillsStyle}>
            <button type="button" style={activeFilterStyle}>Todos</button>
            <button type="button" style={filterStyle}>Ativos</button>
            <button type="button" style={filterStyle}>Com site</button>
            <button type="button" style={filterStyle}>Sem foco</button>
          </div>
          <div style={filterMetaStyle}>
            <AppIcon name="filter_list" style={filterIconStyle} />
            <span>Visão baseada no cadastro real e no produto ativo.</span>
          </div>
        </section>

        <div style={gridLayoutStyle}>
          <section className="section-card animate-rise-in" style={listColumnStyle}>
            <div style={panelHeaderStyle}>
              <div>
                <div style={eyebrowStyle}>Carteira</div>
                <div style={panelTitleStyle}>Clientes cadastrados</div>
              </div>
              <button type="button" className="action-button" style={ghostActionStyle} onClick={onCreateClient}>
                <AppIcon name="add" style={actionIconStyle} />
                Novo cliente
              </button>
            </div>

            {error ? <div style={errorStyle}>{error}</div> : null}

            {loading ? (
              <EmptyStateNotice message="Carregando clientes..." />
            ) : filteredClients.length === 0 ? (
              <EmptyStateNotice message={ptBR.dashboard.client.empty} />
            ) : (
              <div style={clientGridStyle}>
                {filteredClients.map((client) => {
                  const isSelected = client.id === selectedClient?.id;
                  const relationshipLabel = getClientRelationshipLabel(client);

                  return (
                    <button
                      key={client.id}
                      type="button"
                      onClick={() => onSelectClient(client)}
                      style={isSelected ? clientCardSelectedStyle : clientCardStyle}
                    >
                      <div style={clientCardTopStyle}>
                        <div style={clientBadgeStyle}>{clientAvatarInitials(client)}</div>
                        <div style={clientCardTextStyle}>
                          <div style={clientCardNameStyle}>{client.name}</div>
                          {relationshipLabel ? <div style={clientCardRelationshipStyle}>{relationshipLabel}</div> : null}
                        </div>
                        <span style={clientStatusStyle(client.status)}>{client.status}</span>
                      </div>
                      <div style={clientCardDetailsStyle}>
                        <div>
                          <div style={clientDetailLabelStyle}>Site</div>
                          <div style={clientDetailValueStyle}>{client.website_url ?? "Sem site"}</div>
                        </div>
                        <div>
                          <div style={clientDetailLabelStyle}>Atualizado</div>
                          <div style={clientDetailValueStyle}>{formatDate(client.updated_at)}</div>
                        </div>
                      </div>
                      <div style={clientCardFooterStyle}>
                        <span style={clientPillStyle}>{client.slug}</span>
                        <span style={clientPillStyle}>Abrir cadastro</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </section>

          <aside className="section-card animate-rise-in" style={detailColumnStyle}>
            <div style={detailHeaderStyle}>
              <div>
                <div style={eyebrowStyle}>Cliente em foco</div>
                <div style={panelTitleStyle}>{selectedClient?.name ?? "Selecione um cliente"}</div>
              </div>
              <button type="button" className="action-button" style={primaryActionStyle} onClick={() => selectedClient && onEditClient(selectedClient.id)} disabled={!selectedClient}>
                <AppIcon name="edit" style={actionIconStyle} />
                Editar
              </button>
            </div>

            {selectedClient ? (
              <div style={detailStackStyle}>
                <div style={focusCardStyle}>
                  <div style={focusAvatarStyle}>{clientAvatarInitials(selectedClient)}</div>
                  <div style={{ minWidth: 0 }}>
                    <div style={focusNameStyle}>{selectedClient.name}</div>
                    <div style={focusMetaStyle}>
                      {selectedClient.segment ?? "Sem segmento"} · {selectedClient.website_url ?? "Sem site"}
                    </div>
                    {selectedClientRelationshipLabel ? <div style={focusRelationshipStyle}>{selectedClientRelationshipLabel}</div> : null}
                  </div>
                </div>

                <div style={detailMetricsStyle}>
                  <MetricBox label="Produtos" value={selectedProducts.length} />
                  <MetricBox label="Foco" value={activeProduct?.name ?? "Sem foco"} wide />
                </div>

                <div style={detailDescriptionStyle}>
                  <div style={detailDescriptionLabelStyle}>Observações</div>
                  <p style={detailDescriptionValueStyle}>{selectedClient.notes ?? "Nenhuma observação registrada."}</p>
                </div>

                <div style={detailDescriptionStyle}>
                  <div style={detailDescriptionLabelStyle}>Oferta foco</div>
                  <p style={detailDescriptionValueStyle}>
                    {activeProduct
                      ? `${activeProduct.name} · ${activeProduct.status} · ${activeProduct.price_label ?? "sem preço"}`
                      : "Ainda não há oferta foco definida."}
                  </p>
                </div>

                <div style={contextGridStyle}>
                  <div style={contextCardStyle}>
                    <div style={contextLabelStyle}>Marca</div>
                    <div style={contextValueStyle}>{profileSummary(brandProfile, "Sem brand profile consolidado")}</div>
                    <div style={contextHintStyle}>
                      {profileVersion(brandProfile) !== null
                        ? `v${profileVersion(brandProfile)} · ${asString(brandProfile?.status) ?? "sem status"}`
                        : "Aguardando brand profile"}
                    </div>
                  </div>
                  <div style={contextCardStyle}>
                    <div style={contextLabelStyle}>Oferta ativa</div>
                    <div style={contextValueStyle}>{profileSummary(offerProfile, "Sem offer profile consolidado")}</div>
                    <div style={contextHintStyle}>
                      {offerProduct
                        ? `${offerProduct.name} · ${offerProduct.status}`
                        : "Aguardando oferta ativa"}
                    </div>
                  </div>
                </div>

                <div style={detailDescriptionStyle}>
                  <div style={detailDescriptionLabelStyle}>Brief do cliente</div>
                  <p style={detailDescriptionValueStyle}>
                    {clientBrief.summary ?? "Sem briefing consolidado."}
                  </p>
                  <p style={detailDescriptionValueStyle}>
                    {clientBrief.recommendedPositioning ?? "Posicionamento ainda não definido"} ·{" "}
                    {clientBrief.websiteUrl ?? "Sem site"} · {clientBrief.segment ?? "Sem segmento"}
                  </p>
                  <p style={detailDescriptionValueStyle}>
                    {clientBrief.contactEmail ?? "Sem e-mail confirmado"} ·{" "}
                    {clientBrief.visualPalette.length > 0 ? `Paleta ${clientBrief.visualPalette.join(" · ")}` : "Sem paleta confirmada"} ·{" "}
                    {clientBrief.productsByDemand === true ? "Produtos sob demanda" : clientBrief.productsByDemand === false ? "Catálogo fixo" : "Produtos não informados"}
                  </p>
                </div>

                {brandSignals ? (
                  <div style={detailDescriptionStyle}>
                    <div style={detailDescriptionLabelStyle}>Sinais de marca confirmados</div>
                    <p style={detailDescriptionValueStyle}>
                      {brandSignals.websiteTitle ?? "Sem site"} · {brandSignals.contactEmail ?? "Sem e-mail confirmado"} ·{" "}
                      {brandSignals.logoUrl ? "logo confirmado" : "logo não confirmado"}
                    </p>
                    <p style={detailDescriptionValueStyle}>
                      {brandSignals.visualPalette.length > 0
                        ? `Paleta ${brandSignals.visualPalette.join(" · ")}`
                        : "Sem paleta confirmada"}{" "}
                      · {brandSignals.socialProfiles.length} rede(s) confirmada(s)
                    </p>
                  </div>
                ) : null}

                <div style={detailDescriptionStyle}>
                  <div style={detailDescriptionLabelStyle}>Cobertura de ofertas</div>
                  <p style={detailDescriptionValueStyle}>
                    {selectedContent?.offerProfiles?.length ?? 0} perfil(is) de oferta para {selectedContent?.primaryProduct?.name ?? activeProduct?.name ?? "a oferta foco"}.
                  </p>
                </div>

                <div style={detailActionsStyle}>
                  <button type="button" className="action-button" style={primaryActionStyle} onClick={() => onEditClient(selectedClient.id)}>
                    <AppIcon name="edit" style={actionIconStyle} />
                    Editar cadastro
                  </button>
                  <button type="button" className="action-button" style={secondaryActionStyle} onClick={onCreateClient}>
                    <AppIcon name="person_add" style={actionIconStyle} />
                    Novo cliente
                  </button>
                  <button
                    type="button"
                    className="action-button"
                    style={dangerActionStyle}
                    onClick={() => void handleDeleteClient(selectedClient)}
                    disabled={deletingClientId === selectedClient.id}
                  >
                    {deletingClientId === selectedClient.id ? "Excluindo..." : "Excluir cliente"}
                  </button>
                </div>

                <div style={productSectionStyle}>
                  <div style={productSectionHeaderStyle}>
                    <div>
                      <div style={eyebrowStyle}>{ptBR.dashboard.products.eyebrow}</div>
                      <div style={panelTitleStyle}>{ptBR.dashboard.products.title}</div>
                    </div>
                    <span style={productCountPillStyle}>{selectedProducts.length}</span>
                  </div>

                  {selectedProductsLoading ? (
                    <EmptyStateNotice message="Carregando produtos..." />
                  ) : selectedProductsError ? (
                    <div style={errorStyle}>{selectedProductsError}</div>
                  ) : selectedProducts.length === 0 ? (
                    <EmptyStateNotice message={ptBR.dashboard.products.empty} />
                  ) : (
                    <div style={productListStyle}>
                      {selectedProducts.map((product) => (
                        <article key={product.id} style={productItemStyle(product.is_active)}>
                          <div style={productItemHeaderStyle}>
                            <div>
                              <div style={productItemNameStyle}>{product.name}</div>
                              <div style={productItemMetaStyle}>
                                {product.category ?? "Sem categoria"} · {product.price_label ?? "Sem preço"}
                              </div>
                            </div>
                            <span style={productStatusStyle(product.status)}>{statusLabels[product.status]}</span>
                          </div>
                          <div style={productProofStyle}>{formatProofPoints(product.proof_points).join(" · ") || product.problem_solved}</div>
                        </article>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <EmptyStateNotice message="Escolha um cliente para ver oferta foco, observações e ações rápidas." />
            )}
          </aside>
        </div>
      </main>
    </WorkspaceShell>
  );
}

export function ClientFormPage({ clientId, onNavigateDashboard, onNavigateClients, onPersistClientId }: ClientFormPageProps) {
  const isEditing = Boolean(clientId);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [existingClient, setExistingClient] = useState<Client | null>(null);
  const [clientDraft, setClientDraft] = useState({
    name: "",
    slug: "",
    segment: "",
    websiteUrl: "",
    notes: "",
  });
  const [productDraft, setProductDraft] = useState<DraftProduct>(EMPTY_DRAFT_PRODUCT);
  const [draftProducts, setDraftProducts] = useState<DraftProduct[]>([]);
  const [editingDraftIndex, setEditingDraftIndex] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;

    const hydrate = async () => {
      if (!clientId) {
        setExistingClient(null);
        setClientDraft({
          name: "",
          slug: "",
          segment: "",
          websiteUrl: "",
          notes: "",
        });
        setDraftProducts([]);
        setEditingDraftIndex(null);
        setProductDraft(EMPTY_DRAFT_PRODUCT);
        setError(null);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const [clientResponse, productsResponse] = await Promise.all([backendApi.loadClient(clientId), backendApi.loadProducts(clientId)]);
        if (cancelled) return;

        const client = clientResponse.client;
        setExistingClient(client);
        setClientDraft({
          name: client.name,
          slug: client.slug,
          segment: client.segment ?? "",
          websiteUrl: client.website_url ?? "",
          notes: client.notes ?? "",
        });
        setDraftProducts([]);
        setEditingDraftIndex(null);
        setProductDraft(EMPTY_DRAFT_PRODUCT);
        void productsResponse;
      } catch (loadError) {
        if (!cancelled) {
          setError(loadError instanceof Error ? loadError.message : "Não foi possível carregar o cliente.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    void hydrate();

    return () => {
      cancelled = true;
    };
  }, [clientId]);

  const progress = useMemo(() => {
    const steps = [
      Boolean(clientDraft.name.trim()),
      Boolean(clientDraft.websiteUrl.trim()),
      isEditing ? Boolean(existingClient) : draftProducts.length > 0,
      Boolean(clientDraft.notes.trim()) || draftProducts.length > 0,
    ];

    return Math.round((steps.filter(Boolean).length / steps.length) * 100);
  }, [clientDraft.name, clientDraft.notes, clientDraft.websiteUrl, draftProducts.length, existingClient, isEditing]);

  const handleSave = async () => {
    const name = clientDraft.name.trim();
    const slug = clientDraft.slug.trim();
    const segment = clientDraft.segment.trim();
    const websiteUrl = clientDraft.websiteUrl.trim();
    const notes = clientDraft.notes.trim();

    if (!name || !slug) {
      setError("Informe nome e slug para continuar.");
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const clientPayload = {
        name,
        slug,
        segment: segment || undefined,
        websiteUrl: websiteUrl || undefined,
        notes: notes || undefined,
      };

      let savedClientId = clientId;

      if (savedClientId) {
        const response = await backendApi.updateClient(savedClientId, clientPayload);
        savedClientId = response.client.id;
        setExistingClient(response.client);
      } else {
        const response = await backendApi.createClient(clientPayload);
        savedClientId = response.client.id;
        setExistingClient(response.client);

        for (const draft of draftProducts) {
          await backendApi.createProduct(savedClientId, draftProductToPayload(draft));
        }
      }

      if (savedClientId) {
        onPersistClientId(savedClientId);
      }
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Não foi possível salvar o cliente.");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteClient = async () => {
    if (!clientId || deleting) return;

    const confirmed = window.confirm(`Excluir o cliente "${clientDraft.name || existingClient?.name || "selecionado"}"? Todos os produtos e artefatos ligados a ele também serão removidos.`);
    if (!confirmed) return;

    setDeleting(true);
    setError(null);

    try {
      await backendApi.deleteClient(clientId);
      onPersistClientId(null);
      onNavigateClients();
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : "Não foi possível excluir o cliente.");
    } finally {
      setDeleting(false);
    }
  };

  const saveDraftProduct = () => {
    const name = productDraft.name.trim();
    const promise = productDraft.promise.trim();
    const problemSolved = productDraft.problemSolved.trim();
    const audience = productDraft.audience.trim();

    if (!name || !promise || !problemSolved || !audience) {
      setError("Preencha nome, promessa, dor e público para adicionar o produto.");
      return;
    }

    const nextDraft = {
      ...productDraft,
      name,
      category: productDraft.category.trim(),
      offerType: productDraft.offerType.trim(),
      priceLabel: productDraft.priceLabel.trim(),
      promise,
      problemSolved,
      audience,
      landingUrl: productDraft.landingUrl.trim(),
      proofPoints: productDraft.proofPoints.trim(),
      notes: productDraft.notes.trim(),
    };

    setDraftProducts((current) => {
      if (editingDraftIndex === null) {
        return [
          ...current,
          nextDraft,
        ];
      }

      return current.map((item, index) => (index === editingDraftIndex ? nextDraft : item));
    });

    setProductDraft(EMPTY_DRAFT_PRODUCT);
    setEditingDraftIndex(null);
  };

  const beginEditDraft = (index: number) => {
    const draft = draftProducts[index];
    if (!draft) return;
    setProductDraft(draft);
    setEditingDraftIndex(index);
  };

  const removeDraftProduct = (index: number) => {
    setDraftProducts((current) => current.filter((_, currentIndex) => currentIndex !== index));
    setEditingDraftIndex((current) => (current === index ? null : current));
  };

  const toggleFocusDraft = (index: number) => {
    setDraftProducts((current) =>
      current.map((item, currentIndex) => ({
        ...item,
        focus: currentIndex === index ? !item.focus : false,
      })),
    );
  };

  const activeDraft = draftProducts.find((item) => item.focus) ?? draftProducts[0] ?? null;

  return (
    <WorkspaceShell
      activeScreen="client-form"
      onNavigateDashboard={onNavigateDashboard}
      onNavigateClients={onNavigateClients}
      onNavigateCreate={() => undefined}
      topbar={
        <header className="dashboard-topbar" style={topbarStyle}>
          <div style={topbarLeftStyle}>
            <div style={breadcrumbStyle}>
              <span>Dashboard</span>
              <AppIcon name="expand_more" style={breadcrumbIconStyle} />
              <span>Gerenciamento de clientes</span>
              <AppIcon name="expand_more" style={breadcrumbIconStyle} />
              <strong>{isEditing ? "Editar cliente" : "Novo cliente"}</strong>
            </div>
          </div>

          <div style={topbarRightStyle}>
            <button type="button" className="action-button" style={secondaryActionStyle} onClick={onNavigateClients}>
              <AppIcon name="groups" style={actionIconStyle} />
              Voltar
            </button>
            {isEditing ? (
              <button type="button" className="action-button" style={dangerActionStyle} onClick={() => void handleDeleteClient()} disabled={saving || deleting}>
                <AppIcon name="delete" style={actionIconStyle} />
                {deleting ? "Excluindo..." : "Excluir cliente"}
              </button>
            ) : null}
            <button type="button" className="action-button" style={primaryActionStyle} onClick={handleSave} disabled={saving}>
              <AppIcon name="save" style={actionIconStyle} />
              {saving ? "Salvando..." : "Salvar cliente"}
            </button>
          </div>
        </header>
      }
    >
      <main className="soft-scrollbar" style={mainStyle}>
        <section className="section-card animate-rise-in" style={headerCardStyle}>
          <div style={headerCardTextStyle}>
            <div style={eyebrowStyle}>Client Registration</div>
            <h1 style={pageTitleStyle}>{isEditing ? "Editar Cliente" : "Criar Cliente"}</h1>
            <p style={pageSubtitleStyle}>
              Cadastre a identidade do cliente, conecte a presença digital e organize o catálogo de produtos/serviços que vai orientar o fluxo operacional.
            </p>
          </div>

          <div style={statRowStyle}>
            <StatTile label="Progresso" value={`${progress}%`} tone="violet" />
            <StatTile label="Produtos" value={isEditing ? "Catálogo real" : `${draftProducts.length} rascunhos`} tone="green" />
            <StatTile label="Modo" value={isEditing ? "Edição" : "Criação"} tone="indigo" />
          </div>
        </section>

        {error ? <div style={errorStyle}>{error}</div> : null}

        <div style={formGridStyle}>
          <section className="section-card animate-rise-in" style={formColumnStyle}>
            <div style={panelHeaderStyle}>
              <div>
                <div style={eyebrowStyle}>Identity &amp; Digital Presence</div>
                <div style={panelTitleStyle}>Dados do cliente</div>
              </div>
              <button type="button" className="action-button" style={ghostActionStyle} onClick={onNavigateClients}>
                <AppIcon name="arrow_back" style={actionIconStyle} />
                Clientes
              </button>
            </div>

            {loading ? <EmptyStateNotice message="Carregando cliente..." /> : null}

            <div style={formGridTwoStyle}>
              <Field label="Nome do cliente">
                <input
                  value={clientDraft.name}
                  onChange={(event) => setClientDraft((current) => ({ ...current, name: event.target.value }))}
                  placeholder="Ex.: Amiclube"
                  style={inputStyle}
                />
              </Field>
              <Field label="Slug">
                <input
                  value={clientDraft.slug}
                  onChange={(event) => setClientDraft((current) => ({ ...current, slug: event.target.value }))}
                  placeholder="amiclube"
                  style={inputStyle}
                />
              </Field>
              <Field label="Segmento">
                <input
                  value={clientDraft.segment}
                  onChange={(event) => setClientDraft((current) => ({ ...current, segment: event.target.value }))}
                  placeholder="Artesanato, educação, varejo..."
                  style={inputStyle}
                />
              </Field>
              <Field label="Website">
                <input
                  value={clientDraft.websiteUrl}
                  onChange={(event) => setClientDraft((current) => ({ ...current, websiteUrl: event.target.value }))}
                  placeholder="https://..."
                  style={inputStyle}
                />
              </Field>
              <div style={{ gridColumn: "1 / -1" }}>
                <Field label="Observações">
                  <textarea
                    value={clientDraft.notes}
                    onChange={(event) => setClientDraft((current) => ({ ...current, notes: event.target.value }))}
                    placeholder="Resumo operacional, contexto de negócio, restrições e oportunidades."
                    rows={4}
                    style={textareaStyle}
                  />
                </Field>
              </div>
            </div>

            <div style={sectionDividerStyle} />

            <div style={productsSectionHeaderStyle}>
              <div>
                <div style={eyebrowStyle}>{ptBR.dashboard.products.eyebrow}</div>
                <div style={panelTitleStyle}>{ptBR.dashboard.products.title}</div>
                <div style={pageSubtitleStyle}>{ptBR.dashboard.products.subtitle}</div>
              </div>
              <span style={productCountPillStyle}>{isEditing ? "Editável" : `${draftProducts.length} itens`}</span>
            </div>

            {isEditing && existingClient ? (
              <React.Suspense fallback={<LoadingPanel label="Carregando portfólio de produtos..." variant="compact" />}>
                <div style={editProductsWrapStyle}>
                  <ClientProductsPanel client={existingClient} />
                </div>
              </React.Suspense>
            ) : (
              <div style={draftProductsWrapStyle}>
                <div style={draftProductFormStyle}>
                  <div style={formGridTwoStyle}>
                    <Field label="Nome do produto / serviço">
                      <input value={productDraft.name} onChange={(event) => setProductDraft((current) => ({ ...current, name: event.target.value }))} placeholder="Baby Yoda Amigurumi" style={inputStyle} />
                    </Field>
                    <Field label="Categoria">
                      <input value={productDraft.category} onChange={(event) => setProductDraft((current) => ({ ...current, category: event.target.value }))} placeholder="Receita / passo a passo" style={inputStyle} />
                    </Field>
                    <Field label="Tipo de oferta">
                      <input value={productDraft.offerType} onChange={(event) => setProductDraft((current) => ({ ...current, offerType: event.target.value }))} placeholder="Produto digital" style={inputStyle} />
                    </Field>
                    <Field label="Preço">
                      <input value={productDraft.priceLabel} onChange={(event) => setProductDraft((current) => ({ ...current, priceLabel: event.target.value }))} placeholder="R$ 30,00" style={inputStyle} />
                    </Field>
                    <Field label="Status">
                      <select value={productDraft.status} onChange={(event) => setProductDraft((current) => ({ ...current, status: event.target.value as Product["status"] }))} style={inputStyle}>
                        <option value="draft">{statusLabels.draft}</option>
                        <option value="validated">{statusLabels.validated}</option>
                        <option value="prioritized">{statusLabels.prioritized}</option>
                        <option value="in_campaign">{statusLabels.in_campaign}</option>
                        <option value="monitored">{statusLabels.monitored}</option>
                        <option value="archived">{statusLabels.archived}</option>
                      </select>
                    </Field>
                    <Field label="Prioridade">
                      <input type="number" min={0} max={100} value={productDraft.priority} onChange={(event) => setProductDraft((current) => ({ ...current, priority: event.target.value }))} style={inputStyle} />
                    </Field>
                    <div style={focusRowStyle}>
                      <label style={focusToggleLabelStyle}>
                        <input
                          type="checkbox"
                          checked={productDraft.focus}
                          onChange={(event) => setProductDraft((current) => ({ ...current, focus: event.target.checked }))}
                        />
                        <span>Definir como foco ao salvar o cliente</span>
                      </label>
                    </div>
                    <div style={{ gridColumn: "1 / -1" }}>
                      <Field label="Promessa">
                        <textarea value={productDraft.promise} onChange={(event) => setProductDraft((current) => ({ ...current, promise: event.target.value }))} rows={2} style={textareaStyle} />
                      </Field>
                    </div>
                    <div style={{ gridColumn: "1 / -1" }}>
                      <Field label="Dor que resolve">
                        <textarea value={productDraft.problemSolved} onChange={(event) => setProductDraft((current) => ({ ...current, problemSolved: event.target.value }))} rows={2} style={textareaStyle} />
                      </Field>
                    </div>
                    <div style={{ gridColumn: "1 / -1" }}>
                      <Field label="Público">
                        <textarea value={productDraft.audience} onChange={(event) => setProductDraft((current) => ({ ...current, audience: event.target.value }))} rows={2} style={textareaStyle} />
                      </Field>
                    </div>
                    <div style={{ gridColumn: "1 / -1" }}>
                      <Field label="Link da página">
                        <input value={productDraft.landingUrl} onChange={(event) => setProductDraft((current) => ({ ...current, landingUrl: event.target.value }))} placeholder="https://..." style={inputStyle} />
                      </Field>
                    </div>
                    <div style={{ gridColumn: "1 / -1" }}>
                      <Field label="Provas">
                        <textarea value={productDraft.proofPoints} onChange={(event) => setProductDraft((current) => ({ ...current, proofPoints: event.target.value }))} placeholder="PDF, vídeo, lista de materiais..." rows={2} style={textareaStyle} />
                      </Field>
                    </div>
                    <div style={{ gridColumn: "1 / -1" }}>
                      <Field label="Observações">
                        <textarea value={productDraft.notes} onChange={(event) => setProductDraft((current) => ({ ...current, notes: event.target.value }))} rows={2} style={textareaStyle} />
                      </Field>
                    </div>
                  </div>

                  <div style={draftActionRowStyle}>
                    <button type="button" className="action-button" style={primaryActionStyle} onClick={saveDraftProduct}>
                      <AppIcon name="add" style={actionIconStyle} />
                      {editingDraftIndex === null ? "Adicionar produto" : "Atualizar produto"}
                    </button>
                    {editingDraftIndex !== null ? (
                      <button
                        type="button"
                        className="action-button"
                        style={secondaryActionStyle}
                        onClick={() => {
                          setEditingDraftIndex(null);
                          setProductDraft(EMPTY_DRAFT_PRODUCT);
                        }}
                      >
                        Cancelar edição
                      </button>
                    ) : null}
                  </div>
                </div>

                <div style={draftListStyle}>
                  {draftProducts.length === 0 ? (
                    <EmptyStateNotice message="Ainda não há produtos/serviços nesta ficha." />
                  ) : (
                    draftProducts.map((draft, index) => (
                      <article key={`${draft.name}-${index}`} style={draftCardStyle(draft.focus)}>
                        <div style={draftCardHeaderStyle}>
                          <div>
                            <div style={draftCardNameStyle}>{draft.name}</div>
                            <div style={draftCardMetaStyle}>{draft.category || "Sem categoria"} · {draft.priceLabel || "Sem preço"}</div>
                          </div>
                          <span style={productStatusStyle(draft.status)}>{statusLabels[draft.status]}</span>
                        </div>
                        <div style={draftCardBodyStyle}>{draft.promise || draft.problemSolved}</div>
                        <div style={draftCardActionsStyle}>
                          <button type="button" className="action-button" style={ghostActionStyle} onClick={() => beginEditDraft(index)}>
                            <AppIcon name="edit" style={actionIconStyle} />
                            Editar
                          </button>
                          <button type="button" className="action-button" style={ghostActionStyle} onClick={() => toggleFocusDraft(index)}>
                            <AppIcon name="star" style={actionIconStyle} />
                            {draft.focus ? "Foco" : "Focar"}
                          </button>
                          <button type="button" className="action-button" style={secondaryActionStyle} onClick={() => removeDraftProduct(index)}>
                            Remover
                          </button>
                        </div>
                      </article>
                    ))
                  )}
                </div>
              </div>
            )}
          </section>

          <aside className="section-card animate-rise-in" style={asideColumnStyle}>
            <div style={asideHeaderStyle}>
              <div>
                <div style={eyebrowStyle}>Onboarding</div>
                <div style={panelTitleStyle}>{isEditing ? "Edição guiada" : "Novo cliente"}</div>
              </div>
              <span style={productCountPillStyle}>{progress}%</span>
            </div>

            <div style={progressCardStyle}>
              <div style={progressLabelStyle}>Progresso da ficha</div>
              <div style={progressValueStyle}>{progress}%</div>
              <div style={progressBarTrackStyle}>
                <div style={{ ...progressBarFillStyle, width: `${progress}%` }} />
              </div>
              <div style={progressHintStyle}>Identity, presença, catálogo e revisão final.</div>
            </div>

            <div style={asideCardStyle}>
              <div style={asideCardTitleStyle}>Regra operacional</div>
              <p style={asideCardTextStyle}>
                A oferta foco deve ser explicitada no cadastro para que a equipe já nasça com uma oferta principal e um catálogo útil.
              </p>
            </div>

            <div style={asideCardStyle}>
              <div style={asideCardTitleStyle}>Produto destaque</div>
              <p style={asideCardTextStyle}>{activeDraft ? `${activeDraft.name} · ${activeDraft.status}` : "Nenhum produto em rascunho."}</p>
            </div>

            <div style={asideCardStyle}>
              <div style={asideCardTitleStyle}>Próximo passo</div>
              <p style={asideCardTextStyle}>
                {isEditing ? "Após salvar, revise o catálogo e marque a oferta foco. Depois siga para o registro do cliente e conteúdo." : "Salve o cliente para abrir a edição completa e persistir as ofertas cadastradas."}
              </p>
            </div>
          </aside>
        </div>
      </main>
    </WorkspaceShell>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label style={fieldStyle}>
      <span style={fieldLabelStyle}>{label}</span>
      {children}
    </label>
  );
}

function StatTile({ label, value, tone }: { label: string; value: string | number; tone: "indigo" | "green" | "violet" }) {
  return (
    <div style={statTileStyle(tone)}>
      <div style={statLabelStyle}>{label}</div>
      <div style={statValueStyle}>{value}</div>
    </div>
  );
}

function MetricBox({ label, value, wide = false }: { label: string; value: string | number; wide?: boolean }) {
  return (
    <div style={wide ? metricBoxWideStyle : metricBoxStyle}>
      <div style={metricLabelStyle}>{label}</div>
      <div style={metricValueStyle}>{value}</div>
    </div>
  );
}

function formatDate(input: string) {
  try {
    return new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "short" }).format(new Date(input));
  } catch {
    return input;
  }
}

function clientAvatarInitials(client: Client | null) {
  if (!client) return "C";

  return client.name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

function formatProofPoints(value: unknown) {
  return Array.isArray(value) ? value.map(String).filter(Boolean) : [];
}

function draftProductToPayload(draft: DraftProduct) {
  const status = draft.focus ? "prioritized" : draft.status;

  return {
    name: draft.name.trim(),
    category: draft.category.trim() || undefined,
    offerType: draft.offerType.trim() || undefined,
    priceLabel: draft.priceLabel.trim() || undefined,
    promise: draft.promise.trim(),
    problemSolved: draft.problemSolved.trim(),
    audience: draft.audience.trim(),
    status,
    priority: Number.isFinite(Number(draft.priority)) ? Number(draft.priority) : 0,
    landingUrl: draft.landingUrl.trim() || undefined,
    proofPoints: draft.proofPoints
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean),
    notes: draft.notes.trim() || undefined,
  };
}

const shellStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "256px minmax(0, 1fr)",
  minHeight: "100vh",
};

const sidebarStyle: React.CSSProperties = {
  position: "sticky",
  top: 0,
  height: "100vh",
  display: "flex",
  flexDirection: "column",
  padding: "24px 16px",
};

const contentStyle: React.CSSProperties = {
  minWidth: 0,
};

const brandStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 12,
  padding: "6px 12px 24px",
};

const brandMarkStyle: React.CSSProperties = {
  width: 42,
  height: 42,
  borderRadius: 14,
  display: "grid",
  placeItems: "center",
  background: "linear-gradient(135deg, rgba(107,56,212,0.98), rgba(132,85,239,0.96))",
  color: "#fff",
  fontFamily: "Space Grotesk, sans-serif",
  fontWeight: 700,
};

const brandTitleStyle: React.CSSProperties = {
  fontFamily: "Space Grotesk, sans-serif",
  fontSize: 18,
  fontWeight: 700,
  lineHeight: 1.1,
  color: "var(--primary)",
};

const brandEyebrowStyle: React.CSSProperties = {
  marginTop: 3,
  fontSize: 10,
  letterSpacing: "0.22em",
  textTransform: "uppercase",
  color: "var(--text-secondary)",
};

const navStyle: React.CSSProperties = {
  display: "grid",
  gap: 8,
};

const navItemStyle: React.CSSProperties = {
  position: "relative",
  display: "flex",
  alignItems: "center",
  gap: 12,
  width: "100%",
  padding: "13px 14px",
  borderRadius: 16,
  border: "none",
  background: "transparent",
  color: "var(--text-secondary)",
  textAlign: "left",
  cursor: "pointer",
};

const navActiveStyle: React.CSSProperties = {
  ...navItemStyle,
  background: "rgba(255,255,255,0.8)",
  color: "var(--secondary)",
  boxShadow: "0 12px 30px rgba(26,27,65,0.04)",
};

const navIconStyle: React.CSSProperties = {
  color: "inherit",
};

const sidebarFooterStyle: React.CSSProperties = {
  marginTop: "auto",
  display: "grid",
  gap: 12,
  paddingTop: 24,
};

const primaryActionStyle: React.CSSProperties = {
  border: "none",
  background: "linear-gradient(135deg, rgba(107,56,212,0.98), rgba(132,85,239,0.96))",
  color: "#fff",
  borderRadius: 14,
  padding: "12px 14px",
  fontSize: 13,
  fontWeight: 700,
  cursor: "pointer",
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 8,
};

const secondaryActionStyle: React.CSSProperties = {
  border: "1px solid rgba(148,163,184,0.24)",
  background: "rgba(255,255,255,0.8)",
  color: "var(--text-primary)",
  borderRadius: 14,
  padding: "12px 14px",
  fontSize: 13,
  fontWeight: 700,
  cursor: "pointer",
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 8,
};

const dangerActionStyle: React.CSSProperties = {
  border: "1px solid rgba(239,68,68,0.22)",
  background: "rgba(239,68,68,0.10)",
  color: "rgb(185,28,28)",
  borderRadius: 14,
  padding: "12px 14px",
  fontSize: 13,
  fontWeight: 700,
  cursor: "pointer",
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 8,
};

const ghostActionStyle: React.CSSProperties = {
  border: "none",
  background: "rgba(107,56,212,0.10)",
  color: "var(--secondary)",
  borderRadius: 14,
  padding: "10px 12px",
  fontSize: 13,
  fontWeight: 700,
  cursor: "pointer",
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 8,
};

const actionIconStyle: React.CSSProperties = {
  color: "inherit",
  width: 18,
  height: 18,
};

const supportRowStyle: React.CSSProperties = {
  display: "grid",
  gap: 8,
};

const supportLinkStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 10,
  padding: "10px 12px",
  border: "none",
  background: "transparent",
  color: "var(--text-secondary)",
  borderRadius: 12,
  cursor: "pointer",
  textAlign: "left",
};

const supportIconStyle: React.CSSProperties = {
  width: 18,
  height: 18,
  color: "inherit",
};

const topbarStyle: React.CSSProperties = {
  position: "sticky",
  top: 0,
  zIndex: 5,
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 16,
  padding: "18px 24px",
};

const topbarLeftStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 16,
  minWidth: 0,
};

const topbarRightStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 12,
  flexWrap: "wrap",
  justifyContent: "flex-end",
};

const searchShellStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 10,
  minWidth: 340,
  padding: "11px 14px",
  borderRadius: 16,
  background: "rgba(255,255,255,0.7)",
  backdropFilter: "blur(12px)",
  boxShadow: "0 12px 40px rgba(26,27,65,0.06)",
};

const searchIconStyle: React.CSSProperties = {
  color: "var(--text-secondary)",
  width: 18,
  height: 18,
};

const searchInputStyle: React.CSSProperties = {
  width: "100%",
  border: "none",
  background: "transparent",
  color: "var(--text-primary)",
  outline: "none",
  fontSize: 14,
};

const topbarNavStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 10,
};

const topbarLinkStyle: React.CSSProperties = {
  border: "none",
  background: "transparent",
  color: "var(--text-secondary)",
  fontSize: 13,
  fontWeight: 700,
  cursor: "pointer",
  padding: "8px 10px",
};

const anonymousModeActiveStyle: React.CSSProperties = {
  ...topbarLinkStyle,
  display: "inline-flex",
  alignItems: "center",
  gap: 8,
  borderRadius: 999,
  background: "rgba(67,56,202,0.1)",
  color: "var(--primary)",
};

const topbarLinkIconStyle: React.CSSProperties = {
  width: 16,
  height: 16,
};

const mainStyle: React.CSSProperties = {
  padding: "0 24px 24px",
  display: "grid",
  gap: 20,
};

const headerCardStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "flex-end",
  justifyContent: "space-between",
  gap: 20,
  padding: 24,
};

const headerCardTextStyle: React.CSSProperties = {
  minWidth: 0,
};

const pageTitleStyle: React.CSSProperties = {
  marginTop: 6,
  fontFamily: "Space Grotesk, sans-serif",
  fontSize: 34,
  lineHeight: 1,
  color: "var(--primary)",
};

const pageSubtitleStyle: React.CSSProperties = {
  marginTop: 10,
  maxWidth: 760,
  color: "var(--text-secondary)",
  lineHeight: 1.5,
};

const statRowStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "stretch",
  gap: 12,
  flexWrap: "wrap",
  justifyContent: "flex-end",
};

const statTileStyle = (tone: "indigo" | "green" | "violet"): React.CSSProperties => ({
  minWidth: 124,
  padding: "14px 16px",
  borderRadius: 18,
  background:
    tone === "green"
      ? "rgba(16,185,129,0.08)"
      : tone === "violet"
        ? "rgba(107,56,212,0.08)"
        : "rgba(26,27,65,0.06)",
});

const statLabelStyle: React.CSSProperties = {
  fontSize: 11,
  textTransform: "uppercase",
  letterSpacing: "0.12em",
  color: "var(--text-secondary)",
  fontWeight: 700,
};

const statValueStyle: React.CSSProperties = {
  marginTop: 8,
  fontFamily: "Space Grotesk, sans-serif",
  fontSize: 26,
  fontWeight: 700,
  color: "var(--primary)",
};

const filterBarStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 16,
  padding: "14px 18px",
  borderRadius: 20,
  background: "rgba(242,244,247,0.9)",
};

const filterPillsStyle: React.CSSProperties = {
  display: "flex",
  gap: 10,
  flexWrap: "wrap",
};

const filterStyle: React.CSSProperties = {
  border: "none",
  background: "rgba(255,255,255,0.7)",
  color: "var(--text-secondary)",
  borderRadius: 14,
  padding: "9px 12px",
  fontSize: 12,
  fontWeight: 700,
};

const activeFilterStyle: React.CSSProperties = {
  ...filterStyle,
  background: "#fff",
  color: "var(--primary)",
  boxShadow: "0 10px 20px rgba(26,27,65,0.04)",
};

const filterMetaStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 8,
  color: "var(--text-secondary)",
  fontSize: 12,
};

const filterIconStyle: React.CSSProperties = {
  width: 18,
  height: 18,
  color: "var(--text-secondary)",
};

const gridLayoutStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "minmax(0, 1.75fr) minmax(320px, 1fr)",
  gap: 20,
  alignItems: "start",
};

const listColumnStyle: React.CSSProperties = {
  padding: 24,
};

const detailColumnStyle: React.CSSProperties = {
  padding: 24,
  position: "sticky",
  top: 96,
};

const panelHeaderStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "flex-start",
  justifyContent: "space-between",
  gap: 16,
  marginBottom: 18,
};

const eyebrowStyle: React.CSSProperties = {
  fontSize: 11,
  textTransform: "uppercase",
  letterSpacing: "0.16em",
  color: "var(--text-secondary)",
  fontWeight: 700,
};

const panelTitleStyle: React.CSSProperties = {
  marginTop: 4,
  fontSize: 20,
  fontFamily: "Space Grotesk, sans-serif",
  fontWeight: 700,
  color: "var(--primary)",
};

const errorStyle: React.CSSProperties = {
  marginBottom: 16,
  padding: "12px 14px",
  borderRadius: 14,
  background: "rgba(220,38,38,0.09)",
  color: "var(--accent-red)",
  fontSize: 13,
};

const clientGridStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
  gap: 14,
};

const clientCardStyle: React.CSSProperties = {
  position: "relative",
  display: "grid",
  gap: 14,
  padding: 18,
  borderRadius: 18,
  border: "none",
  background: "rgba(255,255,255,0.84)",
  cursor: "pointer",
  textAlign: "left",
  boxShadow: "0 12px 30px rgba(26,27,65,0.04)",
};

const clientCardSelectedStyle: React.CSSProperties = {
  ...clientCardStyle,
  background: "linear-gradient(180deg, rgba(107,56,212,0.08) 0%, rgba(255,255,255,0.92) 100%)",
  boxShadow: "0 18px 40px rgba(107,56,212,0.08)",
};

const clientCardTopStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "auto 1fr auto",
  gap: 12,
  alignItems: "center",
};

const clientBadgeStyle: React.CSSProperties = {
  width: 42,
  height: 42,
  borderRadius: 14,
  display: "grid",
  placeItems: "center",
  background: "rgba(107,56,212,0.10)",
  color: "var(--secondary)",
  fontFamily: "Space Grotesk, sans-serif",
  fontWeight: 700,
};

const clientCardTextStyle: React.CSSProperties = {
  minWidth: 0,
};

const clientCardNameStyle: React.CSSProperties = {
  fontSize: 16,
  fontWeight: 700,
  color: "var(--primary)",
  whiteSpace: "nowrap",
  overflow: "hidden",
  textOverflow: "ellipsis",
};

const clientCardRelationshipStyle: React.CSSProperties = {
  marginTop: 4,
  color: "var(--secondary)",
  fontSize: 11,
  fontWeight: 700,
};

const clientStatusStyle = (status: string): React.CSSProperties => ({
  padding: "5px 9px",
  borderRadius: 999,
  background:
    status === "active" ? "rgba(16,185,129,0.12)" : status === "archived" ? "rgba(148,163,184,0.18)" : "rgba(107,56,212,0.10)",
  color: status === "active" ? "#047857" : status === "archived" ? "#475569" : "var(--secondary)",
  fontSize: 11,
  fontWeight: 700,
  textTransform: "uppercase",
  letterSpacing: "0.04em",
});

const clientCardDetailsStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
  gap: 12,
};

const clientDetailLabelStyle: React.CSSProperties = {
  fontSize: 10,
  textTransform: "uppercase",
  letterSpacing: "0.12em",
  color: "var(--text-secondary)",
  fontWeight: 700,
};

const clientDetailValueStyle: React.CSSProperties = {
  marginTop: 4,
  fontSize: 13,
  color: "var(--text-primary)",
  lineHeight: 1.4,
};

const clientCardFooterStyle: React.CSSProperties = {
  display: "flex",
  gap: 8,
  flexWrap: "wrap",
};

const clientPillStyle: React.CSSProperties = {
  padding: "6px 10px",
  borderRadius: 999,
  background: "rgba(242,244,247,0.95)",
  color: "var(--text-secondary)",
  fontSize: 11,
  fontWeight: 700,
};

const detailHeaderStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "flex-start",
  justifyContent: "space-between",
  gap: 12,
  marginBottom: 18,
};

const detailStackStyle: React.CSSProperties = {
  display: "grid",
  gap: 16,
};

const focusCardStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "auto 1fr",
  gap: 12,
  alignItems: "center",
  padding: 16,
  borderRadius: 18,
  background: "rgba(255,255,255,0.88)",
  boxShadow: "0 12px 30px rgba(26,27,65,0.04)",
};

const focusAvatarStyle: React.CSSProperties = {
  width: 48,
  height: 48,
  borderRadius: 16,
  display: "grid",
  placeItems: "center",
  background: "linear-gradient(135deg, rgba(107,56,212,0.16), rgba(132,85,239,0.10))",
  color: "var(--secondary)",
  fontFamily: "Space Grotesk, sans-serif",
  fontWeight: 700,
};

const focusNameStyle: React.CSSProperties = {
  fontSize: 18,
  fontWeight: 700,
  color: "var(--primary)",
};

const focusMetaStyle: React.CSSProperties = {
  marginTop: 4,
  color: "var(--text-secondary)",
  fontSize: 13,
};

const focusRelationshipStyle: React.CSSProperties = {
  marginTop: 4,
  color: "var(--secondary)",
  fontSize: 12,
  fontWeight: 700,
};

const detailMetricsStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
  gap: 12,
};

const metricBoxStyle: React.CSSProperties = {
  padding: 14,
  borderRadius: 16,
  background: "rgba(242,244,247,0.9)",
};

const metricBoxWideStyle: React.CSSProperties = {
  ...metricBoxStyle,
  gridColumn: "1 / -1",
};

const metricLabelStyle: React.CSSProperties = {
  fontSize: 10,
  textTransform: "uppercase",
  letterSpacing: "0.12em",
  color: "var(--text-secondary)",
  fontWeight: 700,
};

const metricValueStyle: React.CSSProperties = {
  marginTop: 8,
  color: "var(--primary)",
  fontSize: 15,
  fontWeight: 700,
  lineHeight: 1.4,
};

const detailDescriptionStyle: React.CSSProperties = {
  padding: 16,
  borderRadius: 16,
  background: "rgba(255,255,255,0.84)",
};

const detailDescriptionLabelStyle: React.CSSProperties = {
  fontSize: 10,
  textTransform: "uppercase",
  letterSpacing: "0.12em",
  color: "var(--text-secondary)",
  fontWeight: 700,
};

const detailDescriptionValueStyle: React.CSSProperties = {
  marginTop: 8,
  color: "var(--text-primary)",
  lineHeight: 1.5,
  fontSize: 13,
};

const contextGridStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
  gap: 12,
};

const contextCardStyle: React.CSSProperties = {
  padding: 16,
  borderRadius: 16,
  background: "rgba(255,255,255,0.86)",
  boxShadow: "0 12px 30px rgba(26,27,65,0.04)",
  display: "grid",
  gap: 6,
};

const contextLabelStyle: React.CSSProperties = {
  fontSize: 10,
  textTransform: "uppercase",
  letterSpacing: "0.12em",
  color: "var(--text-secondary)",
  fontWeight: 700,
};

const contextValueStyle: React.CSSProperties = {
  color: "var(--primary)",
  fontSize: 13,
  lineHeight: 1.5,
  fontWeight: 700,
};

const contextHintStyle: React.CSSProperties = {
  color: "var(--text-secondary)",
  fontSize: 12,
  lineHeight: 1.4,
};

const detailActionsStyle: React.CSSProperties = {
  display: "flex",
  gap: 10,
  flexWrap: "wrap",
};

const productSectionStyle: React.CSSProperties = {
  display: "grid",
  gap: 12,
  paddingTop: 8,
};

const productSectionHeaderStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "flex-start",
  justifyContent: "space-between",
  gap: 12,
};

const productCountPillStyle: React.CSSProperties = {
  padding: "7px 10px",
  borderRadius: 999,
  background: "rgba(107,56,212,0.10)",
  color: "var(--secondary)",
  fontSize: 11,
  fontWeight: 700,
};

const productListStyle: React.CSSProperties = {
  display: "grid",
  gap: 12,
};

const productItemStyle = (active: boolean): React.CSSProperties => ({
  padding: 14,
  borderRadius: 16,
  background: active ? "linear-gradient(180deg, rgba(16,185,129,0.08), rgba(255,255,255,0.92))" : "rgba(255,255,255,0.86)",
  boxShadow: "0 12px 30px rgba(26,27,65,0.04)",
});

const productItemHeaderStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "flex-start",
  justifyContent: "space-between",
  gap: 12,
};

const productItemNameStyle: React.CSSProperties = {
  fontWeight: 700,
  color: "var(--primary)",
};

const productItemMetaStyle: React.CSSProperties = {
  marginTop: 4,
  fontSize: 12,
  color: "var(--text-secondary)",
};

const productStatusStyle = (status: Product["status"]): React.CSSProperties => ({
  padding: "5px 8px",
  borderRadius: 999,
  background: status === "prioritized" || status === "in_campaign" ? "rgba(16,185,129,0.14)" : status === "archived" ? "rgba(148,163,184,0.16)" : "rgba(107,56,212,0.10)",
  color: status === "prioritized" || status === "in_campaign" ? "#047857" : status === "archived" ? "#475569" : "var(--secondary)",
  fontSize: 10,
  fontWeight: 700,
  letterSpacing: "0.05em",
  textTransform: "uppercase",
});

const productProofStyle: React.CSSProperties = {
  marginTop: 10,
  color: "var(--text-secondary)",
  fontSize: 12,
  lineHeight: 1.5,
};

const formGridStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "minmax(0, 1.75fr) minmax(300px, 0.9fr)",
  gap: 20,
  alignItems: "start",
};

const formColumnStyle: React.CSSProperties = {
  padding: 24,
};

const asideColumnStyle: React.CSSProperties = {
  padding: 24,
  display: "grid",
  gap: 16,
  position: "sticky",
  top: 96,
};

const formGridTwoStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
  gap: 14,
};

const fieldStyle: React.CSSProperties = {
  display: "grid",
  gap: 8,
};

const fieldLabelStyle: React.CSSProperties = {
  fontSize: 10,
  textTransform: "uppercase",
  letterSpacing: "0.14em",
  fontWeight: 700,
  color: "var(--text-secondary)",
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "11px 12px",
  borderRadius: 14,
  border: "none",
  background: "rgba(242,244,247,0.96)",
  color: "var(--text-primary)",
  outline: "none",
};

const textareaStyle: React.CSSProperties = {
  ...inputStyle,
  minHeight: 84,
  resize: "vertical",
};

const sectionDividerStyle: React.CSSProperties = {
  height: 1,
  margin: "20px 0",
  background: "rgba(25,28,30,0.06)",
};

const productsSectionHeaderStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "flex-start",
  justifyContent: "space-between",
  gap: 12,
  marginBottom: 14,
};

const draftProductsWrapStyle: React.CSSProperties = {
  display: "grid",
  gap: 16,
};

const draftProductFormStyle: React.CSSProperties = {
  padding: 18,
  borderRadius: 18,
  background: "rgba(255,255,255,0.86)",
  boxShadow: "0 12px 30px rgba(26,27,65,0.04)",
};

const focusRowStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "flex-start",
};

const focusToggleLabelStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 8,
  color: "var(--text-primary)",
  fontSize: 13,
  fontWeight: 600,
};

const draftActionRowStyle: React.CSSProperties = {
  display: "flex",
  gap: 10,
  flexWrap: "wrap",
  marginTop: 16,
};

const draftListStyle: React.CSSProperties = {
  display: "grid",
  gap: 12,
};

const draftCardStyle = (focus: boolean): React.CSSProperties => ({
  padding: 16,
  borderRadius: 18,
  background: focus ? "linear-gradient(180deg, rgba(107,56,212,0.10), rgba(255,255,255,0.92))" : "rgba(255,255,255,0.86)",
  boxShadow: "0 12px 30px rgba(26,27,65,0.04)",
});

const draftCardHeaderStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "flex-start",
  justifyContent: "space-between",
  gap: 12,
};

const draftCardNameStyle: React.CSSProperties = {
  fontWeight: 700,
  color: "var(--primary)",
};

const draftCardMetaStyle: React.CSSProperties = {
  marginTop: 4,
  color: "var(--text-secondary)",
  fontSize: 12,
};

const draftCardBodyStyle: React.CSSProperties = {
  marginTop: 10,
  color: "var(--text-secondary)",
  fontSize: 12,
  lineHeight: 1.5,
};

const draftCardActionsStyle: React.CSSProperties = {
  display: "flex",
  gap: 8,
  flexWrap: "wrap",
  marginTop: 12,
};

const asideHeaderStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "flex-start",
  justifyContent: "space-between",
  gap: 12,
};

const progressCardStyle: React.CSSProperties = {
  padding: 16,
  borderRadius: 18,
  background: "linear-gradient(180deg, rgba(107,56,212,0.10), rgba(255,255,255,0.88))",
};

const progressLabelStyle: React.CSSProperties = {
  fontSize: 10,
  textTransform: "uppercase",
  letterSpacing: "0.14em",
  color: "var(--text-secondary)",
  fontWeight: 700,
};

const progressValueStyle: React.CSSProperties = {
  marginTop: 8,
  fontFamily: "Space Grotesk, sans-serif",
  fontSize: 32,
  color: "var(--secondary)",
  fontWeight: 700,
};

const progressBarTrackStyle: React.CSSProperties = {
  marginTop: 12,
  width: "100%",
  height: 10,
  borderRadius: 999,
  background: "rgba(25,28,30,0.06)",
  overflow: "hidden",
};

const progressBarFillStyle: React.CSSProperties = {
  height: "100%",
  borderRadius: 999,
  background: "linear-gradient(135deg, rgba(107,56,212,0.98), rgba(132,85,239,0.96))",
};

const progressHintStyle: React.CSSProperties = {
  marginTop: 10,
  color: "var(--text-secondary)",
  fontSize: 13,
  lineHeight: 1.5,
};

const asideCardStyle: React.CSSProperties = {
  padding: 16,
  borderRadius: 18,
  background: "rgba(255,255,255,0.84)",
};

const asideCardTitleStyle: React.CSSProperties = {
  fontWeight: 700,
  color: "var(--primary)",
};

const asideCardTextStyle: React.CSSProperties = {
  marginTop: 8,
  color: "var(--text-secondary)",
  fontSize: 13,
  lineHeight: 1.5,
};

const breadcrumbStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 8,
  color: "var(--text-secondary)",
  fontSize: 13,
  fontWeight: 700,
};

const breadcrumbIconStyle: React.CSSProperties = {
  width: 16,
  height: 16,
  color: "var(--text-secondary)",
};

const editProductsWrapStyle: React.CSSProperties = {
  display: "grid",
};
