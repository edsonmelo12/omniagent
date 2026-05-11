import type { ReactNode } from "react";
import { AbsoluteFill, Audio, Sequence, interpolate, spring, useCurrentFrame } from "remotion";

type WorkflowTrailItem = {
  label: string;
  role: string;
  output: string;
};

type CreativeSignal = {
  id: string;
  position: number;
  title: string;
  pillar: string;
  angle: string;
  objective: string;
  reason: string;
  format: string;
  hook: string;
  proof: string;
  cta: string;
  visualCue: string;
  channel: string;
  status: string;
};

type FocusItem = {
  position: number;
  channel: string;
  title: string;
  pillar: string;
  angle: string;
  objective: string;
  reason: string;
  format: string;
  hook: string;
  proof: string;
  cta: string;
  visualCue: string;
  status: string;
};

type Direction = {
  firstPass: string;
  hookSystem: string;
  masterAsset: string;
  contentRhythm: string;
  productImagePolicy: string;
  rules: string[];
};

type NarrationLine = {
  from: number;
  duration: number;
  text: string;
};

type ArtDirection = {
  key: string;
  label: string;
  mood: string;
  composition: string;
  notes: readonly string[];
  palette: {
    bg1: string;
    bg2: string;
    panel: string;
    panelStrong: string;
    border: string;
    text: string;
    muted: string;
    accent: string;
    accentSoft: string;
    accentText: string;
  };
};

type HeadlineCard = {
  position: number;
  title: string;
  meta: string;
  accent: string;
  tint: string;
};

export type CopyMotionVideoProps = {
  title: string;
  summary: string;
  clientName: string;
  focusItem?: FocusItem | null;
  artDirection?: ArtDirection | null;
  variantType?: "overview" | "headline";
  variantLabel?: string;
  variantIndex?: number;
  variantCount?: number;
  regenerationMode?: "auto" | "alternate" | "revision" | null;
  regenerationNote?: string | null;
  workflowOwner: string;
  workflowSquad: string;
  workflowTrail: WorkflowTrailItem[];
  items: Array<{
    position: number;
    title: string;
    channel: string;
    format: string;
    status: string;
    objective: string;
    reason: string;
    hook: string;
    proof: string;
    cta: string;
    visualCue: string;
  }>;
  creativeSignals: CreativeSignal[];
  references: string[];
  direction: Direction;
  leadSignal?: CreativeSignal | null;
  supportingSignals?: CreativeSignal[];
  accent: string;
  accentSoft: string;
  background: string;
  foreground: string;
  muted: string;
  border: string;
  htmlContent?: string;
  renderMode?: string;
  renderEngine?: string;
  soundtrackPath?: string;
  soundtrackVolume?: number;
  renderJob?: {
    compositionId: string;
    fps: number;
    durationInFrames: number;
    width: number;
    height: number;
  };
};

const formatTrailLabel = (label: string, output: string) => `${label} · ${output}`;

const scene = {
  hero: { from: 0, duration: 64 },
  board: { from: 64, duration: 72 },
  spotlight: { from: 136, duration: 56 },
  close: { from: 192, duration: 48 },
};

const headlineScene = {
  hero: { from: 0, duration: 70 },
  proof: { from: 70, duration: 82 },
  structure: { from: 152, duration: 44 },
  close: { from: 196, duration: 44 },
};

export const buildCopyMotionNarration = (
  input:
    | string
    | {
        leadHook?: string | null;
        focusItem?: FocusItem | null;
        artDirection?: ArtDirection | null;
        regenerationMode?: "auto" | "alternate" | "revision" | null;
        regenerationNote?: string | null;
      }
    | null,
) => {
  if (typeof input === "object" && input?.focusItem && input.artDirection) {
    return {
      hero: [
        { from: 0, duration: 24, text: `${input.focusItem.channel} · ${input.focusItem.format}.` },
        { from: 24, duration: 22, text: input.focusItem.title },
        { from: 46, duration: 18, text: `${input.artDirection.label} para ${input.focusItem.pillar}.` },
      ],
      lead: [
        { from: 0, duration: 22, text: input.focusItem.objective },
        { from: 22, duration: 22, text: input.focusItem.reason },
        { from: 44, duration: 20, text: input.focusItem.hook },
      ],
      support: [
        { from: 0, duration: 20, text: input.focusItem.proof },
        { from: 20, duration: 20, text: input.focusItem.visualCue },
        { from: 40, duration: 16, text: input.focusItem.cta },
      ],
      close: [
        { from: 0, duration: 18, text: `Pauta ${String(input.focusItem.position).padStart(2, "0")} pronta para aprovação.` },
        { from: 18, duration: 18, text: input.artDirection.mood },
        {
          from: 36,
          duration: 12,
          text:
            input.regenerationMode === "revision" && input.regenerationNote
              ? `Ajuste aplicado: ${input.regenerationNote}`
              : "Pronto para publicar.",
        },
      ],
    };
  }

  const leadHook = typeof input === "string" ? input : input?.leadHook ?? null;

  return {
    hero: [
      { from: 0, duration: 24, text: "Quatro headlines. Uma direção única." },
      { from: 24, duration: 20, text: "A peça abre com presença, contraste e leitura imediata." },
      { from: 44, duration: 20, text: "Menos explicação. Mais impacto visual." },
    ],
    lead: [
      { from: 0, duration: 24, text: "A primeira headline define a percepção em segundos." },
      { from: 24, duration: 24, text: "Depois, a hierarquia segura o ritmo e mantém clareza." },
      {
        from: 48,
        duration: 24,
        text: leadHook ? `${leadHook} O restante só reforça a tese.` : "O restante só reforça a tese.",
      },
    ],
    support: [
      { from: 0, duration: 20, text: "As demais peças preservam consistência e cadência." },
      { from: 20, duration: 20, text: "O board fecha com variação suficiente para publicar." },
      { from: 40, duration: 16, text: "Tudo pronto para aprovação." },
    ],
    close: [
      { from: 0, duration: 20, text: "O pacote entra em revisão com acabamento de peça final." },
      { from: 20, duration: 18, text: "A última leitura já é a leitura de publicação." },
      { from: 38, duration: 10, text: "Pronto para publicar." },
    ],
  };
};

const chipStyle = (border: string, background: string, color: string = "inherit") => ({
  display: "inline-flex",
  alignItems: "center",
  gap: 10,
  padding: "10px 16px",
  borderRadius: 999,
  border: `1px solid ${border}`,
  background,
  fontSize: 18,
  fontWeight: 700,
  letterSpacing: "0.04em",
  color,
});

const getHeadlineCards = (items: CopyMotionVideoProps["items"], creativeSignals: CreativeSignal[]): HeadlineCard[] => {
  const sourceCards: HeadlineCard[] = items
    .filter((item) => item.title.trim().length > 0)
    .slice(0, 4)
    .map((item, index) => ({
      position: item.position || index + 1,
      title: item.title,
      meta: `${item.channel} · ${item.format}`,
      accent: index % 2 === 0 ? "#2563eb" : "#8b5cf6",
      tint: index % 2 === 0 ? "rgba(37,99,235,0.16)" : "rgba(139,92,246,0.16)",
    }));

  if (sourceCards.length >= 4) {
    return sourceCards.slice(0, 4);
  }

  const extraCards = creativeSignals.slice(0, 4 - sourceCards.length).map((signal, index) => ({
    position: signal.position,
    title: signal.title,
    meta: `${signal.channel} · ${signal.format}`,
    accent: index % 2 === 0 ? "#0ea5e9" : "#f97316",
    tint: index % 2 === 0 ? "rgba(14,165,233,0.14)" : "rgba(249,115,22,0.14)",
  }));

  return [...sourceCards, ...extraCards].slice(0, 4);
};

const Backdrop = ({ frame, accent }: { frame: number; accent: string }) => {
  const orbit = interpolate(frame, [0, 239], [0, 1]);
  return (
    <>
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(circle at 18% 18%, rgba(255,255,255,0.16), transparent 30%), radial-gradient(circle at 80% 18%, rgba(37,99,235,0.26), transparent 24%), radial-gradient(circle at 52% 86%, rgba(168,85,247,0.14), transparent 28%), linear-gradient(145deg, rgba(255,255,255,0.02), rgba(0,0,0,0.22))",
        }}
      />
      <div
        style={{
          position: "absolute",
          inset: -120,
          background:
            "radial-gradient(circle, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.02) 28%, transparent 60%)",
          transform: `translate3d(${Math.round((orbit - 0.5) * 36)}px, ${Math.round((0.5 - orbit) * 20)}px, 0) scale(${1.02 + orbit * 0.04})`,
          filter: "blur(24px)",
          opacity: 0.55,
        }}
      />
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)",
          backgroundSize: "96px 96px",
          maskImage: "linear-gradient(to bottom, rgba(0,0,0,0.65), transparent 92%)",
          opacity: 0.7,
        }}
      />
      <div
        style={{
          position: "absolute",
          top: -220,
          right: -180,
          width: 520,
          height: 520,
          borderRadius: "50%",
          background: `radial-gradient(circle, ${accent} 0%, rgba(37,99,235,0.24) 30%, transparent 70%)`,
          filter: "blur(16px)",
          opacity: 0.7,
          transform: `translate3d(${Math.round((orbit - 0.5) * 28)}px, 0, 0)`,
        }}
      />
    </>
  );
};

const SectionLabel = ({ text, accent }: { text: string; accent: string }) => (
  <div
    style={{
      fontSize: 14,
      fontWeight: 800,
      textTransform: "uppercase",
      letterSpacing: "0.28em",
      color: accent,
    }}
  >
    {text}
  </div>
);

const HeadlineTile = ({
  card,
  frame,
  highlight = false,
  compact = false,
}: {
  card: HeadlineCard;
  frame: number;
  highlight?: boolean;
  compact?: boolean;
}) => {
  const delay = highlight ? 0 : card.position * 3;
  const appear = spring({
    frame: Math.max(0, frame - delay),
    fps: 30,
    config: { damping: highlight ? 14 : 16, stiffness: highlight ? 120 : 104 },
  });
  return (
    <div
      style={{
        position: "relative",
        minHeight: compact ? 164 : 236,
        padding: compact ? 22 : 28,
        borderRadius: compact ? 28 : 32,
        border: "1px solid rgba(255,255,255,0.16)",
        background: `linear-gradient(160deg, ${card.tint}, rgba(255,255,255,0.05))`,
        boxShadow: highlight ? "0 30px 80px rgba(0,0,0,0.34)" : "0 18px 54px rgba(0,0,0,0.22)",
        overflow: "hidden",
        transform: `translateY(${Math.round((1 - appear) * 18)}px) scale(${0.97 + appear * 0.03})`,
        opacity: Math.min(1, appear),
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: `radial-gradient(circle at 16% 18%, rgba(255,255,255,0.10), transparent 26%), radial-gradient(circle at 84% 18%, ${card.accent}33, transparent 24%)`,
          pointerEvents: "none",
        }}
      />
      <div style={{ position: "relative", display: "grid", gap: 14, height: "100%" }}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 16, alignItems: "flex-start" }}>
          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: 18,
              border: `1px solid ${card.accent}55`,
              background: "rgba(255,255,255,0.06)",
              display: "grid",
              placeItems: "center",
              color: card.accent,
              fontWeight: 900,
              fontSize: 18,
              letterSpacing: "0.12em",
            }}
          >
            {String(card.position).padStart(2, "0")}
          </div>
          <div
            style={{
              padding: "9px 12px",
              borderRadius: 999,
              border: `1px solid ${card.accent}44`,
              color: "#ffffff",
              background: "rgba(255,255,255,0.05)",
              fontSize: 14,
              fontWeight: 700,
              letterSpacing: "0.14em",
              textTransform: "uppercase",
            }}
          >
            Final frame
          </div>
        </div>

        <div
          style={{
            marginTop: "auto",
            display: "grid",
            gap: 10,
          }}
        >
          <div
            style={{
              fontFamily: '"Iowan Old Style", Georgia, serif',
              fontSize: compact ? 32 : 42,
              lineHeight: 0.98,
              letterSpacing: "-0.04em",
              maxWidth: compact ? 360 : 420,
              textWrap: "balance",
            }}
          >
            {card.title}
          </div>
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: 10,
              color: "rgba(255,255,255,0.82)",
              fontSize: 15,
            }}
          >
            <span style={chipStyle(`1px solid ${card.accent}44`, "rgba(255,255,255,0.05)")}>{card.meta}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

const SceneFrame = ({
  children,
  accent,
  title,
  subtitle,
}: {
  children: ReactNode;
  accent: string;
  title: string;
  subtitle: string;
}) => (
  <div
    style={{
      width: "min(1120px, calc(100% - 96px))",
      padding: 42,
      borderRadius: 40,
      border: "1px solid rgba(255,255,255,0.12)",
      background: "rgba(255,255,255,0.06)",
      boxShadow: "0 34px 120px rgba(0,0,0,0.34)",
      backdropFilter: "blur(20px)",
    }}
  >
    <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
      <SectionLabel text={title} accent={accent} />
      <div style={{ maxWidth: 460, fontSize: 18, lineHeight: 1.45, color: "rgba(248,250,252,0.76)" }}>{subtitle}</div>
    </div>
    <div style={{ marginTop: 26 }}>{children}</div>
  </div>
);

const HeroScene = ({
  frame,
  accent,
  foreground,
  muted,
  summary,
  title,
  clientName,
  headlines,
}: {
  frame: number;
  accent: string;
  foreground: string;
  muted: string;
  summary: string;
  title: string;
  clientName: string;
  headlines: HeadlineCard[];
}) => {
  const progress = spring({ frame, fps: 30, config: { damping: 14, stiffness: 112 } });
  const translate = interpolate(frame, [0, 32], [24, 0], { extrapolateRight: "clamp" });
  return (
    <AbsoluteFill style={{ color: foreground, fontFamily: "Inter, system-ui, sans-serif", overflow: "hidden" }}>
      <Backdrop frame={frame} accent={accent} />
      <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", padding: 48 }}>
        <div
          style={{
            width: "min(1120px, calc(100% - 64px))",
            transform: `translateY(${Math.round((1 - progress) * 18)}px)`,
            opacity: Math.min(1, progress),
            display: "grid",
            gap: 22,
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", gap: 16, flexWrap: "wrap", alignItems: "center" }}>
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 12,
                padding: "10px 16px",
                borderRadius: 999,
                border: "1px solid rgba(255,255,255,0.16)",
                background: "rgba(255,255,255,0.05)",
                fontSize: 14,
                fontWeight: 800,
                letterSpacing: "0.22em",
                textTransform: "uppercase",
              }}
            >
              <span style={{ width: 10, height: 10, borderRadius: 999, background: accent, display: "inline-block" }} />
              Direção final
            </div>
            <div style={{ color: "rgba(248,250,252,0.72)", fontSize: 16 }}>{clientName}</div>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "minmax(0, 1.2fr) minmax(280px, 0.8fr)",
              gap: 24,
              alignItems: "end",
            }}
          >
            <div style={{ display: "grid", gap: 18 }}>
              <div
                style={{
                  fontFamily: '"Iowan Old Style", Georgia, serif',
                  fontSize: 88,
                  lineHeight: 0.92,
                  letterSpacing: "-0.06em",
                  maxWidth: 860,
                  transform: `translateY(${translate}px)`,
                  textWrap: "balance",
                }}
              >
                {title}
              </div>
              <div style={{ maxWidth: 760, fontSize: 22, lineHeight: 1.45, color: muted }}>{summary}</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
                <span style={chipStyle("1px solid rgba(255,255,255,0.14)", "rgba(255,255,255,0.05)")}>4 headlines</span>
                <span style={chipStyle("1px solid rgba(255,255,255,0.14)", "rgba(255,255,255,0.05)")}>pronto para aprovação</span>
                <span style={chipStyle("1px solid rgba(255,255,255,0.14)", "rgba(255,255,255,0.05)")}>publicação editorial</span>
              </div>
            </div>

            <div style={{ display: "grid", gap: 14 }}>
              {headlines.slice(0, 2).map((card) => (
                <HeadlineTile key={`${card.position}-${card.title}`} card={card} frame={frame} compact />
              ))}
            </div>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
              gap: 14,
              marginTop: 8,
            }}
          >
            {headlines.slice(0, 4).map((card) => (
              <div
                key={`${card.position}-${card.title}-peek`}
                style={{
                  padding: 16,
                  borderRadius: 22,
                  border: "1px solid rgba(255,255,255,0.10)",
                  background: "rgba(255,255,255,0.04)",
                  minHeight: 96,
                  display: "grid",
                  alignContent: "space-between",
                }}
              >
                <div style={{ fontSize: 12, letterSpacing: "0.22em", textTransform: "uppercase", color: "rgba(248,250,252,0.64)" }}>
                  {String(card.position).padStart(2, "0")}
                </div>
                <div style={{ fontSize: 18, lineHeight: 1.1, fontWeight: 750, textWrap: "balance" }}>{card.title}</div>
              </div>
            ))}
          </div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

const BoardScene = ({
  frame,
  accent,
  foreground,
  muted,
  headlines,
}: {
  frame: number;
  accent: string;
  foreground: string;
  muted: string;
  headlines: HeadlineCard[];
}) => {
  const progress = spring({ frame, fps: 30, config: { damping: 18, stiffness: 96 } });
  return (
    <AbsoluteFill style={{ color: foreground, fontFamily: "Inter, system-ui, sans-serif", overflow: "hidden" }}>
      <Backdrop frame={frame} accent={accent} />
      <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", padding: 48 }}>
        <div
          style={{
            width: "min(1120px, calc(100% - 64px))",
            transform: `translateY(${Math.round((1 - progress) * 14)}px)`,
            opacity: Math.min(1, progress),
            display: "grid",
            gap: 22,
          }}
        >
          <SceneFrame
            accent={accent}
            title="Headlines finais"
            subtitle="A apresentação agora funciona como um board editorial: limpo, legível e pronto para a aprovação."
          >
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
                gap: 16,
              }}
            >
              {headlines.slice(0, 4).map((card) => (
                <HeadlineTile key={`${card.position}-${card.title}`} card={card} frame={frame} />
              ))}
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 12, marginTop: 18, color: muted }}>
              <span style={chipStyle("1px solid rgba(255,255,255,0.14)", "rgba(255,255,255,0.05)")}>hierarquia limpa</span>
              <span style={chipStyle("1px solid rgba(255,255,255,0.14)", "rgba(255,255,255,0.05)")}>contraste alto</span>
              <span style={chipStyle("1px solid rgba(255,255,255,0.14)", "rgba(255,255,255,0.05)")}>acabamento de publicação</span>
            </div>
          </SceneFrame>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

const SpotlightScene = ({
  frame,
  accent,
  foreground,
  muted,
  headlines,
}: {
  frame: number;
  accent: string;
  foreground: string;
  muted: string;
  headlines: HeadlineCard[];
}) => {
  const progress = spring({ frame, fps: 30, config: { damping: 18, stiffness: 100 } });
  const lead = headlines[0] ?? headlines[1] ?? headlines[2] ?? headlines[3];
  const rest = headlines.filter((card) => card !== lead).slice(0, 3);
  return (
    <AbsoluteFill style={{ color: foreground, fontFamily: "Inter, system-ui, sans-serif", overflow: "hidden" }}>
      <Backdrop frame={frame} accent={accent} />
      <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", padding: 48 }}>
        <div
          style={{
            width: "min(1120px, calc(100% - 64px))",
            transform: `translateY(${Math.round((1 - progress) * 14)}px)`,
            opacity: Math.min(1, progress),
            display: "grid",
            gridTemplateColumns: "minmax(0, 1.15fr) minmax(320px, 0.85fr)",
            gap: 18,
            alignItems: "stretch",
          }}
        >
          {lead ? (
            <div
              style={{
                padding: 34,
                borderRadius: 36,
                border: "1px solid rgba(255,255,255,0.12)",
                background:
                  "linear-gradient(160deg, rgba(255,255,255,0.10), rgba(255,255,255,0.04)), radial-gradient(circle at 12% 12%, rgba(37,99,235,0.28), transparent 26%)",
                boxShadow: "0 32px 100px rgba(0,0,0,0.34)",
                display: "grid",
                gap: 16,
              }}
            >
              <SectionLabel text="Headline âncora" accent={accent} />
              <div style={{ fontFamily: '"Iowan Old Style", Georgia, serif', fontSize: 86, lineHeight: 0.93, letterSpacing: "-0.06em" }}>
                {lead.title}
              </div>
              <div style={{ fontSize: 22, lineHeight: 1.45, color: muted, maxWidth: 640 }}>{lead.meta}</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
                <span style={chipStyle("1px solid rgba(255,255,255,0.14)", "rgba(255,255,255,0.05)")}>o primeiro olhar guia a leitura</span>
                <span style={chipStyle("1px solid rgba(255,255,255,0.14)", "rgba(255,255,255,0.05)")}>acabamento premium</span>
              </div>
            </div>
          ) : null}

          <div style={{ display: "grid", gap: 14 }}>
            {rest.map((card) => (
              <HeadlineTile key={`${card.position}-${card.title}`} card={card} frame={frame} compact />
            ))}
          </div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

const ClosingScene = ({
  frame,
  accent,
  foreground,
  muted,
  references,
  headlines,
  clientName,
}: {
  frame: number;
  accent: string;
  foreground: string;
  muted: string;
  references: string[];
  headlines: HeadlineCard[];
  clientName: string;
}) => {
  const progress = spring({ frame, fps: 30, config: { damping: 18, stiffness: 100 } });
  return (
    <AbsoluteFill style={{ color: foreground, fontFamily: "Inter, system-ui, sans-serif", overflow: "hidden" }}>
      <Backdrop frame={frame} accent={accent} />
      <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", padding: 48 }}>
        <div
          style={{
            width: "min(1120px, calc(100% - 64px))",
            transform: `translateY(${Math.round((1 - progress) * 12)}px)`,
            opacity: Math.min(1, progress),
            display: "grid",
            gap: 18,
          }}
        >
          <div
            style={{
              padding: 38,
              borderRadius: 40,
              border: "1px solid rgba(255,255,255,0.12)",
              background: "rgba(255,255,255,0.06)",
              boxShadow: "0 34px 120px rgba(0,0,0,0.34)",
              backdropFilter: "blur(20px)",
              display: "grid",
              gap: 18,
            }}
          >
            <SectionLabel text="Pronto para publicar" accent={accent} />
            <div style={{ display: "flex", justifyContent: "space-between", gap: 16, flexWrap: "wrap", alignItems: "end" }}>
              <div style={{ display: "grid", gap: 12 }}>
                <div style={{ fontFamily: '"Iowan Old Style", Georgia, serif', fontSize: 76, lineHeight: 0.94, letterSpacing: "-0.05em" }}>
                  Direção final aprovada
                </div>
                <div style={{ fontSize: 22, lineHeight: 1.45, color: muted, maxWidth: 760 }}>
                  {clientName} sai com uma peça de leitura rápida, visual de alto acabamento e quatro headlines prontas para publicação.
                </div>
              </div>
              <div
                style={{
                  padding: "10px 16px",
                  borderRadius: 999,
                  border: "1px solid rgba(255,255,255,0.14)",
                  background: "rgba(255,255,255,0.05)",
                  fontSize: 15,
                  fontWeight: 800,
                  letterSpacing: "0.16em",
                  textTransform: "uppercase",
                }}
              >
                Final cut
              </div>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
                gap: 12,
              }}
            >
              {headlines.slice(0, 4).map((card) => (
                <div
                  key={`${card.position}-${card.title}-final`}
                  style={{
                    padding: 16,
                    borderRadius: 22,
                    border: "1px solid rgba(255,255,255,0.10)",
                    background: "rgba(255,255,255,0.04)",
                    display: "grid",
                    gap: 10,
                  }}
                >
                  <div style={{ fontSize: 12, letterSpacing: "0.18em", textTransform: "uppercase", color: "rgba(248,250,252,0.62)" }}>
                    {String(card.position).padStart(2, "0")}
                  </div>
                  <div style={{ fontSize: 18, lineHeight: 1.1, fontWeight: 800, textWrap: "balance" }}>{card.title}</div>
                </div>
              ))}
            </div>
          </div>

          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: 10,
              alignItems: "center",
            }}
          >
            {references.slice(0, 4).map((reference) => (
              <span
                key={reference}
                style={chipStyle("1px solid rgba(255,255,255,0.12)", "rgba(255,255,255,0.04)", "rgba(248,250,252,0.80)")}
              >
                {reference}
              </span>
            ))}
          </div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

const HeadlineShell = ({
  frame,
  palette,
  children,
}: {
  frame: number;
  palette: ArtDirection["palette"];
  children: ReactNode;
}) => {
  const pulse = interpolate(frame, [0, 240], [0.94, 1], { extrapolateRight: "clamp" });
  return (
    <AbsoluteFill
      style={{
        color: palette.text,
        fontFamily: "Inter, system-ui, sans-serif",
        overflow: "hidden",
        background: `radial-gradient(circle at 12% 12%, ${palette.accentSoft}, transparent 26%), linear-gradient(135deg, ${palette.bg1}, ${palette.bg2})`,
      }}
    >
      <Backdrop frame={frame} accent={palette.accent} />
      <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", padding: 48 }}>
        <div
          style={{
            width: "min(1120px, calc(100% - 64px))",
            transform: `scale(${pulse})`,
            display: "grid",
            gap: 18,
          }}
        >
          {children}
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

const HeadlineHeroScene = ({
  frame,
  focusItem,
  artDirection,
  clientName,
  variantIndex,
  variantCount,
  regenerationNote,
}: {
  frame: number;
  focusItem: FocusItem;
  artDirection: ArtDirection;
  clientName: string;
  variantIndex: number;
  variantCount: number;
  regenerationNote?: string | null;
}) => {
  const progress = spring({ frame, fps: 30, config: { damping: 15, stiffness: 118 } });
  return (
    <HeadlineShell frame={frame} palette={artDirection.palette}>
      <div
        style={{
          opacity: Math.min(1, progress),
          transform: `translateY(${Math.round((1 - progress) * 16)}px)`,
          display: "grid",
          gap: 20,
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", gap: 16, flexWrap: "wrap", alignItems: "center" }}>
          <div style={chipStyle(`1px solid ${artDirection.palette.border}`, artDirection.palette.panelStrong, artDirection.palette.accentText)}>
            {artDirection.label}
          </div>
          <div style={{ color: artDirection.palette.muted, fontSize: 16 }}>{clientName}</div>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "minmax(0, 1.28fr) minmax(300px, 0.72fr)",
            gap: 18,
            alignItems: "stretch",
          }}
        >
          <div
            style={{
              padding: 34,
              borderRadius: 36,
              border: `1px solid ${artDirection.palette.border}`,
              background: artDirection.palette.panelStrong,
              boxShadow: "0 30px 90px rgba(0,0,0,0.12)",
              display: "grid",
              gap: 18,
            }}
          >
            <SectionLabel text={`Pauta ${String(variantIndex).padStart(2, "0")} de ${variantCount}`} accent={artDirection.palette.accent} />
            <div
              style={{
                fontFamily: '"Iowan Old Style", Georgia, serif',
                fontSize: 86,
                lineHeight: 0.94,
                letterSpacing: "-0.06em",
                maxWidth: 820,
                textWrap: "balance",
              }}
            >
              {focusItem.title}
            </div>
            <div style={{ maxWidth: 760, fontSize: 24, lineHeight: 1.45, color: artDirection.palette.muted }}>{focusItem.objective}</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
                <span style={chipStyle(`1px solid ${artDirection.palette.border}`, artDirection.palette.panel)}>{focusItem.channel}</span>
                <span style={chipStyle(`1px solid ${artDirection.palette.border}`, artDirection.palette.panel)}>{focusItem.format}</span>
                <span style={chipStyle(`1px solid ${artDirection.palette.border}`, artDirection.palette.panel)}>{focusItem.pillar}</span>
                {regenerationNote ? (
                  <span style={chipStyle(`1px solid ${artDirection.palette.border}`, artDirection.palette.panelStrong, artDirection.palette.accentText)}>
                    revisão: {regenerationNote}
                  </span>
                ) : null}
              </div>
            </div>

          <div style={{ display: "grid", gap: 14 }}>
            <div
              style={{
                padding: 26,
                borderRadius: 32,
                border: `1px solid ${artDirection.palette.border}`,
                background: "rgba(255,255,255,0.14)",
                boxShadow: "0 24px 70px rgba(0,0,0,0.10)",
                display: "grid",
                gap: 14,
              }}
            >
              <SectionLabel text="Leitura rápida" accent={artDirection.palette.accent} />
              <div style={{ fontSize: 18, lineHeight: 1.5, color: artDirection.palette.text }}>{focusItem.reason}</div>
            </div>
            <div
              style={{
                padding: 26,
                borderRadius: 32,
                border: `1px solid ${artDirection.palette.border}`,
                background: "rgba(255,255,255,0.10)",
                display: "grid",
                gap: 14,
              }}
            >
              <SectionLabel text="Direção" accent={artDirection.palette.accent} />
              <div style={{ fontSize: 18, lineHeight: 1.45, color: artDirection.palette.text }}>{artDirection.composition}</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
                {artDirection.notes.slice(0, 2).map((note) => (
                  <span key={note} style={chipStyle(`1px solid ${artDirection.palette.border}`, artDirection.palette.panelStrong, artDirection.palette.accentText)}>
                    {note}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </HeadlineShell>
  );
};

const HeadlineProofScene = ({
  frame,
  focusItem,
  artDirection,
}: {
  frame: number;
  focusItem: FocusItem;
  artDirection: ArtDirection;
}) => {
  const progress = spring({ frame, fps: 30, config: { damping: 18, stiffness: 104 } });
  return (
    <HeadlineShell frame={frame} palette={artDirection.palette}>
      <div
        style={{
          opacity: Math.min(1, progress),
          transform: `translateY(${Math.round((1 - progress) * 16)}px)`,
          display: "grid",
          gridTemplateColumns: "minmax(0, 1.05fr) minmax(320px, 0.95fr)",
          gap: 16,
          alignItems: "stretch",
        }}
      >
        <div
          style={{
            padding: 32,
            borderRadius: 34,
            border: `1px solid ${artDirection.palette.border}`,
            background: artDirection.palette.panelStrong,
            boxShadow: "0 30px 96px rgba(0,0,0,0.10)",
            display: "grid",
            gap: 18,
          }}
        >
          <SectionLabel text="Prova e processo" accent={artDirection.palette.accent} />
          <div style={{ fontFamily: '"Iowan Old Style", Georgia, serif', fontSize: 62, lineHeight: 0.98, letterSpacing: "-0.05em" }}>{focusItem.hook}</div>
          <div style={{ display: "grid", gap: 12 }}>
            {[focusItem.proof, focusItem.visualCue, focusItem.cta].map((line, index) => (
              <div
                key={line}
                style={{
                  padding: "16px 18px",
                  borderRadius: 22,
                  border: `1px solid ${artDirection.palette.border}`,
                  background: index === 0 ? artDirection.palette.panel : "rgba(255,255,255,0.05)",
                  color: artDirection.palette.text,
                  fontSize: 18,
                  lineHeight: 1.45,
                }}
              >
                {line}
              </div>
            ))}
          </div>
        </div>

        <div style={{ display: "grid", gap: 14 }}>
          {[
            { label: "Formato", value: focusItem.format },
            { label: "Posicionamento", value: focusItem.pillar },
            { label: "Fricção", value: focusItem.angle },
          ].map((item) => (
            <div
              key={item.label}
              style={{
                padding: 22,
                borderRadius: 28,
                border: `1px solid ${artDirection.palette.border}`,
                background: "rgba(255,255,255,0.10)",
                display: "grid",
                gap: 10,
              }}
            >
              <div style={{ fontSize: 12, textTransform: "uppercase", letterSpacing: "0.22em", color: artDirection.palette.accentText, fontWeight: 800 }}>{item.label}</div>
              <div style={{ fontSize: 22, lineHeight: 1.2, fontWeight: 800, color: artDirection.palette.text, textWrap: "balance" }}>{item.value}</div>
            </div>
          ))}
        </div>
      </div>
    </HeadlineShell>
  );
};

const HeadlineStructureScene = ({
  frame,
  focusItem,
  artDirection,
}: {
  frame: number;
  focusItem: FocusItem;
  artDirection: ArtDirection;
}) => {
  const progress = spring({ frame, fps: 30, config: { damping: 18, stiffness: 98 } });
  return (
    <HeadlineShell frame={frame} palette={artDirection.palette}>
      <div
        style={{
          opacity: Math.min(1, progress),
          transform: `translateY(${Math.round((1 - progress) * 14)}px)`,
          display: "grid",
          gap: 16,
        }}
      >
        <SectionLabel text="Estrutura final" accent={artDirection.palette.accent} />
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
            gap: 14,
          }}
        >
          {[focusItem.hook, focusItem.proof, focusItem.cta].map((text, index) => (
            <div
              key={text}
              style={{
                padding: 24,
                borderRadius: 28,
                border: `1px solid ${artDirection.palette.border}`,
                background: index === 0 ? artDirection.palette.panelStrong : "rgba(255,255,255,0.10)",
                minHeight: 190,
                display: "grid",
                alignContent: "space-between",
                boxShadow: index === 0 ? "0 24px 68px rgba(0,0,0,0.10)" : "none",
              }}
            >
              <div style={{ fontSize: 12, textTransform: "uppercase", letterSpacing: "0.22em", color: artDirection.palette.accentText, fontWeight: 800 }}>
                {index === 0 ? "Hook" : index === 1 ? "Prova" : "CTA"}
              </div>
              <div style={{ fontFamily: '"Iowan Old Style", Georgia, serif', fontSize: 34, lineHeight: 1.02, letterSpacing: "-0.04em", color: artDirection.palette.text, textWrap: "balance" }}>
                {text}
              </div>
            </div>
          ))}
        </div>
      </div>
    </HeadlineShell>
  );
};

const HeadlineCloseScene = ({
  frame,
  focusItem,
  artDirection,
  clientName,
}: {
  frame: number;
  focusItem: FocusItem;
  artDirection: ArtDirection;
  clientName: string;
}) => {
  const progress = spring({ frame, fps: 30, config: { damping: 18, stiffness: 100 } });
  return (
    <HeadlineShell frame={frame} palette={artDirection.palette}>
      <div
        style={{
          opacity: Math.min(1, progress),
          transform: `translateY(${Math.round((1 - progress) * 12)}px)`,
          padding: 36,
          borderRadius: 38,
          border: `1px solid ${artDirection.palette.border}`,
          background: artDirection.palette.panelStrong,
          boxShadow: "0 34px 110px rgba(0,0,0,0.12)",
          display: "grid",
          gap: 18,
        }}
      >
        <SectionLabel text="Entrega pronta" accent={artDirection.palette.accent} />
        <div style={{ display: "flex", justifyContent: "space-between", gap: 16, flexWrap: "wrap", alignItems: "end" }}>
          <div style={{ display: "grid", gap: 12 }}>
            <div style={{ fontFamily: '"Iowan Old Style", Georgia, serif', fontSize: 74, lineHeight: 0.96, letterSpacing: "-0.05em", maxWidth: 820, textWrap: "balance" }}>
              Direção aprovada para {clientName}
            </div>
            <div style={{ fontSize: 22, lineHeight: 1.45, color: artDirection.palette.muted, maxWidth: 760 }}>
              {focusItem.title} agora tem acabamento de peça final, leitura rápida e um foco visual próprio para publicação.
            </div>
          </div>
          <div
            style={{
              padding: "10px 16px",
              borderRadius: 999,
              border: `1px solid ${artDirection.palette.border}`,
              background: artDirection.palette.panel,
              fontSize: 15,
              fontWeight: 800,
              letterSpacing: "0.16em",
              textTransform: "uppercase",
              color: artDirection.palette.accentText,
            }}
          >
            Final cut
          </div>
        </div>
      </div>
    </HeadlineShell>
  );
};

const HeadlineMotionVideo = ({
  clientName,
  focusItem,
  artDirection,
  variantIndex = 0,
  variantCount = 1,
  regenerationNote = null,
  soundtrackPath,
  soundtrackVolume = 0.12,
}: Pick<
  CopyMotionVideoProps,
  "clientName" | "focusItem" | "artDirection" | "variantIndex" | "variantCount" | "regenerationNote" | "soundtrackPath" | "soundtrackVolume"
>) => {
  const frame = useCurrentFrame();

  return (
    <AbsoluteFill style={{ background: artDirection?.palette.bg1 ?? "#0f172a" }}>
      {soundtrackPath ? <Audio src={soundtrackPath} volume={soundtrackVolume} /> : null}
      <Sequence from={headlineScene.hero.from} durationInFrames={headlineScene.hero.duration}>
        <HeadlineHeroScene
          frame={frame - headlineScene.hero.from}
          focusItem={focusItem as FocusItem}
          artDirection={artDirection as ArtDirection}
          clientName={clientName}
          variantIndex={variantIndex || (focusItem?.position ?? 1)}
          variantCount={variantCount}
          regenerationNote={regenerationNote}
        />
      </Sequence>
      <Sequence from={headlineScene.proof.from} durationInFrames={headlineScene.proof.duration}>
        <HeadlineProofScene
          frame={frame - headlineScene.proof.from}
          focusItem={focusItem as FocusItem}
          artDirection={artDirection as ArtDirection}
        />
      </Sequence>
      <Sequence from={headlineScene.structure.from} durationInFrames={headlineScene.structure.duration}>
        <HeadlineStructureScene
          frame={frame - headlineScene.structure.from}
          focusItem={focusItem as FocusItem}
          artDirection={artDirection as ArtDirection}
        />
      </Sequence>
      <Sequence from={headlineScene.close.from} durationInFrames={headlineScene.close.duration}>
        <HeadlineCloseScene
          frame={frame - headlineScene.close.from}
          focusItem={focusItem as FocusItem}
          artDirection={artDirection as ArtDirection}
          clientName={clientName}
        />
      </Sequence>
    </AbsoluteFill>
  );
};

export const CopyMotionVideo = ({
  title,
  summary,
  clientName,
  focusItem,
  artDirection,
  variantType,
  variantLabel,
  variantIndex = 0,
  variantCount = 1,
  regenerationMode = null,
  regenerationNote = null,
  items,
  creativeSignals,
  references,
  direction,
  leadSignal,
  supportingSignals,
  accent,
  background,
  foreground,
  muted,
  soundtrackPath,
  soundtrackVolume = 0.12,
}: CopyMotionVideoProps) => {
  const frame = useCurrentFrame();
  if (focusItem && artDirection && variantType === "headline") {
    return (
      <HeadlineMotionVideo
        clientName={clientName}
        focusItem={focusItem}
        artDirection={artDirection}
        variantIndex={variantIndex}
        variantCount={variantCount}
        regenerationNote={regenerationNote}
        soundtrackPath={soundtrackPath}
        soundtrackVolume={soundtrackVolume}
      />
    );
  }

  const lead = leadSignal ?? creativeSignals[0] ?? null;
  const supporting = (supportingSignals?.length ? supportingSignals : creativeSignals.slice(1, 4)).slice(0, 3);
  const headlines = getHeadlineCards(items, creativeSignals);
  const narration = buildCopyMotionNarration({
    leadHook: lead?.hook ?? null,
    regenerationMode,
    regenerationNote,
  });

  return (
    <AbsoluteFill style={{ background }}>
      {soundtrackPath ? <Audio src={soundtrackPath} volume={soundtrackVolume} /> : null}
      <Sequence from={scene.hero.from} durationInFrames={scene.hero.duration}>
        <HeroScene
          frame={frame - scene.hero.from}
          accent={accent}
          foreground={foreground}
          muted={muted}
          summary={summary}
          title={title}
          clientName={clientName}
          headlines={headlines}
        />
      </Sequence>

      <Sequence from={scene.board.from} durationInFrames={scene.board.duration}>
        <BoardScene frame={frame - scene.board.from} accent={accent} foreground={foreground} muted={muted} headlines={headlines} />
      </Sequence>

      <Sequence from={scene.spotlight.from} durationInFrames={scene.spotlight.duration}>
        <SpotlightScene frame={frame - scene.spotlight.from} accent={accent} foreground={foreground} muted={muted} headlines={headlines} />
      </Sequence>

      <Sequence from={scene.close.from} durationInFrames={scene.close.duration}>
        <ClosingScene frame={frame - scene.close.from} accent={accent} foreground={foreground} muted={muted} references={references} headlines={headlines} clientName={clientName} />
      </Sequence>
    </AbsoluteFill>
  );
};
