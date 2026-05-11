import { createAssetIntent } from "../src/modules/atos-analista/atos-analista.service.js";
import { findClientById } from "../src/modules/clients/clients.repository.js";

/**
 * Intention Hook Script
 * Usage: npx tsx backend/scripts/commit-intent.ts {clientId} {assetId} {intentDataJson}
 */

async function main() {
  const [clientId, assetId, intentDataJson] = process.argv.slice(2);

  if (!clientId || !assetId || !intentDataJson) {
    console.error("Usage: commit-intent {clientId} {assetId} {intentDataJson}");
    process.exit(1);
  }

  try {
    const intentData = JSON.parse(intentDataJson);
    const userId = "system-orchestrator"; // Internal system ID
    const agencyId = "default-agency"; // Current default

    const result = await createAssetIntent({
      assetId,
      clientId,
      ...intentData
    });

    console.log(`✅ Intent persisted for Asset ${assetId}`);
    process.exit(0);
  } catch (error) {
    console.error("❌ Failed to persist intent:", error);
    process.exit(1);
  }
}

main();
