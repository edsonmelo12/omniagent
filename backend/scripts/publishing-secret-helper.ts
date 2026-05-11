import { resolvePublishingSecret } from "../src/modules/publishing/publishing-secrets.js";

type Command = "make" | "validate";

const readArg = (name: string) => {
  const index = process.argv.findIndex((value) => value === `--${name}`);
  if (index < 0) return null;
  const value = process.argv[index + 1];
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : null;
};

const normalizeToken = (value: string) =>
  value
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");

const printUsage = () => {
  console.log("Usage:");
  console.log("  npm run publishing:secret:make -- --client amiclube --channel instagram --account main");
  console.log("  npm run publishing:secret:validate -- --secret-ref env://PUBLISHING_AMICLUBE_INSTAGRAM_MAIN");
};

const runMake = () => {
  const client = readArg("client");
  const channel = readArg("channel");
  const account = readArg("account");

  if (!client || !channel || !account) {
    console.error("Missing required args: --client, --channel, --account");
    printUsage();
    process.exit(1);
  }

  const envVar = `PUBLISHING_${normalizeToken(client)}_${normalizeToken(channel)}_${normalizeToken(account)}`;
  const secretRef = `env://${envVar}`;
  const payloadTemplate = {
    accessToken: "<token>",
    instagramBusinessAccountId: "<1784...>",
  };

  console.log(`secretRef: ${secretRef}`);
  console.log(`env var : ${envVar}`);
  console.log(`${envVar}='${JSON.stringify(payloadTemplate)}'`);
};

const runValidate = () => {
  const secretRef = readArg("secret-ref");

  if (!secretRef) {
    console.error("Missing required arg: --secret-ref");
    printUsage();
    process.exit(1);
  }

  const result = resolvePublishingSecret(secretRef);

  console.log(`secretRef : ${result.reference}`);
  console.log(`backend   : ${result.backend}`);
  console.log(`resolved  : ${result.resolved}`);
  console.log(`envKey    : ${result.envKey ?? "-"}`);
  console.log(`fields    : ${result.fields.join(", ") || "-"}`);

  if (!result.resolved) {
    console.log(`errorCode : ${result.errorCode ?? "-"}`);
    console.log(`error     : ${result.errorMessage ?? "-"}`);
    process.exit(2);
  }
};

const command = (readArg("command") ?? "make") as Command;

if (command === "make") {
  runMake();
  process.exit(0);
}

if (command === "validate") {
  runValidate();
  process.exit(0);
}

console.error(`Unknown command: ${command}`);
printUsage();
process.exit(1);
