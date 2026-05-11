import assert from "node:assert/strict";
import test from "node:test";

const { extractPublicSignals } = await import("../src/modules/client-report/client-report.service.js");

test("extrai publicSignals do market research", () => {
  const result = extractPublicSignals({
    publicSignals: {
      summary: "Brave Search executou 4 consulta(s) e adicionou 2 fonte(s) públicas ao market research.",
      queryCount: 4,
      sourceCount: 2,
    },
  });

  assert.deepEqual(result, {
    summary: "Brave Search executou 4 consulta(s) e adicionou 2 fonte(s) públicas ao market research.",
    queryCount: 4,
    sourceCount: 2,
  });
});

test("usa note como fallback quando publicSignals não existe", () => {
  const result = extractPublicSignals({
    note: "Resumo manual da pesquisa",
  });

  assert.deepEqual(result, {
    summary: "Resumo manual da pesquisa",
    queryCount: 0,
    sourceCount: 0,
  });
});
