import { successEnvelope } from "../shared/http/response-envelope.js";
import { buildRequestContext } from "../shared/http/request-context.js";
import { isDatabaseReady } from "../shared/db/database.js";
import { registerAuthRoutes } from "../modules/auth/auth.routes.js";
import { registerTenancyRoutes } from "../modules/tenancy/tenancy.routes.js";
import { registerClientsRoutes } from "../modules/clients/clients.routes.js";
import { registerSocialDiscoveryRoutes } from "../modules/social-discovery/social-discovery.routes.js";
import { registerSocialIntelligenceRoutes } from "../modules/social-intelligence/social-intelligence.routes.js";
import { registerSocialPresenceRoutes } from "../modules/social-presence/social-presence.routes.js";
import { registerBrandProfileRoutes } from "../modules/brand-profile/brand-profile.routes.js";
import { registerCreativeProfileRoutes } from "../modules/creative-profile/creative-profile.routes.js";
import { registerOfferProfileRoutes } from "../modules/offer-profile/offer-profile.routes.js";
import { registerMarketResearchRoutes } from "../modules/market-research/market-research.routes.js";
import { registerMarketPresenceRoutes } from "../modules/market-presence/market-presence.routes.js";
import { registerClientReportRoutes } from "../modules/client-report/client-report.routes.js";
import { registerClientProductsRoutes } from "../modules/client-products/client-products.routes.js";
import { registerClientRecordRoutes } from "../modules/client-record/client-record.routes.js";
import { registerProposalRoutes } from "../modules/proposals/proposals.routes.js";
import { registerContentRoutes } from "../modules/content/content.routes.js";
import { registerMonitoringRoutes } from "../modules/monitoring/monitoring.routes.js";
import { registerPublishingRoutes } from "../modules/publishing/publishing.routes.js";
import { registerApprovalsRoutes } from "../modules/approvals/approvals.routes.js";
import { registerAssistantRoutes } from "../modules/assistant/assistant.routes.js";
import { registerProductEventRoutes } from "../modules/product-events/product-events.routes.js";
import { registerYoutubeStrategyRoutes } from "../modules/youtube-strategy/youtube-strategy.routes.js";
import { registerStrategyIntelligenceRoutes } from "../modules/strategy-intelligence/strategy-intelligence.routes.js";
import { registerCampaignRoutes } from "../modules/campaign/campaign.routes.js";
export const registerRoutes = (app) => {
    app.get("/health", async (request, reply) => {
        const context = buildRequestContext(request);
        reply.header("x-request-id", context.requestId);
        return successEnvelope({ status: "ok" }, { requestId: context.requestId });
    });
    app.get("/ready", async (request, reply) => {
        const context = buildRequestContext(request);
        reply.header("x-request-id", context.requestId);
        const ready = await isDatabaseReady();
        if (!ready) {
            reply.status(503);
            return successEnvelope({
                status: "not-ready",
                databaseConnected: false,
            }, { requestId: context.requestId });
        }
        return successEnvelope({
            status: "ready",
            databaseConnected: true,
        }, { requestId: context.requestId });
    });
    registerAuthRoutes(app);
    registerTenancyRoutes(app);
    registerClientsRoutes(app);
    registerSocialDiscoveryRoutes(app);
    registerSocialIntelligenceRoutes(app);
    registerSocialPresenceRoutes(app);
    registerBrandProfileRoutes(app);
    registerCreativeProfileRoutes(app);
    registerOfferProfileRoutes(app);
    registerMarketResearchRoutes(app);
    registerMarketPresenceRoutes(app);
    registerClientReportRoutes(app);
    registerClientProductsRoutes(app);
    registerClientRecordRoutes(app);
    registerProposalRoutes(app);
    registerContentRoutes(app);
    registerMonitoringRoutes(app);
    registerPublishingRoutes(app);
    registerApprovalsRoutes(app);
    registerAssistantRoutes(app);
    registerProductEventRoutes(app);
    registerYoutubeStrategyRoutes(app);
    registerStrategyIntelligenceRoutes(app);
    registerCampaignRoutes(app);
};
