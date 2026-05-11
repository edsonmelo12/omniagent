import assert from "node:assert/strict";
import test from "node:test";

import { resolveGeographicCoverage, resolveMarketPresenceScope } from "../src/modules/market-research/market-geography.js";

test("resolve cobertura local quando a cidade aparece no contexto", () => {
  const coverage = resolveGeographicCoverage({
    defaultCountry: "Brasil",
    sources: [
      { label: "marketContext", value: "Belém e região metropolitana" },
      { label: "client.notes", value: "Atendimento para obras em Belém" },
    ],
  });

  assert.equal(coverage.scope, "local");
  assert.equal(coverage.level, "cidade");
  assert.equal(coverage.city, "Belém");
  assert.equal(coverage.country, "Brasil");
  assert.equal(coverage.fallback, false);
  assert.ok(coverage.summary.includes("Belém"));
});

test("resolve cobertura regional quando só a região está explícita", () => {
  const coverage = resolveGeographicCoverage({
    defaultCountry: "Brasil",
    sources: [{ label: "marketContext", value: "Região Metropolitana de Belém" }],
  });

  assert.equal(coverage.scope, "regional");
  assert.equal(coverage.level, "região");
  assert.equal(coverage.region, "Belém");
  assert.equal(coverage.country, "Brasil");
});

test("usa país como fallback quando não há contexto geográfico", () => {
  const coverage = resolveGeographicCoverage({
    defaultCountry: "Brasil",
    sources: [],
  });

  assert.equal(coverage.scope, "nacional");
  assert.equal(coverage.level, "país");
  assert.equal(coverage.country, "Brasil");
  assert.equal(coverage.fallback, true);
  assert.ok(coverage.summary.includes("país usado como recorte padrão"));
});

test("market presence scope também cai para nacional sem geografia explícita", () => {
  assert.equal(
    resolveMarketPresenceScope({
      defaultCountry: "Brasil",
      sources: [],
    }),
    "nacional",
  );
});
