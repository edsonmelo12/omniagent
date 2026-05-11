import { createError } from "../../shared/http/errors.js";
import { findClientById } from "../clients/clients.repository.js";
import { assertCampaignStage } from "../campaign/campaign.service.js";
import { requireAgencyAccess } from "../tenancy/tenancy.service.js";
import { createApprovalRow, findApprovalById, listApprovalsByClientId, updateApprovalStatus } from "./approvals.repository.js";
export const getApprovals = async (input) => {
    await requireAgencyAccess(input.userId, input.agencyId);
    const client = await findClientById(input.agencyId, input.clientId);
    if (!client) {
        throw createError("NOT_FOUND", "Client not found", 404);
    }
    const approvals = await listApprovalsByClientId(input.clientId);
    return {
        client,
        approvals,
    };
};
export const createApproval = async (input) => {
    await requireAgencyAccess(input.userId, input.agencyId);
    const client = await findClientById(input.agencyId, input.clientId);
    if (!client) {
        throw createError("NOT_FOUND", "Client not found", 404);
    }
    await assertCampaignStage({
        userId: input.userId,
        agencyId: input.agencyId,
        clientId: input.clientId,
        allowedStages: ["schedule", "approval"],
    });
    const approval = await createApprovalRow({
        clientId: input.clientId,
        artifactType: input.artifactType,
        artifactId: input.artifactId,
        status: input.status,
        notes: input.notes ?? null,
    });
    return {
        client,
        approval,
    };
};
export const setApprovalStatus = async (input) => {
    await requireAgencyAccess(input.userId, input.agencyId);
    const approval = await findApprovalById(input.approvalId);
    if (!approval) {
        throw createError("NOT_FOUND", "Approval not found", 404);
    }
    await assertCampaignStage({
        userId: input.userId,
        agencyId: input.agencyId,
        clientId: approval.client_id,
        allowedStages: ["schedule", "approval"],
    });
    const updated = await updateApprovalStatus(input.approvalId, input.status, input.notes ?? null, input.userId);
    if (!updated) {
        throw createError("NOT_FOUND", "Approval not found", 404);
    }
    return updated;
};
