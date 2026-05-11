import { start } from "./app/server.js";

start().catch((error) => {
  console.error("❌ CRITICAL CRASH:", error);
  process.exit(1);
});
