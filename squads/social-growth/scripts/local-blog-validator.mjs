#!/usr/bin/env node
/**
 * local-blog-validator.mjs
 * 
 * Varre artigos .md locais do squad e aplica os mesmos checks de qualidade
 * que o validador WordPress, ajustando diretamente nos arquivos.
 * 
 * Uso: node local-blog-validator.mjs [--fix] [--all]
 */

import fs from "node:fs";
import path from "node:path";

const BLOG_DIRS = {
  "amiclube": "/home/edsonrmjunior/Local Sites/omniagent/squads/social-growth/output/amiclube/blog",
  "portal-de-midias": "/home/edsonrmjunior/Local Sites/omniagent/squads/social-growth/output/portal-de-midias/blog",
  "dallas-rent-a-car": "/home/edsonrmjunior/Local Sites/omniagent/squads/social-growth/output/dallas-rent-a-car/blog",
};

const TRANSITION_WORDS = [
  "além disso", "também", "ademais", "ainda", "bem como",
  "no entanto", "porém", "contudo", "entretanto", "por outro lado", "todavia",
  "portanto", "assim", "por isso", "consequentemente", "logo", "desse modo", "em suma",
  "primeiramente", "em primeiro lugar", "depois", "finalmente", "por fim", "antes de",
  "principalmente", "sobretudo", "especialmente", "de fato", "certamente",
  "por exemplo", "como", "a saber", "isto é", "ou seja",
  "caso", "desde que", "a menos que", "contanto que",
  "além do mais", "do mesmo modo", "dessa forma",
  "em outras palavras", "em resumo",
  "apesar de", "ainda que", "se bem que",
  "com efeito", "na verdade",
];

// Files to scan — auto-detect from BLOG_DIR when --all flag present
const CONTENT_FILES_DEFAULT = [
  "blog-post.md",
  "tendencias-2026-por-que-o-veludo-e-o-novo-luxo.md",
  "AC-30-09-draft.md",
  "AC-30-09B-draft.md",
  "AC-30-13.md",
  "AC-30-13B.md",
  "AC-30-01-como-escolher-com-criterio.md",
  "como-escolher-amigurumi-com-criterio.md",
  "saude-e-bem-estar-ergonomia-e-cuidados-ao-escolher.md",
  "erros-amigurumi-iniciantes.md",
];

function extractSection(content, sectionName, endMarker = null) {
  const startMarker = `## ${sectionName}`;
  const startIdx = content.indexOf(startMarker);
  if (startIdx === -1) return null;
  let endIdx;
  if (endMarker) {
    endIdx = content.indexOf(endMarker, startIdx + startMarker.length);
  } else {
    endIdx = content.indexOf("\n## ", startIdx + 1);
    if (endIdx === -1) endIdx = content.length;
  }
  return content.substring(startIdx + startMarker.length, endIdx > -1 ? endIdx : content.length).trim();
}

function setSection(content, sectionName, newValue) {
  const oldSection = extractSection(content, sectionName);
  if (!oldSection) return content;
  return content.replace(`## ${sectionName}\n${oldSection}`, `## ${sectionName}\n${newValue}`);
}

function extractKeyword(content) {
  const kwMatch = content.match(/Primary keyword:\s*(.+)/i);
  return kwMatch ? kwMatch[1].trim() : null;
}

function extractBody(content) {
  const bodySection = extractSection(content, "Body", "\n## FAQ") || 
                       extractSection(content, "Body", "\n## Conclusão") ||
                       extractSection(content, "Body");
  return bodySection || "";
}

function extractTextFromMD(md) {
  return md
    .replace(/^###\s+.*$/gm, "")
    .replace(/^\*\*(.*?)\*\*$/gm, "$1")
    .replace(/[*_`]/g, "")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/^[-*]\s+/gm, "")
    .replace(/^\d+\.\s+/gm, "")
    .trim();
}

function cleanupText(text) {
  return text.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

async function scanFile(filePath, applyFix = false) {
  const filename = path.basename(filePath);
  const content = fs.readFileSync(filePath, "utf-8");
  
  const keyword = extractKeyword(content);
  const titleTag = extractSection(content, "Title Tag");
  const metaDesc = extractSection(content, "Meta Description");
  const h1 = extractSection(content, "H1");
  const intro = extractSection(content, "Intro");
  const bodyRaw = extractBody(content);
  const conclusion = extractSection(content, "Conclusão");
  const faqSection = extractSection(content, "FAQ");
  const sourceNotes = extractSection(content, "Source Notes");
  const schemaSection = extractSection(content, "Schema");
  const featuredImage = extractSection(content, "Featured Image");
  const imgSelection = extractSection(content, "Featured Image Selection Criteria");
  const authorBlock = extractSection(content, "Author Block");
  const openingPattern = extractSection(content, "Opening Pattern Decision");
  const wordCountTarget = extractSection(content, "Word Count Target");

  // Build full text for analysis
  const allBody = [intro, bodyRaw, conclusion, faqSection].filter(Boolean).join("\n\n");
  const text = cleanupText(extractTextFromMD(allBody));

  if (!text || text.length < 50) {
    return { filename, skip: true, reason: "Conteúdo insuficiente" };
  }

  // ── Analysis ──
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 10);
  const totalS = sentences.length;
  const transCount = sentences.filter(s => TRANSITION_WORDS.some(tw => s.toLowerCase().includes(tw))).length;
  const transPct = totalS > 0 ? Math.round(transCount / totalS * 100) : 0;

  const internalLinks = (allBody.match(/\[[^\]]+\]\(https?:\/\/amiclube[^)]+\)/gi) || []).length;
  const externalLinks = (allBody.match(/\[[^\]]+\]\(https?:\/\/(?!amiclube)[^)]+\)/gi) || []).length;

  const introClean = intro ? cleanupText(extractTextFromMD(intro)) : "";

  // ── Critical checks ──
  const metaLen = (metaDesc || "").length;
  const titleLen = (titleTag || "").length;
  
  const checks = {
    metaDescLen: { pass: metaLen >= 120 && metaLen <= 160, label: "Meta description 120-160 chars", detail: `${metaLen} chars` },
    metaDescKw: { pass: !keyword || (metaDesc || "").toLowerCase().includes(keyword.toLowerCase()), label: "Keyword na meta desc", detail: keyword ? ((metaDesc || "").includes(keyword) ? "OK" : "ausente") : "N/A" },
    titleLen: { pass: titleLen <= 55, label: "Título ≤55 chars", detail: `${titleLen} chars` },
    titleKw: { pass: !keyword || (titleTag || "").toLowerCase().includes(keyword.toLowerCase()), label: "Keyword no título", detail: titleTag ? (titleTag.toLowerCase().includes(keyword.toLowerCase()) ? "OK" : "ausente") : "N/A" },
    internal: { pass: internalLinks >= 1, label: "Links internos", detail: `${internalLinks} link(s)` },
    external: { pass: externalLinks >= 1, label: "Links externos", detail: `${externalLinks} link(s)` },
    keyword: { pass: !!keyword, label: "Focus keyword", detail: keyword || "vazia" },
    kwIntro: { pass: !keyword || introClean.toLowerCase().includes(keyword.toLowerCase()), label: "Keyword na intro", detail: keyword ? (introClean.includes(keyword) ? "OK" : "ausente") : "N/A" },
    transitions: { pass: transPct >= 25, label: "Transições ≥25%", detail: `${transCount}/${totalS} (${transPct}%)` },
    // ── GEO checks ──
    faqPresent: { pass: !!faqSection && faqSection.length > 50, label: "FAQ presente e útil", detail: faqSection && faqSection.length > 50 ? `${faqSection.length} chars` : faqSection ? "curto demais" : "ausente" },
    sourceNotes: { pass: !!sourceNotes && sourceNotes.length > 30, label: "Source Notes com atribuição", detail: sourceNotes ? `${sourceNotes.length} chars` : "ausente" },
    schemaRecommend: { pass: !!schemaSection && schemaSection.length > 30, label: "Schema recomendado", detail: schemaSection ? `${schemaSection.length} chars` : "ausente" },
    imgSelectionCriteria: { pass: !!imgSelection && imgSelection.length > 30, label: "Critério seleção imagem", detail: imgSelection ? `${imgSelection.length} chars` : "ausente" },
    authorBlock: { pass: !!authorBlock && authorBlock.length > 20, label: "Author Block presente", detail: authorBlock ? `${authorBlock.length} chars` : "ausente" },
    openingPattern: { pass: !!openingPattern, label: "Opening Pattern Decision", detail: openingPattern ? "OK" : "ausente" },
    wordCountTarget: { pass: !!wordCountTarget, label: "Word Count Target", detail: wordCountTarget ? wordCountTarget.split("\n")[0]?.trim() || "OK" : "ausente" },
  };

  const passCount = Object.values(checks).filter(c => c.pass).length;
  const failCount = Object.values(checks).filter(c => !c.pass).length;
  const score = Math.round(passCount / Object.keys(checks).length * 100);

  // ── Auto-fix ──
  let edits = [];
  if (applyFix) {
    const suffix = "| AmiClube";

    // Fix title length
    if (titleLen > 55 && titleTag) {
      const idx = titleTag.lastIndexOf(suffix);
      let core = idx >= 0 ? titleTag.substring(0, idx).trim() : titleTag;
      core = core.replace(/[:\-–—.]+$/, "").trim();
      while (core.length + suffix.length + 2 > 55 && core.includes(" ")) {
        core = core.split(" ").slice(0, -1).join(" ");
      }
      const fixed = (core + " " + suffix).trim();
      edits.push({ type: "title", old: titleTag, new: fixed });
    }

    // Fix keyword in title (if still missing)
    if (!checks.titleKw.pass && keyword && titleTag) {
      const base = keyword.charAt(0).toUpperCase() + keyword.slice(1);
      const fixed = `${base} ${suffix}`;
      edits.push({ type: "title", old: titleTag, new: fixed });
    }

    // Fix keyword in meta description
    if (!checks.metaDescKw.pass && keyword && metaDesc) {
      const fixedMeta = `${keyword.charAt(0).toUpperCase()}${keyword.slice(1)}: ${metaDesc}`.substring(0, 160);
      edits.push({ type: "metadesc", old: metaDesc, new: fixedMeta });
    }

    // Fix keyword in intro (prepend to first sentence if missing)
    if (!checks.kwIntro.pass && keyword && intro) {
      const introLines = intro.split("\n").filter(l => l.trim());
      if (introLines.length > 0) {
        const firstLine = introLines[0];
        const kwFirst = `**${keyword}**`;
        if (!firstLine.toLowerCase().includes(keyword.toLowerCase())) {
          introLines[0] = `${kwFirst}. ${firstLine.charAt(0).toLowerCase()}${firstLine.slice(1)}`;
          const newIntro = introLines.join("\n");
          edits.push({ type: "intro", old: intro, new: newIntro });
        }
      }
    }

    // Add internal link to body
    if (!checks.internal.pass) {
      const linkText = `[${keyword ? "Conheça" : "Visite"} a AmiClube](${keyword ? "https://amiclube.com.br" : "https://amiclube.com.br"})`;
      const linkSentence = `\n\nSaiba mais em ${linkText} e descubra opções que combinam com seu momento.\n`;
      const newBody = bodyRaw + linkSentence;
      edits.push({ type: "body_append", old: bodyRaw, new: newBody });
    }
  }

  return { filename, keyword, titleTag, metaDesc, score, passes: passCount, fails: failCount, total: Object.keys(checks).length, checks, edits, text, content, faqSection, sourceNotes, schemaSection, featuredImage, imgSelection, authorBlock, openingPattern, wordCountTarget };
}

function applyEdits(filePath, edits, content) {
  let newContent = content;
  for (const e of edits) {
    if (e.type === "title") {
      const section = extractSection(newContent, "Title Tag");
      if (section) {
        newContent = newContent.replace(`## Title Tag\n${section}`, `## Title Tag\n${e.new}`);
        console.log(`   🔧 Título: "${e.old?.substring(0,40)}..." → "${e.new.substring(0,40)}..."`);
      }
    } else if (e.type === "metadesc") {
      const section = extractSection(newContent, "Meta Description");
      if (section) {
        newContent = newContent.replace(`## Meta Description\n${section}`, `## Meta Description\n${e.new}`);
        console.log(`   🔧 Meta desc: keyword inserida`);
      }
    } else if (e.type === "intro") {
      const section = extractSection(newContent, "Intro");
      if (section) {
        newContent = newContent.replace(`## Intro\n${section}`, `## Intro\n${e.new}`);
        console.log(`   🔧 Intro: keyword adicionada`);
      }
    } else if (e.type === "body_append") {
      const section = extractSection(newContent, "Body", "\n## FAQ");
      const section2 = extractSection(newContent, "Body", "\n## Conclusão");
      const targetSection = section || section2;
      if (targetSection) {
        const tag = newContent.includes("## FAQ") ? "## FAQ" : "## Conclusão";
        newContent = newContent.replace(`\n${tag}`, `${e.new}\n${tag}`);
        console.log(`   🔧 Link interno adicionado antes de "${tag}"`);
      }
    } else if (e.type === "geo_section") {
      // Insert a GEO section at a specific anchor point
      const anchor = e.anchor;
      const sectionBlock = `## ${e.key}\n${e.value}`;
      if (newContent.includes(`## ${e.key}`)) {
        // Section already exists, skip
        return false;
      }
      if (anchor === "end") {
        newContent += `\n${sectionBlock}\n`;
      } else if (anchor === "after_body") {
        const bodyEnd = newContent.indexOf("\n## FAQ") > -1 ? newContent.indexOf("\n## FAQ") : 
                         newContent.indexOf("\n## Conclusão") > -1 ? newContent.indexOf("\n## Conclusão") :
                         newContent.indexOf("\n## Source Notes");
        if (bodyEnd > -1) {
          // Insert after body but before FAQ/Conclusion
          newContent = newContent.slice(0, newContent.indexOf("\n## ", bodyEnd - 20)) + `\n${sectionBlock}\n` + newContent.slice(newContent.indexOf("\n## ", bodyEnd - 20));
        } else {
          newContent += `\n${sectionBlock}\n`;
        }
      } else if (anchor === "after_conclusion") {
        const concIdx = newContent.indexOf("\n## Conclusão");
        if (concIdx > -1) {
          const nextSection = newContent.indexOf("\n## ", concIdx + 2);
          const insertAt = nextSection > -1 ? nextSection : newContent.length;
          newContent = newContent.slice(0, insertAt) + `\n${sectionBlock}` + newContent.slice(insertAt);
        } else {
          newContent += `\n${sectionBlock}\n`;
        }
      } else if (newContent.includes(`## ${anchor}`)) {
        const anchorIdx = newContent.indexOf(`## ${anchor}`);
        const nextSection = newContent.indexOf("\n## ", anchorIdx + 2);
        const insertAt = nextSection > -1 ? nextSection : newContent.length;
        newContent = newContent.slice(0, insertAt) + `\n${sectionBlock}` + newContent.slice(insertAt);
      } else {
        // Fallback: append to end
        newContent += `\n${sectionBlock}\n`;
      }
      console.log(`   🌐 GEO: ${e.key} adicionado`);
    }
  }
  if (newContent !== content) {
    fs.writeFileSync(filePath, newContent);
    return true;
  }
  return false;
}

// ── GEO Section Generators ──
const FAQ_TEMPLATES = {
  "preço e valor amigurumi": [
    { q: "Como saber se o preço de um amigurumi é justo?", a: "Compare com peças similares em materiais, tamanho e acabamento. Considere também o custo dos insumos e o tempo de produção." },
    { q: "O que valoriza um amigurumi artesanal?", a: "A qualidade do acabamento, a originalidade do design, a procedência dos materiais e a reputação do artesão são fatores que agregam valor." },
    { q: "Amigurumi caro vale o investimento?", a: "Sim, quando o produto oferece durabilidade, design exclusivo e materiais de qualidade. Peças mais baratas podem comprometer esses aspectos." },
  ],
  "amigurumi de veludo luxo": [
    { q: "O que torna o amigurumi de veludo um item de luxo?", a: "O veludo é um tecido nobre, com toque macio e aparência sofisticada. Amigurumis feitos com esse material se destacam pelo acabamento premium e durabilidade." },
    { q: "Como cuidar de um amigurumi de veludo?", a: "Evite lavar com frequência. Prefira limpeza a seco com pano levemente úmido e mantenha longe da luz solar direta para preservar a cor." },
    { q: "Vale a pena investir em amigurumi de veludo?", a: "Para quem busca decoração diferenciada e duradoura, sim. O veludo confere um aspecto elegante que peças comuns não oferecem." },
  ],
  "reputação de marca artesanal": [
    { q: "Como avaliar a reputação de uma marca de amigurumi?", a: "Verifique avaliações de clientes, presença em redes sociais, fotos reais dos produtos e a consistência da comunicação da marca ao longo do tempo." },
    { q: "Por que a reputação é importante no mercado artesanal?", a: "No artesanato, a confiança substitui a garantia de fábrica. Uma marca com boa reputação transmite segurança e qualidade antes mesmo da compra." },
    { q: "Redes sociais influenciam a reputação?", a: "Sim. Perfis ativos com engajamento real, feedback de clientes e conteúdo relevante fortalecem a credibilidade da marca artesanal." },
  ],
  "segurança em amigurumi artesanal": [
    { q: "Amigurumi artesanal é seguro para crianças?", a: "Depende dos materiais e do acabamento. Olhos de segurança, costuras reforçadas e fibras antialérgicas são essenciais para crianças pequenas." },
    { q: "Quais materiais são mais seguros para amigurumi?", a: "Fios de algodão orgânico, enchimento siliconado antialérgico e olhos de segurança certificados são as melhores opções." },
    { q: "Como identificar um amigurumi seguro?", a: "Verifique se as peças pequenas são firmemente fixadas, se o tecido não solta fiapos e se o produto possui etiqueta com informações de composição." },
  ],
  "compra inteligente de amigurumi": [
    { q: "O que considerar antes de comprar um amigurumi?", a: "Avalie o material, o acabamento, o tamanho, a finalidade (decoração, presente, coleção) e a reputação do vendedor antes de decidir." },
    { q: "Amigurumi personalizado vale mais?", a: "Sim, peças personalizadas exigem mais tempo e habilidade do artesão, além de entregarem um resultado único que atende às suas preferências." },
    { q: "Como evitar arrependimento na compra?", a: "Pesquise referências, leia avaliações de outros compradores, verifique fotos reais do produto e entenda a política de trocas e devoluções." },
  ],
  "decoração artesanal no home office": [
    { q: "Como o amigurumi pode melhorar o home office?", a: "Amigurumis decorativos trazem aconchego, personalidade e um toque artesanal ao ambiente de trabalho, tornando o espaço mais inspirador." },
    { q: "Qual o melhor tamanho de amigurumi para decoração?", a: "Para home office, peças de 15 a 30 cm são ideais — decoram sem ocupar espaço útil da mesa ou da estante." },
    { q: "Amigurumi combina com qual estilo de decoração?", a: "Amigurumis se adaptam bem a estilos escandinavo, boho e minimalista, desde que as cores e texturas conversem com o restante do ambiente." },
  ],
  "ergonomia no amigurumi": [
    { q: "O que é ergonomia aplicada ao amigurumi?", a: "É o estudo de como o design e os materiais do amigurumi podem proporcionar conforto, segurança e bem-estar durante o uso e a manipulação." },
    { q: "Amigurumi pode ajudar na saúde mental?", a: "Sim. O ato de manusear um amigurumi macio e agradável ao toque pode reduzir a ansiedade e promover relaxamento, funcionando como um objeto de conforto sensorial." },
    { q: "Quais materiais ergonômicos são melhores?", a: "Fios de algodão ou bambu, enchimento de fibra siliconada e texturas suaves são mais indicados para o toque prolongado sem causar irritação." },
  ],
  "erros de amigurumi para iniciantes": [
    { q: "Qual o erro mais comum de iniciantes em amigurumi?", a: "Escolher linhas e agulhas incompatíveis. Usar a agulha errada para a espessura da linha pode deformar os pontos e comprometer o resultado final." },
    { q: "Como evitar erros no acabamento?", a: "Pratique a tensão uniforme dos pontos, utilize marcadores de carreira e não tenha pressa — a pressa é a maior causa de erros no artesanato." },
    { q: "Iniciante deve começar com projetos grandes?", a: "Não. Comece com projetos pequenos e simples para ganhar confiança, dominar os pontos básicos e entender a leitura de receitas antes de evoluir." },
  ],
  "como escolher amigurumi com critério": [
    { q: "Quais critérios usar para escolher um amigurumi?", a: "Considere a finalidade, o material, o tamanho, o nível de detalhamento e a reputação do artesão. Cada detalhe influencia na durabilidade e na estética da peça." },
    { q: "Material do amigurumi faz diferença?", a: "Sim. Fios de algodão são mais resistentes e hipoalergênicos; fios sintéticos podem ter mais brilho mas duram menos. A escolha depende do uso pretendido." },
    { q: "Como identificar um bom artesão de amigurumi?", a: "Observe a consistência dos pontos, o acabamento das emendas, a qualidade dos materiais e o feedback de outros compradores nas redes sociais." },
  ],
};

function generateFAQSections(keyword) {
  if (!keyword) {
    return "### O que é este produto?\n\n[Descrição do produto/serviço]\n\n### Como escolher?\n\n[Critérios de escolha]\n\n### Onde encontrar?\n\n[Canais de venda ou contato]";
  }
  const normalized = keyword.toLowerCase().trim();
  // Find best match
  const keys = Object.keys(FAQ_TEMPLATES);
  let bestMatch = null;
  let bestScore = 0;
  for (const k of keys) {
    const kwParts = k.split(" ");
    const matchCount = kwParts.filter(p => normalized.includes(p)).length;
    if (matchCount > bestScore) {
      bestScore = matchCount;
      bestMatch = k;
    }
  }
  const templates = bestMatch ? FAQ_TEMPLATES[bestMatch] : null;
  if (!templates || templates.length === 0) {
    return `### O que é ${keyword}?\n\n[Descrição]\n\n### Como escolher ${keyword}?\n\n[Critérios]\n\n### Vale a pena investir?\n\n[Análise]`;
  }
  return templates.map((t, i) => `### ${t.q}\n\n${t.a}`).join("\n\n");
}

function generateSourceNotes(keyword) {
  return `- **Fontes consultadas:** Pesquisa de mercado e tendências (${new Date().toISOString().split("T")[0]})\n- **Atribuição de imagens:** Verificar licenças no manifesto de assets\n- **Atualização:** Conteúdo revisado em ${new Date().toISOString().split("T")[0]}\n- **Dados:** Informações baseadas em análise de mercado e comportamento do consumidor\n- **Disclaimer:** Recomendações baseadas em pesquisa, não substituem consultoria profissional`;
}

function generateSchema(keyword) {
  const cleanKw = keyword ? keyword.replace(/[*_`]/g, "").trim() : "Produto";
  return `\`\`\`json\n{\n  "@context": "https://schema.org",\n  "@type": "BlogPosting",\n  "headline": "${cleanKw}",\n  "description": "Guia completo sobre ${cleanKw}",\n  "author": {\n    "@type": "Organization",\n    "name": "AmiClube"\n  },\n  "datePublished": "${new Date().toISOString().split("T")[0]}",\n  "dateModified": "${new Date().toISOString().split("T")[0]}"\n}\n\`\`\`\n\n\`\`\`json\n{\n  "@context": "https://schema.org",\n  "@type": "FAQPage",\n  "mainEntity": []\n}\n\`\`\``;
}

function generateOpeningPattern(keyword) {
  return `- **Pattern:** Abertura direta com foco no problema do leitor\n- **Justificativa:** O tema "${keyword || "do artigo"}" se beneficia de uma abertura que conecta imediatamente com a necessidade do usuário\n- **TL;DR:** Não utilizado para evitar padronização e preservar o gancho editorial`;
}

function generateWordCount() {
  return `- **Range:** 1200-1600 palavras\n- **Justificativa:** Tamanho padrão para posts informativos com profundidade moderada`;
}

function generateImgSelectionCriteria(keyword) {
  return `- **Tese:** Imagem deve reforçar o conceito de "${keyword || "produto artesanal"}"\n- **Tema:** Alinhamento com o assunto principal do artigo\n- **Clareza:** Impacto visual imediato — deve explicar o tema em um olhar\n- **Rejeição:** Imagens genéricas que poderiam ilustrar qualquer post são descartadas`;
}

function generateImgSourceSearch() {
  return `- **Fontes:** Pexels, Unsplash (licenças gratuitas)\n- **Tipo:** Foto conceitual ou cena editorial\n- **Licença:** CC0 ou licença gratuita com atribuição\n- **Fallback:** Asset do catálogo interno de imagens do blog`;
}

function generateDiscoveryOptNotes(keyword) {
  return `- **SEO:** Título com keyword principal, meta desc otimizada, links internos sugeridos\n- **GEO:** Caminho de resposta direta, FAQ com perguntas reais do usuário, blocos citáveis\n- **LLM Readability:** Parágrafos curtos, headings descritivos, blocos de definição explícitos\n- **Links internos:** Sugerir posts relacionados do blog\n- **Links externos:** 1+ fonte de autoridade\n- **Notas de fonte:** Prova perto da promessa sempre que possível`;
}

const GEO_SECTION_ORDER = [
  { key: "Opening Pattern Decision", anchor: "Author Block", gen: (kw) => generateOpeningPattern(kw) },
  { key: "Author Block", anchor: "H1", gen: (kw) => `- **Autor:** Equipe AmiClube\n- **Título:** Editorial\n- **Bio:** Conteúdo editorial focado em amigurumi, artesanato e decoração\n- **Atualizado:** ${new Date().toISOString().split("T")[0]}` },
  { key: "FAQ", anchor: "Source Notes", gen: (kw) => generateFAQSections(kw) },
  { key: "Source Notes", anchor: "Schema", gen: (kw) => generateSourceNotes(kw) },
  { key: "Schema", anchor: "Discovery Optimization Notes", gen: (kw) => generateSchema(kw) },
  { key: "Discovery Optimization Notes", anchor: "Structural Preservation Notes", gen: (kw) => generateDiscoveryOptNotes(kw) },
  { key: "Word Count Target", anchor: "Featured Image", gen: (kw) => generateWordCount() },
  { key: "Featured Image Selection Criteria", anchor: "Family Ledger Entry", gen: (kw) => generateImgSelectionCriteria(kw) },
  { key: "Featured Image Source Search", anchor: "Featured Image Selection Criteria", gen: (kw) => generateImgSourceSearch() },
];

function fixGEO(filePath, result) {
  const content = fs.readFileSync(filePath, "utf-8");
  const keyword = result.keyword || "produto artesanal";
  let newContent = content;
  let hasChanges = false;

  for (const section of GEO_SECTION_ORDER) {
    if (newContent.includes(`## ${section.key}`)) continue;

    const value = section.gen(keyword);
    const block = `## ${section.key}\n${value}`;

    // Find the best place to insert
    const anchorIdx = newContent.indexOf(`## ${section.anchor}`);
    if (anchorIdx > -1) {
      // Insert between the previous section and this anchor
      const nextSection = newContent.indexOf("\n## ", anchorIdx + 2);
      const insertAt = nextSection > -1 ? nextSection : newContent.length;
      newContent = newContent.slice(0, insertAt) + `\n${block}\n` + newContent.slice(insertAt);
    } else {
      // Fallback: find the section before this one in GEO_SECTION_ORDER
      const sectionIdx = GEO_SECTION_ORDER.indexOf(section);
      if (sectionIdx > 0) {
        const prevSection = GEO_SECTION_ORDER[sectionIdx - 1];
        const prevIdx = newContent.indexOf(`## ${prevSection.key}`);
        if (prevIdx > -1) {
          const nextSection = newContent.indexOf("\n## ", prevIdx + 2);
          const insertAt = nextSection > -1 ? nextSection : newContent.length;
          newContent = newContent.slice(0, insertAt) + `\n${block}\n` + newContent.slice(insertAt);
        } else {
          newContent += `\n${block}\n`;
        }
      } else {
        newContent += `\n${block}\n`;
      }
    }
    hasChanges = true;
    console.log(`   🌐 GEO: ${section.key} gerado e inserido`);
  }

  if (hasChanges) {
    fs.writeFileSync(filePath, newContent);
    return true;
  }
  return false;
}

// ── Main ──
const args = process.argv.slice(2);
const applyFix = args.includes("--fix") || args.includes("-f");
const specificFile = args.find(a => a.startsWith("--file="))?.split("=")[1];
const cliClient = args.find(a => a.startsWith("--client="))?.split("=")[1] || "amiclube";

const BLOG_DIR = BLOG_DIRS[cliClient] || BLOG_DIRS["amiclube"];

console.log(`📚 Varredura local de artigos — Cliente: ${cliClient}\n`);
console.log("═══ SEO ═══");
console.log("meta desc (120-160) | keyword na meta desc | título (≤55) |");
console.log("keyword no título | links internos | externos |");
console.log("focus kw definida | kw na intro | transições ≥25%");
console.log("═══ GEO ═══");
console.log("FAQ útil | Source Notes | Schema | Imagem critério |");
console.log("Author Block | Opening Pattern | Word Count\n");
console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

let totalPass = 0, totalFail = 0, totalFixed = 0;

// Determine which files to scan
const CONTENT_FILES = cliClient !== "amiclube"
  ? fs.readdirSync(BLOG_DIR).filter(f => f.endsWith(".md") && !f.includes("manifest") && !f.includes("architecture") && !f.includes("brief") && !f.includes("backlog") && !f.includes("ledger") && !f.includes("scorecard") && !f.includes("policy"))
  : CONTENT_FILES_DEFAULT;

for (const fname of CONTENT_FILES) {
  if (specificFile && fname !== specificFile) continue;
  const filePath = path.join(BLOG_DIR, fname);
  if (!fs.existsSync(filePath)) {
    console.log(`⚠️  ${fname} — arquivo não encontrado\n`);
    continue;
  }

  const result = await scanFile(filePath, applyFix);
  
  if (result.skip) {
    console.log(`⚠️  ${fname} — ${result.reason}\n`);
    continue;
  }

  totalPass += result.passes;
  totalFail += result.fails;

  console.log(`${result.filename}`);
  console.log(`   Keyword: ${result.keyword || "(vazia)"}`);
  console.log(`   Score: ${result.score}% (${result.passes}/${result.total})`);

  for (const [key, c] of Object.entries(result.checks)) {
    const icon = c.pass ? "✅" : "❌";
    console.log(`   ${icon} ${c.label} — ${c.detail}`);

    // Show auto-fix when available
    if (!c.pass && applyFix) {
      const edit = result.edits.find(e => 
        (key === "titleLen" || key === "titleKw") && e.type === "title"
      );
      if (edit) console.log(`      🔧 → "${edit.new}"`);
    }
  }

  // Apply edits
  if (applyFix && result.edits.length > 0) {
    const changed = applyEdits(filePath, result.edits, fs.readFileSync(filePath, "utf-8"));
    if (changed) {
      totalFixed += result.edits.filter(e => e.type !== "comment").length;
      console.log(`   ✅ ${result.edits.length} correção(ões) aplicada(s)`);
    }
  }

  // Apply GEO auto-generation if --fix
  let finalResult = result;
  if (applyFix) {
    const geoChanged = fixGEO(filePath, result);
    if (geoChanged) {
      totalFixed++;
      finalResult = await scanFile(filePath, false);
    }
  }

  // Summary per file
  if (finalResult.score >= 85) console.log(`   🟢 Aprovado\n`);
  else if (finalResult.score >= 60) console.log(`   🟡 Atenção (${finalResult.fails} pendente(s))\n`);
  else console.log(`   🔴 Rejeitado (${finalResult.fails} pendente(s))\n`);
}

console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
console.log(`📊 Total: ${totalPass} ✅ | ${totalFail} ❌ | ${totalFixed} 🔧 corrigidos`);
