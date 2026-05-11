import * as React from "react";
import { useEffect, useMemo, useState } from "react";
import { backendApi } from "@/lib/backendApi";
import { recordOfferMetric } from "@/lib/productMetrics";
import { ptBR } from "@/i18n/pt-BR";
import type { ContentResult } from "@/lib/backendApi";
import type { Client, Product } from "@/types/backend";

type ProductDraft = {
  name: string;
  category: string;
  offerType: string;
  priceLabel: string;
  promise: string;
  problemSolved: string;
  audience: string;
  status: "draft" | "validated" | "prioritized" | "in_campaign" | "monitored" | "archived";
  priority: string;
  landingUrl: string;
  proofPoints: string;
  notes: string;
};

const DEFAULT_DRAFT: ProductDraft = {
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
};

const statusLabel = (status: string) => ptBR.dashboard.products.status[status as keyof typeof ptBR.dashboard.products.status] ?? status;

const formatProofPoints = (value: unknown) => (Array.isArray(value) ? value.map(String).filter(Boolean) : []);
const asRecord = (value: unknown): Record<string, unknown> | null => (typeof value === "object" && value !== null ? (value as Record<string, unknown>) : null);
const asString = (value: unknown): string | null => (typeof value === "string" && value.trim().length > 0 ? value.trim() : null);
const profileSummary = (profile: Record<string, unknown> | null, fallback: string) => asString(profile?.summary) ?? fallback;
const profileVersion = (profile: Record<string, unknown> | null) => {
  const value = profile?.version;
  return typeof value === "number" && Number.isFinite(value) ? value : null;
};

export function ClientProductsPanel({ client }: { client: Client | null }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [content, setContent] = useState<ContentResult | null>(null);
  const [draft, setDraft] = useState<ProductDraft>(DEFAULT_DRAFT);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deletingProductId, setDeletingProductId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadProducts = async (clientId: string) => {
    setLoading(true);
    setError(null);

    try {
      const [productsResponse, contentResponse] = await Promise.all([
        backendApi.loadProducts(clientId),
        backendApi.loadContent(clientId).catch(() => null),
      ]);
      setProducts(productsResponse.products);
      setContent(contentResponse);
    } catch (loadError) {
      setProducts([]);
      setContent(null);
      setError(loadError instanceof Error ? loadError.message : ptBR.dashboard.products.loadError);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setDraft(DEFAULT_DRAFT);
    setEditingProductId(null);
    setDeletingProductId(null);

    if (!client?.id) {
      setProducts([]);
      setContent(null);
      setError(null);
      return;
    }

    void loadProducts(client.id);
  }, [client?.id]);

  const activeProduct = useMemo(() => products.find((product) => product.is_active) ?? products[0] ?? null, [products]);
  const brandProfile = useMemo(() => asRecord(content?.brandProfile), [content?.brandProfile]);
  const offerProfile = useMemo(() => asRecord(content?.offerProfile), [content?.offerProfile]);
  const offerProduct = content?.primaryProduct ?? activeProduct;
  const offerProfilesCount = content?.offerProfiles.length ?? 0;

  const resetDraft = () => setDraft(DEFAULT_DRAFT);

  const beginEdit = (product: Product) => {
    setEditingProductId(product.id);
    setError(null);
    setDraft({
      name: product.name,
      category: product.category ?? "",
      offerType: product.offer_type ?? "",
      priceLabel: product.price_label ?? "",
      promise: product.promise,
      problemSolved: product.problem_solved,
      audience: product.audience,
      status: product.status,
      priority: String(product.priority),
      landingUrl: product.landing_url ?? "",
      proofPoints: formatProofPoints(product.proof_points).join(", "),
      notes: product.notes ?? "",
    });
  };

  const cancelEdit = () => {
    setEditingProductId(null);
    resetDraft();
  };

  const handleSave = async () => {
    if (!client?.id || saving) return;

    const name = draft.name.trim();
    const promise = draft.promise.trim();
    const problemSolved = draft.problemSolved.trim();
    const audience = draft.audience.trim();

    if (!name || !promise || !problemSolved || !audience) {
      setError("Preencha nome, promessa, dor e público para salvar o produto.");
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const payload = {
        name,
        category: draft.category.trim() || undefined,
        offerType: draft.offerType.trim() || undefined,
        priceLabel: draft.priceLabel.trim() || undefined,
        promise,
        problemSolved,
        audience,
        status: draft.status,
        priority: Number.isFinite(Number(draft.priority)) ? Number(draft.priority) : 0,
        landingUrl: draft.landingUrl.trim() || undefined,
        proofPoints: draft.proofPoints
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean),
        notes: draft.notes.trim() || undefined,
      };

      const response = editingProductId
        ? await backendApi.updateProduct(editingProductId, payload)
        : await backendApi.createProduct(client.id, payload);

      recordOfferMetric({
        eventName: editingProductId ? "offer_updated" : "offer_created",
        clientId: client.id,
        source: "client-products-panel",
      });
      void backendApi.trackOfferEvent({
        eventName: editingProductId ? "offer_updated" : "offer_created",
        clientId: client.id,
        source: "client-products-panel",
        properties: {
          productId: response.product.id,
          productName: response.product.name,
          status: response.product.status,
        },
      });

      setProducts(response.products);
      cancelEdit();
    } catch (createError) {
      setError(createError instanceof Error ? createError.message : "Não foi possível salvar o produto.");
    } finally {
      setSaving(false);
    }
  };

  const updateStatus = async (product: Product, status: Product["status"]) => {
    if (!client?.id) return;

    try {
      const response = await backendApi.updateProduct(product.id, { status });
      setProducts(response.products);
      recordOfferMetric({
        eventName: "offer_status_changed",
        clientId: client.id,
        source: "client-products-panel",
      });
      void backendApi.trackOfferEvent({
        eventName: "offer_status_changed",
        clientId: client.id,
        source: "client-products-panel",
        properties: {
          productId: product.id,
          productName: product.name,
          status,
        },
      });
    } catch (updateError) {
      setError(updateError instanceof Error ? updateError.message : "Não foi possível atualizar o produto.");
    }
  };

  const activateFocus = async (product: Product) => {
    if (!client?.id) return;

    try {
      const response = await backendApi.activateProduct(product.id);
      setProducts(response.products);
      recordOfferMetric({
        eventName: "offer_focus_changed",
        clientId: client.id,
        source: "client-products-panel",
      });
      void backendApi.trackOfferEvent({
        eventName: "offer_focus_changed",
        clientId: client.id,
        source: "client-products-panel",
        properties: {
          productId: product.id,
          productName: product.name,
        },
      });
    } catch (focusError) {
      setError(focusError instanceof Error ? focusError.message : "Não foi possível definir o foco do produto.");
    }
  };

  const deleteProduct = async (product: Product) => {
    if (!client?.id || deletingProductId === product.id) return;

    const confirmed = window.confirm(`Excluir o produto "${product.name}"?`);
    if (!confirmed) return;

    setDeletingProductId(product.id);
    setError(null);

    try {
      const response = await backendApi.deleteProduct(product.id);
      setProducts(response.products);

      if (editingProductId === product.id) {
        cancelEdit();
      }

      recordOfferMetric({
        eventName: "offer_deleted",
        clientId: client.id,
        source: "client-products-panel",
      });
      void backendApi.trackOfferEvent({
        eventName: "offer_deleted",
        clientId: client.id,
        source: "client-products-panel",
        properties: {
          productId: product.id,
          productName: product.name,
        },
      });
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : "Não foi possível excluir o produto.");
    } finally {
      setDeletingProductId(null);
    }
  };

  return (
    <section className="section-card animate-rise-in" style={panelStyle}>
      <div style={headerStyle}>
        <div>
          <div style={eyebrowStyle}>{ptBR.dashboard.products.eyebrow}</div>
          <h2 style={titleStyle}>{ptBR.dashboard.products.title}</h2>
          <p style={subtitleStyle}>{ptBR.dashboard.products.subtitle}</p>
        </div>
        <div style={badgeStyle}>
          {client ? `${products.length} item(ns)` : ptBR.dashboard.client.empty}
        </div>
      </div>

      {error ? <div style={errorStyle}>{error}</div> : null}

      <div style={activeRowStyle}>
        <div style={activeLabelStyle}>Oferta ativa</div>
        <div style={activeValueStyle}>{offerProduct ? offerProduct.name : ptBR.dashboard.products.empty}</div>
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
          <div style={contextHintStyle}>{offerProduct ? `${offerProduct.name} · ${offerProduct.status}` : "Aguardando oferta ativa"}</div>
        </div>
        <div style={contextCardStyle}>
          <div style={contextLabelStyle}>Cobertura</div>
          <div style={contextValueStyle}>{offerProfilesCount} perfil(is) de oferta</div>
          <div style={contextHintStyle}>{offerProduct ? `Produto principal: ${offerProduct.name}` : "Nenhum produto principal definido"}</div>
        </div>
      </div>

      <div style={listStyle}>
        {loading ? (
          <div style={emptyStyle}>Carregando catálogo...</div>
        ) : products.length === 0 ? (
          <div style={emptyStyle}>{ptBR.dashboard.products.empty}</div>
        ) : (
          products.map((product) => (
            <article key={product.id} style={productCardStyle(product.is_active)}>
              <div style={productCardHeaderStyle}>
                <div style={productMetaStyle}>
                  <div style={productNameStyle}>{product.name}</div>
                  <div style={productSublineStyle}>
                    {product.price_label ?? "sem preço"} · {statusLabel(product.status)}
                  </div>
                </div>
                <span style={statusChipStyle(product.status)}>{statusLabel(product.status)}</span>
              </div>

              <div style={productGridStyle}>
                <div>
                  <div style={miniLabelStyle}>{ptBR.dashboard.products.hints.promise}</div>
                  <div style={miniValueStyle}>{product.promise}</div>
                </div>
                <div>
                  <div style={miniLabelStyle}>{ptBR.dashboard.products.hints.audience}</div>
                  <div style={miniValueStyle}>{product.audience}</div>
                </div>
              </div>

              <div style={proofStyle}>{formatProofPoints(product.proof_points).join(" · ") || product.problem_solved}</div>

              <div style={actionRowStyle}>
                <button type="button" style={actionButtonStyle} onClick={() => void activateFocus(product)}>
                  {ptBR.dashboard.products.actions.focus}
                </button>
                <button type="button" style={actionButtonGhostStyle} onClick={() => beginEdit(product)}>
                  Editar
                </button>
                <button type="button" style={actionButtonStyle} onClick={() => void updateStatus(product, "prioritized")}>
                  {ptBR.dashboard.products.actions.prioritize}
                </button>
                <button type="button" style={actionButtonStyle} onClick={() => void updateStatus(product, "in_campaign")}>
                  {ptBR.dashboard.products.actions.campaign}
                </button>
                <button type="button" style={actionButtonStyle} onClick={() => void updateStatus(product, "monitored")}>
                  {ptBR.dashboard.products.actions.monitor}
                </button>
                <button type="button" style={actionButtonGhostStyle} onClick={() => void updateStatus(product, "archived")}>
                  {ptBR.dashboard.products.actions.archive}
                </button>
                <button
                  type="button"
                  style={actionButtonDangerStyle}
                  onClick={() => void deleteProduct(product)}
                  disabled={deletingProductId === product.id}
                >
                  {deletingProductId === product.id ? "Excluindo..." : "Excluir"}
                </button>
              </div>
            </article>
          ))
        )}
      </div>

      <div style={createHeaderStyle}>
        <div>
          <div style={createTitleStyle}>{ptBR.dashboard.products.createTitle}</div>
          <div style={createHintStyle}>{ptBR.dashboard.products.createHint}</div>
        </div>
      </div>

      <div style={formGridStyle}>
        <Field label={ptBR.dashboard.products.fields.name}>
          <input value={draft.name} onChange={(event) => setDraft((current) => ({ ...current, name: event.target.value }))} style={inputStyle} />
        </Field>
        <Field label={ptBR.dashboard.products.fields.category}>
          <input value={draft.category} onChange={(event) => setDraft((current) => ({ ...current, category: event.target.value }))} style={inputStyle} />
        </Field>
        <Field label={ptBR.dashboard.products.fields.offerType}>
          <input value={draft.offerType} onChange={(event) => setDraft((current) => ({ ...current, offerType: event.target.value }))} style={inputStyle} />
        </Field>
        <Field label={ptBR.dashboard.products.fields.priceLabel}>
          <input value={draft.priceLabel} onChange={(event) => setDraft((current) => ({ ...current, priceLabel: event.target.value }))} style={inputStyle} />
        </Field>
        <Field label={ptBR.dashboard.products.fields.promise}>
          <textarea value={draft.promise} onChange={(event) => setDraft((current) => ({ ...current, promise: event.target.value }))} style={textareaStyle} rows={2} />
        </Field>
        <Field label={ptBR.dashboard.products.fields.problemSolved}>
          <textarea
            value={draft.problemSolved}
            onChange={(event) => setDraft((current) => ({ ...current, problemSolved: event.target.value }))}
            style={textareaStyle}
            rows={2}
          />
        </Field>
        <Field label={ptBR.dashboard.products.fields.audience}>
          <textarea value={draft.audience} onChange={(event) => setDraft((current) => ({ ...current, audience: event.target.value }))} style={textareaStyle} rows={2} />
        </Field>
        <Field label={ptBR.dashboard.products.fields.status}>
          <select value={draft.status} onChange={(event) => setDraft((current) => ({ ...current, status: event.target.value as ProductDraft["status"] }))} style={inputStyle}>
            <option value="draft">{ptBR.dashboard.products.status.draft}</option>
            <option value="validated">{ptBR.dashboard.products.status.validated}</option>
            <option value="prioritized">{ptBR.dashboard.products.status.prioritized}</option>
            <option value="in_campaign">{ptBR.dashboard.products.status.in_campaign}</option>
            <option value="monitored">{ptBR.dashboard.products.status.monitored}</option>
            <option value="archived">{ptBR.dashboard.products.status.archived}</option>
          </select>
        </Field>
        <Field label={ptBR.dashboard.products.fields.priority}>
          <input
            type="number"
            min={0}
            max={100}
            value={draft.priority}
            onChange={(event) => setDraft((current) => ({ ...current, priority: event.target.value }))}
            style={inputStyle}
          />
        </Field>
        <Field label={ptBR.dashboard.products.fields.landingUrl}>
          <input value={draft.landingUrl} onChange={(event) => setDraft((current) => ({ ...current, landingUrl: event.target.value }))} style={inputStyle} />
        </Field>
        <Field label={ptBR.dashboard.products.fields.proofPoints}>
          <textarea
            value={draft.proofPoints}
            onChange={(event) => setDraft((current) => ({ ...current, proofPoints: event.target.value }))}
            style={textareaStyle}
            rows={2}
          />
        </Field>
        <Field label={ptBR.dashboard.products.fields.notes}>
          <textarea value={draft.notes} onChange={(event) => setDraft((current) => ({ ...current, notes: event.target.value }))} style={textareaStyle} rows={2} />
        </Field>
      </div>

      <div style={footerStyle}>
        <button type="button" style={saveButtonStyle} onClick={() => void handleSave()} disabled={saving || !client?.id}>
          {saving ? ptBR.dashboard.products.saving : editingProductId ? "Salvar alterações" : ptBR.dashboard.products.save}
        </button>
        <button type="button" style={resetButtonStyle} onClick={editingProductId ? cancelEdit : resetDraft}>
          {editingProductId ? "Cancelar edição" : ptBR.dashboard.products.actions.reset}
        </button>
      </div>
    </section>
  );
}

const Field = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <label style={fieldStyle}>
    <span style={fieldLabelStyle}>{label}</span>
    {children}
  </label>
);

const panelStyle: React.CSSProperties = {
  marginBottom: 24,
  padding: 24,
};

const headerStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "flex-start",
  justifyContent: "space-between",
  gap: 16,
};

const eyebrowStyle: React.CSSProperties = {
  color: "var(--text-muted)",
  textTransform: "uppercase",
  letterSpacing: "0.08em",
  fontSize: 11,
  fontWeight: 700,
};

const titleStyle: React.CSSProperties = {
  margin: "4px 0 0",
  fontSize: 22,
  lineHeight: 1.1,
  color: "var(--text-strong)",
};

const subtitleStyle: React.CSSProperties = {
  margin: "8px 0 0",
  color: "var(--text-muted)",
  fontSize: 14,
};

const badgeStyle: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  padding: "8px 12px",
  borderRadius: 999,
  background: "rgba(107,56,212,0.08)",
  border: "1px solid rgba(107,56,212,0.14)",
  color: "var(--text-primary)",
  fontSize: 12,
  fontWeight: 600,
  whiteSpace: "nowrap",
};

const errorStyle: React.CSSProperties = {
  marginTop: 16,
  padding: "10px 12px",
  borderRadius: 14,
  background: "rgba(244,114,182,0.12)",
  color: "#9f1239",
  fontSize: 13,
};

const activeRowStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 12,
  marginTop: 16,
  padding: "12px 14px",
  borderRadius: 16,
  background: "rgba(255,255,255,0.75)",
  border: "1px solid rgba(107,56,212,0.10)",
};

const activeLabelStyle: React.CSSProperties = {
  color: "var(--text-secondary)",
  fontSize: 12,
  fontWeight: 700,
  textTransform: "uppercase",
  letterSpacing: "0.08em",
};

const activeValueStyle: React.CSSProperties = {
  color: "var(--text-primary)",
  fontSize: 14,
  fontWeight: 700,
};

const contextGridStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
  gap: 12,
  marginTop: 14,
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
  color: "var(--text-primary)",
  fontSize: 13,
  lineHeight: 1.5,
  fontWeight: 700,
};

const contextHintStyle: React.CSSProperties = {
  color: "var(--text-secondary)",
  fontSize: 12,
  lineHeight: 1.4,
};

const listStyle: React.CSSProperties = {
  display: "grid",
  gap: 12,
  marginTop: 16,
};

const emptyStyle: React.CSSProperties = {
  padding: "18px 16px",
  borderRadius: 16,
  border: "1px dashed rgba(107,56,212,0.18)",
  background: "rgba(255,255,255,0.72)",
  color: "var(--text-secondary)",
  fontSize: 14,
};

const productCardStyle = (active: boolean): React.CSSProperties => ({
  padding: 16,
  borderRadius: 18,
  border: active ? "1px solid rgba(107,56,212,0.28)" : "1px solid rgba(25,28,30,0.08)",
  background: active
    ? "linear-gradient(180deg, rgba(107,56,212,0.08) 0%, rgba(255,255,255,0.92) 100%)"
    : "rgba(255,255,255,0.8)",
});

const productCardHeaderStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "flex-start",
  justifyContent: "space-between",
  gap: 12,
};

const productMetaStyle: React.CSSProperties = {
  minWidth: 0,
  display: "grid",
  gap: 2,
};

const productNameStyle: React.CSSProperties = {
  color: "var(--text-strong)",
  fontSize: 15,
  fontWeight: 700,
};

const productSublineStyle: React.CSSProperties = {
  color: "var(--text-muted)",
  fontSize: 12,
};

const statusChipStyle = (status: string): React.CSSProperties => ({
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "5px 10px",
  borderRadius: 999,
  background:
    status === "prioritized" || status === "in_campaign"
      ? "rgba(16,185,129,0.14)"
      : status === "archived"
        ? "rgba(148,163,184,0.18)"
        : "rgba(107,56,212,0.10)",
  color:
    status === "prioritized" || status === "in_campaign"
      ? "#047857"
      : status === "archived"
        ? "#475569"
        : "var(--secondary)",
  fontSize: 11,
  fontWeight: 700,
  textTransform: "uppercase",
  letterSpacing: "0.04em",
  whiteSpace: "nowrap",
});

const productGridStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
  gap: 12,
  marginTop: 12,
};

const miniLabelStyle: React.CSSProperties = {
  color: "var(--text-muted)",
  fontSize: 11,
  fontWeight: 700,
  textTransform: "uppercase",
  letterSpacing: "0.06em",
};

const miniValueStyle: React.CSSProperties = {
  marginTop: 4,
  color: "var(--text-primary)",
  fontSize: 13,
  lineHeight: 1.4,
};

const proofStyle: React.CSSProperties = {
  marginTop: 12,
  color: "var(--text-secondary)",
  fontSize: 12,
  lineHeight: 1.5,
};

const actionRowStyle: React.CSSProperties = {
  display: "flex",
  flexWrap: "wrap",
  gap: 8,
  marginTop: 12,
};

const actionButtonStyle: React.CSSProperties = {
  border: "none",
  background: "rgba(107,56,212,0.10)",
  color: "var(--primary)",
  borderRadius: 999,
  padding: "8px 10px",
  fontSize: 12,
  fontWeight: 700,
  cursor: "pointer",
};

const actionButtonGhostStyle: React.CSSProperties = {
  ...actionButtonStyle,
  background: "rgba(148,163,184,0.14)",
  color: "var(--text-primary)",
};

const actionButtonDangerStyle: React.CSSProperties = {
  ...actionButtonStyle,
  background: "rgba(239,68,68,0.12)",
  color: "rgb(185,28,28)",
};

const createHeaderStyle: React.CSSProperties = {
  marginTop: 18,
  display: "flex",
  alignItems: "flex-start",
  justifyContent: "space-between",
  gap: 12,
};

const createTitleStyle: React.CSSProperties = {
  color: "var(--text-strong)",
  fontSize: 15,
  fontWeight: 700,
};

const createHintStyle: React.CSSProperties = {
  marginTop: 4,
  color: "var(--text-muted)",
  fontSize: 12,
};

const formGridStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
  gap: 12,
  marginTop: 12,
};

const fieldStyle: React.CSSProperties = {
  display: "grid",
  gap: 6,
};

const fieldLabelStyle: React.CSSProperties = {
  color: "var(--text-muted)",
  fontSize: 11,
  fontWeight: 700,
  textTransform: "uppercase",
  letterSpacing: "0.06em",
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  borderRadius: 14,
  border: "1px solid rgba(148,163,184,0.24)",
  background: "rgba(255,255,255,0.9)",
  color: "var(--text-primary)",
  padding: "10px 12px",
  fontSize: 13,
  outline: "none",
};

const textareaStyle: React.CSSProperties = {
  ...inputStyle,
  minHeight: 72,
  resize: "vertical",
};

const footerStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 10,
  marginTop: 14,
};

const saveButtonStyle: React.CSSProperties = {
  border: "none",
  background: "linear-gradient(135deg, rgba(107,56,212,0.98), rgba(132,85,239,0.96))",
  color: "#ffffff",
  borderRadius: 999,
  padding: "10px 14px",
  fontSize: 13,
  fontWeight: 700,
  cursor: "pointer",
};

const resetButtonStyle: React.CSSProperties = {
  border: "1px solid rgba(148,163,184,0.24)",
  background: "rgba(255,255,255,0.74)",
  color: "var(--text-primary)",
  borderRadius: 999,
  padding: "10px 14px",
  fontSize: 13,
  fontWeight: 600,
  cursor: "pointer",
};
