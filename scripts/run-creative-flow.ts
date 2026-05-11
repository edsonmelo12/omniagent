import { execSync } from "node:child_process";

const run = (cmd: string) => {
  execSync(cmd, { stdio: "inherit", cwd: process.cwd() });
};

run("npx tsx scripts/log-gallery.ts");
run("npx tsx scripts/generate-issue.ts");

console.log("Fluxo criativo executado: log + issue gerados.");
