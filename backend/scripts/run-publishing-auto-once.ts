import { processPublishingAutoQueueOnce } from "../src/modules/publishing/publishing-auto.service.js";

const run = async () => {
  const result = await processPublishingAutoQueueOnce();
  console.log(JSON.stringify({ ok: true, result }, null, 2));
};

void run().catch((error) => {
  console.error(JSON.stringify({ ok: false, error: error instanceof Error ? error.message : "Unexpected error" }));
  process.exitCode = 1;
});
