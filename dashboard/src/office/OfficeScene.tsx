import { Application, extend } from "@pixi/react";
import { Container, Graphics } from "pixi.js";
import { useCallback, useMemo } from "react";
import { useSquadStore } from "@/store/useSquadStore";
import { AgentDesk, CELL_W, CELL_H, GRID_OFFSET_X, GRID_OFFSET_Y } from "./AgentDesk";
import { HandoffEnvelope } from "./HandoffEnvelope";
import { sortAgentsByDesk, findAgent } from "@/lib/normalizeState";
import { drawFloor } from "./drawRoom";
import { drawBookshelf, drawPlant, drawClock, drawWhiteboard, drawCoffeeMachine, drawFilingCabinet } from "./drawFurniture";
import { TILE, COLORS } from "./palette";
import type { Graphics as PixiGraphics } from "pixi.js";
import { ptBR } from "@/i18n/pt-BR";

extend({ Container, Graphics });

const MIN_STAGE_W = 400;
const MIN_STAGE_H = 320;

export function OfficeScene() {
  const state = useSquadStore((s) =>
    s.selectedSquad ? s.activeStates.get(s.selectedSquad) : undefined
  );
  const squadInfo = useSquadStore((s) =>
    s.selectedSquad ? s.squads.get(s.selectedSquad) : undefined
  );

  const agents = useMemo(
    () => (state?.agents ? sortAgentsByDesk(state.agents) : []),
    [state]
  );

  const maxCol = agents.length > 0 ? Math.max(...agents.map(a => a.desk.col)) : 1;
  const maxRow = agents.length > 0 ? Math.max(...agents.map(a => a.desk.row)) : 1;

  const wallTop = TILE * 2;
  const marginX = Math.round(TILE * 1.5);
  const marginY = TILE * 1;
  const floorW = marginX * 2 + maxCol * CELL_W;
  const floorH = marginY * 2 + maxRow * CELL_H;
  const floorX = GRID_OFFSET_X - marginX;
  const floorY = GRID_OFFSET_Y - marginY;
  const stageW = Math.max(floorX + floorW + marginX, MIN_STAGE_W);
  const stageH = Math.max(floorY + floorH + marginY, MIN_STAGE_H);

  const drawBackground = useCallback(
    (g: PixiGraphics) => {
      g.clear();

      // Dark void surround (Gather.town style)
      g.rect(0, 0, stageW, stageH);
      g.fill({ color: 0x101018 });

      // Floor (wood planks)
      drawFloor(g, floorW, floorH, floorX, floorY);

      // Top wall — clean cream
      g.rect(floorX - 1, 0, floorW + 2, wallTop);
      g.fill({ color: COLORS.wallFace });
      // Baseboard (dark strip at bottom of wall)
      g.rect(floorX - 1, wallTop - 3, floorW + 2, 3);
      g.fill({ color: COLORS.wallShadow });
      // Shadow cast on floor from wall
      g.rect(floorX, wallTop, floorW, 3);
      g.fill({ color: 0x000000, alpha: 0.06 });

      // Room borders (thin dark lines around floor perimeter)
      g.rect(floorX - 1, wallTop, 1, floorH);
      g.fill({ color: COLORS.wallShadow });
      g.rect(floorX + floorW, wallTop, 1, floorH);
      g.fill({ color: COLORS.wallShadow });
      g.rect(floorX - 1, wallTop + floorH, floorW + 2, 1);
      g.fill({ color: COLORS.wallShadow });

      // Wall-mounted furniture
      const wallItemY = 4;
      drawBookshelf(g, floorX + 10, wallItemY);
      if (floorW > 300) {
        drawBookshelf(g, floorX + floorW - 74, wallItemY);
      }
      drawWhiteboard(g, floorX + floorW / 2 - 24, wallItemY);
      drawClock(g, floorX + floorW / 2 + 28, wallItemY + 6);

      // Floor furniture
      drawPlant(g, floorX + 4, floorY + 8);
      drawPlant(g, floorX + floorW - 36, floorY + 8);
      drawPlant(g, floorX + 4, floorY + floorH - 36);
      drawFilingCabinet(g, floorX + floorW - 36, floorY + floorH - 52);

      if (floorH > 200) {
        drawCoffeeMachine(g, floorX + floorW - 36, floorY + floorH / 2 - 16);
      }
    },
    [stageW, stageH, floorW, floorH, floorX, floorY, wallTop]
  );

  if (!state) {
    return (
      <div
        style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "var(--text-secondary)",
          flexDirection: "column",
          gap: 8,
          background:
            "radial-gradient(circle at center, rgba(0, 212, 255, 0.06), transparent 34%), linear-gradient(180deg, rgba(10,12,18,0.98) 0%, rgba(14,15,24,0.98) 100%)",
        }}
      >
        {squadInfo ? (
          <>
            <span style={{ fontSize: 40 }}>{squadInfo.icon}</span>
            <span style={{ fontSize: 16 }}>{squadInfo.name}</span>
            <span style={{ fontSize: 12 }}>{squadInfo.description}</span>
            <span style={{ fontSize: 11, marginTop: 8 }}>{ptBR.office.inactive}</span>
          </>
        ) : (
          <span>{ptBR.office.emptySelection}</span>
        )}
      </div>
    );
  }

  return (
    <div style={sceneShellStyle}>
      <div style={sceneOverlayStyle}>
        <div style={sceneEyebrowStyle}>{ptBR.office.eyebrow}</div>
        <div style={sceneTitleStyle}>{squadInfo?.name ?? ptBR.office.titleFallback}</div>
        <div style={sceneSubtitleStyle}>
          {ptBR.office.step(state.step.current, state.step.total, state.step.label)}
          {state.handoff ? ` · ${state.handoff.from} → ${state.handoff.to}` : ""}
        </div>
      </div>
      <div style={sceneFrameStyle}>
        <Application width={stageW} height={stageH} backgroundColor={0x101018}>
          <pixiContainer>
            <pixiGraphics draw={drawBackground} />
            {agents.map((agent, i) => (
              <AgentDesk key={agent.id} agent={agent} agentIndex={i} />
            ))}
            {state.handoff &&
              (() => {
                const from = findAgent(state, state.handoff!.from);
                const to = findAgent(state, state.handoff!.to);
                if (!from || !to) return null;
                return (
                  <HandoffEnvelope
                    handoff={state.handoff!}
                    fromAgent={from}
                    toAgent={to}
                  />
                );
              })()}
          </pixiContainer>
        </Application>
      </div>
    </div>
  );
}

const sceneShellStyle: React.CSSProperties = {
  flex: 1,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  position: "relative",
  overflow: "hidden",
  background:
    "radial-gradient(circle at center, rgba(0, 212, 255, 0.05), transparent 28%), linear-gradient(180deg, rgba(10,12,18,0.98) 0%, rgba(14,15,24,0.98) 100%)",
};

const sceneFrameStyle: React.CSSProperties = {
  position: "relative",
  zIndex: 1,
  padding: 20,
  borderRadius: 24,
  border: "1px solid rgba(255,255,255,0.08)",
  background: "rgba(255,255,255,0.02)",
  boxShadow: "0 24px 60px rgba(0,0,0,0.28)",
};

const sceneOverlayStyle: React.CSSProperties = {
  position: "absolute",
  top: 16,
  left: 16,
  zIndex: 2,
  display: "grid",
  gap: 4,
  padding: "10px 12px",
  borderRadius: 14,
  border: "1px solid rgba(255,255,255,0.08)",
  background: "rgba(10, 12, 18, 0.78)",
  backdropFilter: "blur(10px)",
  pointerEvents: "none",
};

const sceneEyebrowStyle: React.CSSProperties = {
  fontSize: 11,
  textTransform: "uppercase",
  letterSpacing: 1,
  color: "var(--text-secondary)",
  fontWeight: 700,
};

const sceneTitleStyle: React.CSSProperties = {
  fontSize: 15,
  fontWeight: 800,
  color: "var(--text-primary)",
};

const sceneSubtitleStyle: React.CSSProperties = {
  fontSize: 12,
  color: "var(--text-secondary)",
  lineHeight: 1.45,
  maxWidth: 380,
};
