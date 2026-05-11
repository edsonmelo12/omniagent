type GeographicCoverageScope = "local" | "regional" | "nacional" | "nicho";

type GeographicCoverageLevel = "cidade" | "região" | "país" | "nicho";

export type GeographicCoverage = {
  scope: GeographicCoverageScope;
  level: GeographicCoverageLevel;
  value: string;
  city: string | null;
  region: string | null;
  country: string;
  basis: string[];
  confidence: number;
  fallback: boolean;
  summary: string;
};

type CoverageSource = {
  label: string;
  value: unknown;
};

type CoverageInput = {
  sources: CoverageSource[];
  defaultCountry?: string;
};

const GEO_KEYWORDS = /(city|cidade|region|regiao|country|pais|state|estado|location|endereco|address|scope|marketcontext|territory|area|coverage|metro|metropolitana|municipio|município)/i;

const COUNTRY_ALIASES = [
  { pattern: /\b(brasil|brazil)\b/i, value: "Brasil" },
  { pattern: /\b(portugal)\b/i, value: "Portugal" },
  { pattern: /\b(angola)\b/i, value: "Angola" },
  { pattern: /\b(mo[cç]ambique)\b/i, value: "Moçambique" },
] as const;

const normalizeWhitespace = (value: string) => value.replace(/\s+/g, " ").trim();

const cleanLocationValue = (value: string) =>
  normalizeWhitespace(
    value
      .replace(/\b(e|and)\s+regi[aã]o.*$/i, "")
      .replace(/\b(regi[aã]o|estado|cidade|municipio|munic[ií]pio)\b.*$/i, "")
      .replace(/[|,.;:]+$/g, "")
      .replace(/\s+\([^)]+\)$/g, ""),
  );

const LOCATION_STOPWORDS = new Set([
  "mercado",
  "mercado local",
  "website",
  "site",
  "cliente",
  "segmento",
  "servico",
  "serviço",
  "nota",
  "nota de pesquisa",
  "contexto",
  "produto",
  "brand",
  "marca",
  "empresa",
  "assunto",
  "pesquisa",
]);

const collectStrings = (value: unknown, keyPath: string[] = [], output: string[] = []): string[] => {
  if (typeof value === "string" && value.trim().length > 0) {
    if (keyPath.length === 0 || GEO_KEYWORDS.test(keyPath.join("."))) {
      output.push(value.trim());
    }

    return output;
  }

  if (Array.isArray(value)) {
    for (const item of value) {
      collectStrings(item, keyPath, output);
    }

    return output;
  }

  if (typeof value === "object" && value !== null) {
    for (const [key, nextValue] of Object.entries(value as Record<string, unknown>)) {
      collectStrings(nextValue, [...keyPath, key], output);
    }
  }

  return output;
};

const parseCountry = (text: string) => {
  const hostname = (() => {
    try {
      return new URL(text).hostname.toLowerCase();
    } catch {
      return "";
    }
  })();

  if (hostname.endsWith(".br")) {
    return "Brasil";
  }

  for (const alias of COUNTRY_ALIASES) {
    if (alias.pattern.test(text)) {
      return alias.value;
    }
  }

  return null;
};

const parseRegion = (text: string) => {
  const regionPatterns = [
    /regi[aã]o metropolitana(?: de)?\s+([A-Za-zÀ-ÿ][A-Za-zÀ-ÿ\s.'-]{1,80}?)(?:[,.;\n]|$)/i,
    /(?:estado de|no estado de|na regi[aã]o de)\s+([A-Za-zÀ-ÿ][A-Za-zÀ-ÿ\s.'-]{1,80}?)(?:[,.;\n]|$)/i,
    /\bpar[aá]\b/i,
  ] as const;

  for (const pattern of regionPatterns) {
    const match = text.match(pattern);

    if (!match) {
      continue;
    }

    if (match[0].toLowerCase() === "pará" || match[0].toLowerCase() === "para") {
      return "Pará";
    }

    if (match[1]) {
      return cleanLocationValue(match[1]);
    }
  }

  return null;
};

const parseCity = (text: string) => {
  if (/^regi[aã]o metropolitana/i.test(text) || /^estado/i.test(text)) {
    return null;
  }

  const cityPatterns = [
    /([A-Za-zÀ-ÿ][A-Za-zÀ-ÿ\s.'-]{1,60}?)\s+e\s+regi[aã]o metropolitana/i,
    /(?:cidade de|na cidade de|em|na|no|munic[ií]pio de|baseada em|baseado em|atuando em)\s+([A-Za-zÀ-ÿ][A-Za-zÀ-ÿ\s.'-]{1,80}?)(?:[,.;\n]|$)/i,
  ] as const;

  for (const pattern of cityPatterns) {
    const match = text.match(pattern);

    if (!match) {
      continue;
    }

    if (match[1]) {
      const candidate = cleanLocationValue(match[1]);
      if (!candidate || LOCATION_STOPWORDS.has(candidate.toLowerCase())) {
        continue;
      }

      return candidate;
    }
  }

  return null;
};

const resolveConfidence = (scope: GeographicCoverageScope, fallback: boolean, countryExplicit: boolean) => {
  if (scope === "local") return 90;
  if (scope === "regional") return 82;
  if (scope === "nacional") return fallback ? 58 : countryExplicit ? 74 : 62;
  return 70;
};

export const resolveGeographicCoverage = (input: CoverageInput): GeographicCoverage => {
  const defaultCountry = input.defaultCountry ?? "Brasil";
  const sources = input.sources
    .map((source) => ({
      label: source.label,
      strings: collectStrings(source.value),
    }))
    .filter((source) => source.strings.length > 0);

  const texts = sources.flatMap((source) => source.strings);
  const basis = new Set<string>();
  let countryExplicit = false;
  let country = defaultCountry;
  let region: string | null = null;
  let city: string | null = null;

  for (const source of sources) {
    basis.add(source.label);
  }

  for (const text of texts) {
    const parsedCountry = parseCountry(text);
    if (parsedCountry) {
      country = parsedCountry;
      countryExplicit = true;
      continue;
    }

    if (!region) {
      region = parseRegion(text);
    }

    if (!city) {
      city = parseCity(text);
    }
  }

  const scope: GeographicCoverageScope = city
    ? "local"
    : region
      ? "regional"
      : "nacional";

  const level: GeographicCoverageLevel = city ? "cidade" : region ? "região" : "país";
  const value = city ?? region ?? country;
  const fallback = !city && !region && !countryExplicit;
  const confidence = resolveConfidence(scope, fallback, countryExplicit);

  const summary =
    scope === "local"
      ? `Cobertura local em ${city}${region ? `, ${region}` : ""}${country ? `, ${country}` : ""}.`
      : scope === "regional"
        ? `Cobertura regional em ${region ?? value}${country ? `, ${country}` : ""}.`
        : `Cobertura nacional em ${country}.`;

  if (fallback) {
    basis.add("fallback country");
  }

  return {
    scope,
    level,
    value,
    city,
    region,
    country,
    basis: [...basis],
    confidence,
    fallback,
    summary: fallback ? `${summary} Localização explícita não encontrada; país usado como recorte padrão.` : summary,
  };
};

export const resolveMarketPresenceScope = (input: CoverageInput): "local" | "regional" | "nacional" | "nicho" | "hibrido" => {
  const coverage = resolveGeographicCoverage(input);

  if (coverage.scope === "local") return "local";
  if (coverage.scope === "regional") return "regional";
  if (coverage.scope === "nacional") return "nacional";

  return "hibrido";
};
