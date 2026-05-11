import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
import { AbsoluteFill, Audio, Sequence, interpolate, spring, useCurrentFrame } from "remotion";
const formatTrailLabel = (label, output) => `${label} · ${output}`;
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
export const buildCopyMotionNarration = (input) => {
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
                    text: input.regenerationMode === "revision" && input.regenerationNote
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
const chipStyle = (border, background, color = "inherit") => ({
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
const getHeadlineCards = (items, creativeSignals) => {
    const sourceCards = items
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
const Backdrop = ({ frame, accent }) => {
    const orbit = interpolate(frame, [0, 239], [0, 1]);
    return (_jsxs(_Fragment, { children: [_jsx("div", { style: {
                    position: "absolute",
                    inset: 0,
                    background: "radial-gradient(circle at 18% 18%, rgba(255,255,255,0.16), transparent 30%), radial-gradient(circle at 80% 18%, rgba(37,99,235,0.26), transparent 24%), radial-gradient(circle at 52% 86%, rgba(168,85,247,0.14), transparent 28%), linear-gradient(145deg, rgba(255,255,255,0.02), rgba(0,0,0,0.22))",
                } }), _jsx("div", { style: {
                    position: "absolute",
                    inset: -120,
                    background: "radial-gradient(circle, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.02) 28%, transparent 60%)",
                    transform: `translate3d(${Math.round((orbit - 0.5) * 36)}px, ${Math.round((0.5 - orbit) * 20)}px, 0) scale(${1.02 + orbit * 0.04})`,
                    filter: "blur(24px)",
                    opacity: 0.55,
                } }), _jsx("div", { style: {
                    position: "absolute",
                    inset: 0,
                    backgroundImage: "linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)",
                    backgroundSize: "96px 96px",
                    maskImage: "linear-gradient(to bottom, rgba(0,0,0,0.65), transparent 92%)",
                    opacity: 0.7,
                } }), _jsx("div", { style: {
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
                } })] }));
};
const SectionLabel = ({ text, accent }) => (_jsx("div", { style: {
        fontSize: 14,
        fontWeight: 800,
        textTransform: "uppercase",
        letterSpacing: "0.28em",
        color: accent,
    }, children: text }));
const HeadlineTile = ({ card, frame, highlight = false, compact = false, }) => {
    const delay = highlight ? 0 : card.position * 3;
    const appear = spring({
        frame: Math.max(0, frame - delay),
        fps: 30,
        config: { damping: highlight ? 14 : 16, stiffness: highlight ? 120 : 104 },
    });
    return (_jsxs("div", { style: {
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
        }, children: [_jsx("div", { style: {
                    position: "absolute",
                    inset: 0,
                    background: `radial-gradient(circle at 16% 18%, rgba(255,255,255,0.10), transparent 26%), radial-gradient(circle at 84% 18%, ${card.accent}33, transparent 24%)`,
                    pointerEvents: "none",
                } }), _jsxs("div", { style: { position: "relative", display: "grid", gap: 14, height: "100%" }, children: [_jsxs("div", { style: { display: "flex", justifyContent: "space-between", gap: 16, alignItems: "flex-start" }, children: [_jsx("div", { style: {
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
                                }, children: String(card.position).padStart(2, "0") }), _jsx("div", { style: {
                                    padding: "9px 12px",
                                    borderRadius: 999,
                                    border: `1px solid ${card.accent}44`,
                                    color: "#ffffff",
                                    background: "rgba(255,255,255,0.05)",
                                    fontSize: 14,
                                    fontWeight: 700,
                                    letterSpacing: "0.14em",
                                    textTransform: "uppercase",
                                }, children: "Final frame" })] }), _jsxs("div", { style: {
                            marginTop: "auto",
                            display: "grid",
                            gap: 10,
                        }, children: [_jsx("div", { style: {
                                    fontFamily: '"Iowan Old Style", Georgia, serif',
                                    fontSize: compact ? 32 : 42,
                                    lineHeight: 0.98,
                                    letterSpacing: "-0.04em",
                                    maxWidth: compact ? 360 : 420,
                                    textWrap: "balance",
                                }, children: card.title }), _jsx("div", { style: {
                                    display: "flex",
                                    flexWrap: "wrap",
                                    gap: 10,
                                    color: "rgba(255,255,255,0.82)",
                                    fontSize: 15,
                                }, children: _jsx("span", { style: chipStyle(`1px solid ${card.accent}44`, "rgba(255,255,255,0.05)"), children: card.meta }) })] })] })] }));
};
const SceneFrame = ({ children, accent, title, subtitle, }) => (_jsxs("div", { style: {
        width: "min(1120px, calc(100% - 96px))",
        padding: 42,
        borderRadius: 40,
        border: "1px solid rgba(255,255,255,0.12)",
        background: "rgba(255,255,255,0.06)",
        boxShadow: "0 34px 120px rgba(0,0,0,0.34)",
        backdropFilter: "blur(20px)",
    }, children: [_jsxs("div", { style: { display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }, children: [_jsx(SectionLabel, { text: title, accent: accent }), _jsx("div", { style: { maxWidth: 460, fontSize: 18, lineHeight: 1.45, color: "rgba(248,250,252,0.76)" }, children: subtitle })] }), _jsx("div", { style: { marginTop: 26 }, children: children })] }));
const HeroScene = ({ frame, accent, foreground, muted, summary, title, clientName, headlines, }) => {
    const progress = spring({ frame, fps: 30, config: { damping: 14, stiffness: 112 } });
    const translate = interpolate(frame, [0, 32], [24, 0], { extrapolateRight: "clamp" });
    return (_jsxs(AbsoluteFill, { style: { color: foreground, fontFamily: "Inter, system-ui, sans-serif", overflow: "hidden" }, children: [_jsx(Backdrop, { frame: frame, accent: accent }), _jsx(AbsoluteFill, { style: { justifyContent: "center", alignItems: "center", padding: 48 }, children: _jsxs("div", { style: {
                        width: "min(1120px, calc(100% - 64px))",
                        transform: `translateY(${Math.round((1 - progress) * 18)}px)`,
                        opacity: Math.min(1, progress),
                        display: "grid",
                        gap: 22,
                    }, children: [_jsxs("div", { style: { display: "flex", justifyContent: "space-between", gap: 16, flexWrap: "wrap", alignItems: "center" }, children: [_jsxs("div", { style: {
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
                                    }, children: [_jsx("span", { style: { width: 10, height: 10, borderRadius: 999, background: accent, display: "inline-block" } }), "Dire\u00E7\u00E3o final"] }), _jsx("div", { style: { color: "rgba(248,250,252,0.72)", fontSize: 16 }, children: clientName })] }), _jsxs("div", { style: {
                                display: "grid",
                                gridTemplateColumns: "minmax(0, 1.2fr) minmax(280px, 0.8fr)",
                                gap: 24,
                                alignItems: "end",
                            }, children: [_jsxs("div", { style: { display: "grid", gap: 18 }, children: [_jsx("div", { style: {
                                                fontFamily: '"Iowan Old Style", Georgia, serif',
                                                fontSize: 88,
                                                lineHeight: 0.92,
                                                letterSpacing: "-0.06em",
                                                maxWidth: 860,
                                                transform: `translateY(${translate}px)`,
                                                textWrap: "balance",
                                            }, children: title }), _jsx("div", { style: { maxWidth: 760, fontSize: 22, lineHeight: 1.45, color: muted }, children: summary }), _jsxs("div", { style: { display: "flex", flexWrap: "wrap", gap: 12 }, children: [_jsx("span", { style: chipStyle("1px solid rgba(255,255,255,0.14)", "rgba(255,255,255,0.05)"), children: "4 headlines" }), _jsx("span", { style: chipStyle("1px solid rgba(255,255,255,0.14)", "rgba(255,255,255,0.05)"), children: "pronto para aprova\u00E7\u00E3o" }), _jsx("span", { style: chipStyle("1px solid rgba(255,255,255,0.14)", "rgba(255,255,255,0.05)"), children: "publica\u00E7\u00E3o editorial" })] })] }), _jsx("div", { style: { display: "grid", gap: 14 }, children: headlines.slice(0, 2).map((card) => (_jsx(HeadlineTile, { card: card, frame: frame, compact: true }, `${card.position}-${card.title}`))) })] }), _jsx("div", { style: {
                                display: "grid",
                                gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
                                gap: 14,
                                marginTop: 8,
                            }, children: headlines.slice(0, 4).map((card) => (_jsxs("div", { style: {
                                    padding: 16,
                                    borderRadius: 22,
                                    border: "1px solid rgba(255,255,255,0.10)",
                                    background: "rgba(255,255,255,0.04)",
                                    minHeight: 96,
                                    display: "grid",
                                    alignContent: "space-between",
                                }, children: [_jsx("div", { style: { fontSize: 12, letterSpacing: "0.22em", textTransform: "uppercase", color: "rgba(248,250,252,0.64)" }, children: String(card.position).padStart(2, "0") }), _jsx("div", { style: { fontSize: 18, lineHeight: 1.1, fontWeight: 750, textWrap: "balance" }, children: card.title })] }, `${card.position}-${card.title}-peek`))) })] }) })] }));
};
const BoardScene = ({ frame, accent, foreground, muted, headlines, }) => {
    const progress = spring({ frame, fps: 30, config: { damping: 18, stiffness: 96 } });
    return (_jsxs(AbsoluteFill, { style: { color: foreground, fontFamily: "Inter, system-ui, sans-serif", overflow: "hidden" }, children: [_jsx(Backdrop, { frame: frame, accent: accent }), _jsx(AbsoluteFill, { style: { justifyContent: "center", alignItems: "center", padding: 48 }, children: _jsx("div", { style: {
                        width: "min(1120px, calc(100% - 64px))",
                        transform: `translateY(${Math.round((1 - progress) * 14)}px)`,
                        opacity: Math.min(1, progress),
                        display: "grid",
                        gap: 22,
                    }, children: _jsxs(SceneFrame, { accent: accent, title: "Headlines finais", subtitle: "A apresenta\u00E7\u00E3o agora funciona como um board editorial: limpo, leg\u00EDvel e pronto para a aprova\u00E7\u00E3o.", children: [_jsx("div", { style: {
                                    display: "grid",
                                    gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
                                    gap: 16,
                                }, children: headlines.slice(0, 4).map((card) => (_jsx(HeadlineTile, { card: card, frame: frame }, `${card.position}-${card.title}`))) }), _jsxs("div", { style: { display: "flex", flexWrap: "wrap", gap: 12, marginTop: 18, color: muted }, children: [_jsx("span", { style: chipStyle("1px solid rgba(255,255,255,0.14)", "rgba(255,255,255,0.05)"), children: "hierarquia limpa" }), _jsx("span", { style: chipStyle("1px solid rgba(255,255,255,0.14)", "rgba(255,255,255,0.05)"), children: "contraste alto" }), _jsx("span", { style: chipStyle("1px solid rgba(255,255,255,0.14)", "rgba(255,255,255,0.05)"), children: "acabamento de publica\u00E7\u00E3o" })] })] }) }) })] }));
};
const SpotlightScene = ({ frame, accent, foreground, muted, headlines, }) => {
    const progress = spring({ frame, fps: 30, config: { damping: 18, stiffness: 100 } });
    const lead = headlines[0] ?? headlines[1] ?? headlines[2] ?? headlines[3];
    const rest = headlines.filter((card) => card !== lead).slice(0, 3);
    return (_jsxs(AbsoluteFill, { style: { color: foreground, fontFamily: "Inter, system-ui, sans-serif", overflow: "hidden" }, children: [_jsx(Backdrop, { frame: frame, accent: accent }), _jsx(AbsoluteFill, { style: { justifyContent: "center", alignItems: "center", padding: 48 }, children: _jsxs("div", { style: {
                        width: "min(1120px, calc(100% - 64px))",
                        transform: `translateY(${Math.round((1 - progress) * 14)}px)`,
                        opacity: Math.min(1, progress),
                        display: "grid",
                        gridTemplateColumns: "minmax(0, 1.15fr) minmax(320px, 0.85fr)",
                        gap: 18,
                        alignItems: "stretch",
                    }, children: [lead ? (_jsxs("div", { style: {
                                padding: 34,
                                borderRadius: 36,
                                border: "1px solid rgba(255,255,255,0.12)",
                                background: "linear-gradient(160deg, rgba(255,255,255,0.10), rgba(255,255,255,0.04)), radial-gradient(circle at 12% 12%, rgba(37,99,235,0.28), transparent 26%)",
                                boxShadow: "0 32px 100px rgba(0,0,0,0.34)",
                                display: "grid",
                                gap: 16,
                            }, children: [_jsx(SectionLabel, { text: "Headline \u00E2ncora", accent: accent }), _jsx("div", { style: { fontFamily: '"Iowan Old Style", Georgia, serif', fontSize: 86, lineHeight: 0.93, letterSpacing: "-0.06em" }, children: lead.title }), _jsx("div", { style: { fontSize: 22, lineHeight: 1.45, color: muted, maxWidth: 640 }, children: lead.meta }), _jsxs("div", { style: { display: "flex", flexWrap: "wrap", gap: 12 }, children: [_jsx("span", { style: chipStyle("1px solid rgba(255,255,255,0.14)", "rgba(255,255,255,0.05)"), children: "o primeiro olhar guia a leitura" }), _jsx("span", { style: chipStyle("1px solid rgba(255,255,255,0.14)", "rgba(255,255,255,0.05)"), children: "acabamento premium" })] })] })) : null, _jsx("div", { style: { display: "grid", gap: 14 }, children: rest.map((card) => (_jsx(HeadlineTile, { card: card, frame: frame, compact: true }, `${card.position}-${card.title}`))) })] }) })] }));
};
const ClosingScene = ({ frame, accent, foreground, muted, references, headlines, clientName, }) => {
    const progress = spring({ frame, fps: 30, config: { damping: 18, stiffness: 100 } });
    return (_jsxs(AbsoluteFill, { style: { color: foreground, fontFamily: "Inter, system-ui, sans-serif", overflow: "hidden" }, children: [_jsx(Backdrop, { frame: frame, accent: accent }), _jsx(AbsoluteFill, { style: { justifyContent: "center", alignItems: "center", padding: 48 }, children: _jsxs("div", { style: {
                        width: "min(1120px, calc(100% - 64px))",
                        transform: `translateY(${Math.round((1 - progress) * 12)}px)`,
                        opacity: Math.min(1, progress),
                        display: "grid",
                        gap: 18,
                    }, children: [_jsxs("div", { style: {
                                padding: 38,
                                borderRadius: 40,
                                border: "1px solid rgba(255,255,255,0.12)",
                                background: "rgba(255,255,255,0.06)",
                                boxShadow: "0 34px 120px rgba(0,0,0,0.34)",
                                backdropFilter: "blur(20px)",
                                display: "grid",
                                gap: 18,
                            }, children: [_jsx(SectionLabel, { text: "Pronto para publicar", accent: accent }), _jsxs("div", { style: { display: "flex", justifyContent: "space-between", gap: 16, flexWrap: "wrap", alignItems: "end" }, children: [_jsxs("div", { style: { display: "grid", gap: 12 }, children: [_jsx("div", { style: { fontFamily: '"Iowan Old Style", Georgia, serif', fontSize: 76, lineHeight: 0.94, letterSpacing: "-0.05em" }, children: "Dire\u00E7\u00E3o final aprovada" }), _jsxs("div", { style: { fontSize: 22, lineHeight: 1.45, color: muted, maxWidth: 760 }, children: [clientName, " sai com uma pe\u00E7a de leitura r\u00E1pida, visual de alto acabamento e quatro headlines prontas para publica\u00E7\u00E3o."] })] }), _jsx("div", { style: {
                                                padding: "10px 16px",
                                                borderRadius: 999,
                                                border: "1px solid rgba(255,255,255,0.14)",
                                                background: "rgba(255,255,255,0.05)",
                                                fontSize: 15,
                                                fontWeight: 800,
                                                letterSpacing: "0.16em",
                                                textTransform: "uppercase",
                                            }, children: "Final cut" })] }), _jsx("div", { style: {
                                        display: "grid",
                                        gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
                                        gap: 12,
                                    }, children: headlines.slice(0, 4).map((card) => (_jsxs("div", { style: {
                                            padding: 16,
                                            borderRadius: 22,
                                            border: "1px solid rgba(255,255,255,0.10)",
                                            background: "rgba(255,255,255,0.04)",
                                            display: "grid",
                                            gap: 10,
                                        }, children: [_jsx("div", { style: { fontSize: 12, letterSpacing: "0.18em", textTransform: "uppercase", color: "rgba(248,250,252,0.62)" }, children: String(card.position).padStart(2, "0") }), _jsx("div", { style: { fontSize: 18, lineHeight: 1.1, fontWeight: 800, textWrap: "balance" }, children: card.title })] }, `${card.position}-${card.title}-final`))) })] }), _jsx("div", { style: {
                                display: "flex",
                                flexWrap: "wrap",
                                gap: 10,
                                alignItems: "center",
                            }, children: references.slice(0, 4).map((reference) => (_jsx("span", { style: chipStyle("1px solid rgba(255,255,255,0.12)", "rgba(255,255,255,0.04)", "rgba(248,250,252,0.80)"), children: reference }, reference))) })] }) })] }));
};
const HeadlineShell = ({ frame, palette, children, }) => {
    const pulse = interpolate(frame, [0, 240], [0.94, 1], { extrapolateRight: "clamp" });
    return (_jsxs(AbsoluteFill, { style: {
            color: palette.text,
            fontFamily: "Inter, system-ui, sans-serif",
            overflow: "hidden",
            background: `radial-gradient(circle at 12% 12%, ${palette.accentSoft}, transparent 26%), linear-gradient(135deg, ${palette.bg1}, ${palette.bg2})`,
        }, children: [_jsx(Backdrop, { frame: frame, accent: palette.accent }), _jsx(AbsoluteFill, { style: { justifyContent: "center", alignItems: "center", padding: 48 }, children: _jsx("div", { style: {
                        width: "min(1120px, calc(100% - 64px))",
                        transform: `scale(${pulse})`,
                        display: "grid",
                        gap: 18,
                    }, children: children }) })] }));
};
const HeadlineHeroScene = ({ frame, focusItem, artDirection, clientName, variantIndex, variantCount, regenerationNote, }) => {
    const progress = spring({ frame, fps: 30, config: { damping: 15, stiffness: 118 } });
    return (_jsx(HeadlineShell, { frame: frame, palette: artDirection.palette, children: _jsxs("div", { style: {
                opacity: Math.min(1, progress),
                transform: `translateY(${Math.round((1 - progress) * 16)}px)`,
                display: "grid",
                gap: 20,
            }, children: [_jsxs("div", { style: { display: "flex", justifyContent: "space-between", gap: 16, flexWrap: "wrap", alignItems: "center" }, children: [_jsx("div", { style: chipStyle(`1px solid ${artDirection.palette.border}`, artDirection.palette.panelStrong, artDirection.palette.accentText), children: artDirection.label }), _jsx("div", { style: { color: artDirection.palette.muted, fontSize: 16 }, children: clientName })] }), _jsxs("div", { style: {
                        display: "grid",
                        gridTemplateColumns: "minmax(0, 1.28fr) minmax(300px, 0.72fr)",
                        gap: 18,
                        alignItems: "stretch",
                    }, children: [_jsxs("div", { style: {
                                padding: 34,
                                borderRadius: 36,
                                border: `1px solid ${artDirection.palette.border}`,
                                background: artDirection.palette.panelStrong,
                                boxShadow: "0 30px 90px rgba(0,0,0,0.12)",
                                display: "grid",
                                gap: 18,
                            }, children: [_jsx(SectionLabel, { text: `Pauta ${String(variantIndex).padStart(2, "0")} de ${variantCount}`, accent: artDirection.palette.accent }), _jsx("div", { style: {
                                        fontFamily: '"Iowan Old Style", Georgia, serif',
                                        fontSize: 86,
                                        lineHeight: 0.94,
                                        letterSpacing: "-0.06em",
                                        maxWidth: 820,
                                        textWrap: "balance",
                                    }, children: focusItem.title }), _jsx("div", { style: { maxWidth: 760, fontSize: 24, lineHeight: 1.45, color: artDirection.palette.muted }, children: focusItem.objective }), _jsxs("div", { style: { display: "flex", flexWrap: "wrap", gap: 10 }, children: [_jsx("span", { style: chipStyle(`1px solid ${artDirection.palette.border}`, artDirection.palette.panel), children: focusItem.channel }), _jsx("span", { style: chipStyle(`1px solid ${artDirection.palette.border}`, artDirection.palette.panel), children: focusItem.format }), _jsx("span", { style: chipStyle(`1px solid ${artDirection.palette.border}`, artDirection.palette.panel), children: focusItem.pillar }), regenerationNote ? (_jsxs("span", { style: chipStyle(`1px solid ${artDirection.palette.border}`, artDirection.palette.panelStrong, artDirection.palette.accentText), children: ["revis\u00E3o: ", regenerationNote] })) : null] })] }), _jsxs("div", { style: { display: "grid", gap: 14 }, children: [_jsxs("div", { style: {
                                        padding: 26,
                                        borderRadius: 32,
                                        border: `1px solid ${artDirection.palette.border}`,
                                        background: "rgba(255,255,255,0.14)",
                                        boxShadow: "0 24px 70px rgba(0,0,0,0.10)",
                                        display: "grid",
                                        gap: 14,
                                    }, children: [_jsx(SectionLabel, { text: "Leitura r\u00E1pida", accent: artDirection.palette.accent }), _jsx("div", { style: { fontSize: 18, lineHeight: 1.5, color: artDirection.palette.text }, children: focusItem.reason })] }), _jsxs("div", { style: {
                                        padding: 26,
                                        borderRadius: 32,
                                        border: `1px solid ${artDirection.palette.border}`,
                                        background: "rgba(255,255,255,0.10)",
                                        display: "grid",
                                        gap: 14,
                                    }, children: [_jsx(SectionLabel, { text: "Dire\u00E7\u00E3o", accent: artDirection.palette.accent }), _jsx("div", { style: { fontSize: 18, lineHeight: 1.45, color: artDirection.palette.text }, children: artDirection.composition }), _jsx("div", { style: { display: "flex", flexWrap: "wrap", gap: 10 }, children: artDirection.notes.slice(0, 2).map((note) => (_jsx("span", { style: chipStyle(`1px solid ${artDirection.palette.border}`, artDirection.palette.panelStrong, artDirection.palette.accentText), children: note }, note))) })] })] })] })] }) }));
};
const HeadlineProofScene = ({ frame, focusItem, artDirection, }) => {
    const progress = spring({ frame, fps: 30, config: { damping: 18, stiffness: 104 } });
    return (_jsx(HeadlineShell, { frame: frame, palette: artDirection.palette, children: _jsxs("div", { style: {
                opacity: Math.min(1, progress),
                transform: `translateY(${Math.round((1 - progress) * 16)}px)`,
                display: "grid",
                gridTemplateColumns: "minmax(0, 1.05fr) minmax(320px, 0.95fr)",
                gap: 16,
                alignItems: "stretch",
            }, children: [_jsxs("div", { style: {
                        padding: 32,
                        borderRadius: 34,
                        border: `1px solid ${artDirection.palette.border}`,
                        background: artDirection.palette.panelStrong,
                        boxShadow: "0 30px 96px rgba(0,0,0,0.10)",
                        display: "grid",
                        gap: 18,
                    }, children: [_jsx(SectionLabel, { text: "Prova e processo", accent: artDirection.palette.accent }), _jsx("div", { style: { fontFamily: '"Iowan Old Style", Georgia, serif', fontSize: 62, lineHeight: 0.98, letterSpacing: "-0.05em" }, children: focusItem.hook }), _jsx("div", { style: { display: "grid", gap: 12 }, children: [focusItem.proof, focusItem.visualCue, focusItem.cta].map((line, index) => (_jsx("div", { style: {
                                    padding: "16px 18px",
                                    borderRadius: 22,
                                    border: `1px solid ${artDirection.palette.border}`,
                                    background: index === 0 ? artDirection.palette.panel : "rgba(255,255,255,0.05)",
                                    color: artDirection.palette.text,
                                    fontSize: 18,
                                    lineHeight: 1.45,
                                }, children: line }, line))) })] }), _jsx("div", { style: { display: "grid", gap: 14 }, children: [
                        { label: "Formato", value: focusItem.format },
                        { label: "Posicionamento", value: focusItem.pillar },
                        { label: "Fricção", value: focusItem.angle },
                    ].map((item) => (_jsxs("div", { style: {
                            padding: 22,
                            borderRadius: 28,
                            border: `1px solid ${artDirection.palette.border}`,
                            background: "rgba(255,255,255,0.10)",
                            display: "grid",
                            gap: 10,
                        }, children: [_jsx("div", { style: { fontSize: 12, textTransform: "uppercase", letterSpacing: "0.22em", color: artDirection.palette.accentText, fontWeight: 800 }, children: item.label }), _jsx("div", { style: { fontSize: 22, lineHeight: 1.2, fontWeight: 800, color: artDirection.palette.text, textWrap: "balance" }, children: item.value })] }, item.label))) })] }) }));
};
const HeadlineStructureScene = ({ frame, focusItem, artDirection, }) => {
    const progress = spring({ frame, fps: 30, config: { damping: 18, stiffness: 98 } });
    return (_jsx(HeadlineShell, { frame: frame, palette: artDirection.palette, children: _jsxs("div", { style: {
                opacity: Math.min(1, progress),
                transform: `translateY(${Math.round((1 - progress) * 14)}px)`,
                display: "grid",
                gap: 16,
            }, children: [_jsx(SectionLabel, { text: "Estrutura final", accent: artDirection.palette.accent }), _jsx("div", { style: {
                        display: "grid",
                        gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
                        gap: 14,
                    }, children: [focusItem.hook, focusItem.proof, focusItem.cta].map((text, index) => (_jsxs("div", { style: {
                            padding: 24,
                            borderRadius: 28,
                            border: `1px solid ${artDirection.palette.border}`,
                            background: index === 0 ? artDirection.palette.panelStrong : "rgba(255,255,255,0.10)",
                            minHeight: 190,
                            display: "grid",
                            alignContent: "space-between",
                            boxShadow: index === 0 ? "0 24px 68px rgba(0,0,0,0.10)" : "none",
                        }, children: [_jsx("div", { style: { fontSize: 12, textTransform: "uppercase", letterSpacing: "0.22em", color: artDirection.palette.accentText, fontWeight: 800 }, children: index === 0 ? "Hook" : index === 1 ? "Prova" : "CTA" }), _jsx("div", { style: { fontFamily: '"Iowan Old Style", Georgia, serif', fontSize: 34, lineHeight: 1.02, letterSpacing: "-0.04em", color: artDirection.palette.text, textWrap: "balance" }, children: text })] }, text))) })] }) }));
};
const HeadlineCloseScene = ({ frame, focusItem, artDirection, clientName, }) => {
    const progress = spring({ frame, fps: 30, config: { damping: 18, stiffness: 100 } });
    return (_jsx(HeadlineShell, { frame: frame, palette: artDirection.palette, children: _jsxs("div", { style: {
                opacity: Math.min(1, progress),
                transform: `translateY(${Math.round((1 - progress) * 12)}px)`,
                padding: 36,
                borderRadius: 38,
                border: `1px solid ${artDirection.palette.border}`,
                background: artDirection.palette.panelStrong,
                boxShadow: "0 34px 110px rgba(0,0,0,0.12)",
                display: "grid",
                gap: 18,
            }, children: [_jsx(SectionLabel, { text: "Entrega pronta", accent: artDirection.palette.accent }), _jsxs("div", { style: { display: "flex", justifyContent: "space-between", gap: 16, flexWrap: "wrap", alignItems: "end" }, children: [_jsxs("div", { style: { display: "grid", gap: 12 }, children: [_jsxs("div", { style: { fontFamily: '"Iowan Old Style", Georgia, serif', fontSize: 74, lineHeight: 0.96, letterSpacing: "-0.05em", maxWidth: 820, textWrap: "balance" }, children: ["Dire\u00E7\u00E3o aprovada para ", clientName] }), _jsxs("div", { style: { fontSize: 22, lineHeight: 1.45, color: artDirection.palette.muted, maxWidth: 760 }, children: [focusItem.title, " agora tem acabamento de pe\u00E7a final, leitura r\u00E1pida e um foco visual pr\u00F3prio para publica\u00E7\u00E3o."] })] }), _jsx("div", { style: {
                                padding: "10px 16px",
                                borderRadius: 999,
                                border: `1px solid ${artDirection.palette.border}`,
                                background: artDirection.palette.panel,
                                fontSize: 15,
                                fontWeight: 800,
                                letterSpacing: "0.16em",
                                textTransform: "uppercase",
                                color: artDirection.palette.accentText,
                            }, children: "Final cut" })] })] }) }));
};
const HeadlineMotionVideo = ({ clientName, focusItem, artDirection, variantIndex = 0, variantCount = 1, regenerationNote = null, soundtrackPath, soundtrackVolume = 0.12, }) => {
    const frame = useCurrentFrame();
    return (_jsxs(AbsoluteFill, { style: { background: artDirection?.palette.bg1 ?? "#0f172a" }, children: [soundtrackPath ? _jsx(Audio, { src: soundtrackPath, volume: soundtrackVolume }) : null, _jsx(Sequence, { from: headlineScene.hero.from, durationInFrames: headlineScene.hero.duration, children: _jsx(HeadlineHeroScene, { frame: frame - headlineScene.hero.from, focusItem: focusItem, artDirection: artDirection, clientName: clientName, variantIndex: variantIndex || (focusItem?.position ?? 1), variantCount: variantCount, regenerationNote: regenerationNote }) }), _jsx(Sequence, { from: headlineScene.proof.from, durationInFrames: headlineScene.proof.duration, children: _jsx(HeadlineProofScene, { frame: frame - headlineScene.proof.from, focusItem: focusItem, artDirection: artDirection }) }), _jsx(Sequence, { from: headlineScene.structure.from, durationInFrames: headlineScene.structure.duration, children: _jsx(HeadlineStructureScene, { frame: frame - headlineScene.structure.from, focusItem: focusItem, artDirection: artDirection }) }), _jsx(Sequence, { from: headlineScene.close.from, durationInFrames: headlineScene.close.duration, children: _jsx(HeadlineCloseScene, { frame: frame - headlineScene.close.from, focusItem: focusItem, artDirection: artDirection, clientName: clientName }) })] }));
};
export const CopyMotionVideo = ({ title, summary, clientName, focusItem, artDirection, variantType, variantLabel, variantIndex = 0, variantCount = 1, regenerationMode = null, regenerationNote = null, items, creativeSignals, references, direction, leadSignal, supportingSignals, accent, background, foreground, muted, soundtrackPath, soundtrackVolume = 0.12, }) => {
    const frame = useCurrentFrame();
    if (focusItem && artDirection && variantType === "headline") {
        return (_jsx(HeadlineMotionVideo, { clientName: clientName, focusItem: focusItem, artDirection: artDirection, variantIndex: variantIndex, variantCount: variantCount, regenerationNote: regenerationNote, soundtrackPath: soundtrackPath, soundtrackVolume: soundtrackVolume }));
    }
    const lead = leadSignal ?? creativeSignals[0] ?? null;
    const supporting = (supportingSignals?.length ? supportingSignals : creativeSignals.slice(1, 4)).slice(0, 3);
    const headlines = getHeadlineCards(items, creativeSignals);
    const narration = buildCopyMotionNarration({
        leadHook: lead?.hook ?? null,
        regenerationMode,
        regenerationNote,
    });
    return (_jsxs(AbsoluteFill, { style: { background }, children: [soundtrackPath ? _jsx(Audio, { src: soundtrackPath, volume: soundtrackVolume }) : null, _jsx(Sequence, { from: scene.hero.from, durationInFrames: scene.hero.duration, children: _jsx(HeroScene, { frame: frame - scene.hero.from, accent: accent, foreground: foreground, muted: muted, summary: summary, title: title, clientName: clientName, headlines: headlines }) }), _jsx(Sequence, { from: scene.board.from, durationInFrames: scene.board.duration, children: _jsx(BoardScene, { frame: frame - scene.board.from, accent: accent, foreground: foreground, muted: muted, headlines: headlines }) }), _jsx(Sequence, { from: scene.spotlight.from, durationInFrames: scene.spotlight.duration, children: _jsx(SpotlightScene, { frame: frame - scene.spotlight.from, accent: accent, foreground: foreground, muted: muted, headlines: headlines }) }), _jsx(Sequence, { from: scene.close.from, durationInFrames: scene.close.duration, children: _jsx(ClosingScene, { frame: frame - scene.close.from, accent: accent, foreground: foreground, muted: muted, references: references, headlines: headlines, clientName: clientName }) })] }));
};
