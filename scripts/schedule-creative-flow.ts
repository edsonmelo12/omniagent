import { execSync } from "node:child_process";

const runs = Number(process.env.RUNS ?? "2");
const intervalSeconds = Number(process.env.INTERVAL_SECONDS ?? "5");

const runOnce = () => {
  console.log("Executando creative:flow...");
  execSync("npm run creative:flow", { stdio: "inherit" });
};

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const main = async () => {
  for (let i = 0; i < runs; i += 1) {
    runOnce();
    if (i < runs - 1) {
      console.log(`Aguardando ${intervalSeconds}s para próxima rodada...`);
      await delay(intervalSeconds * 1000);
    }
  }
  console.log("Agendamento completo.");
};

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
