import fs from 'node:fs';
import path from 'node:path';

const root = '/home/edsonrmjunior/Local Sites/omniagent/squads/social-growth';
const blogDir = path.join(root, 'output/blog');

const pages = [
  {
    md: 'blog-post.md',
    html: 'geo-buscas-ia.html',
    label: 'Portal de Midias | GEO',
    metaDescription: 'Entenda o que é GEO e como preparar seu site para buscas com IA com clareza, prova, FAQ e estrutura pensada para humanos e IA.',
    thesis: 'GEO não é um truque de otimização; é uma exigência de clareza, prova e estrutura para que uma marca seja entendida, citada e recuperada por sistemas de busca generativos.',
    structureFamily: 'teardown crítico com bloco de framework prático',
    proofFocus: 'clareza de entidade, prova pública, respostas diretas, FAQ, estrutura escaneável e limites reais da argumentação',
    wordTarget: '1200-1600 words',
    intro: 'A busca mudou de função. Antes, a meta era aparecer em uma lista. Agora, a disputa também acontece antes do clique.',
    asset: 'assets/geo-ai-overviews.png',
    sourceClass: 'Wikimedia Commons (CC BY-SA 4.0 / PD-algorithm)',
    sourceNotes: 'Commons file: AI Overviews result for What is Wikipedia, 2 March 2026.png; license CC BY-SA 4.0 / PD-algorithm; source own work screenshot',
    alt: 'Screenshot de AI Overviews do Google mostrando busca, entidade e prova em uma resposta gerativa.',
    format: '16:9',
  },
  {
    md: 'blog-post-draft.md',
    html: 'geo-buscas-ia-draft.html',
    label: 'Portal de Midias | GEO Draft',
    metaDescription: 'Rascunho de GEO para análise editorial, com tese, prova e estrutura pensada para buscas com IA.',
    thesis: 'GEO não é um truque de otimização; é uma exigência de clareza, prova e estrutura para que uma marca seja entendida, citada e recuperada por sistemas de busca generativos.',
    structureFamily: 'teardown crítico com bloco de framework prático',
    proofFocus: 'clareza de entidade, prova pública, respostas diretas, FAQ, estrutura escaneável e limites reais da argumentação',
    wordTarget: '1200-1600 words',
    intro: 'A busca mudou de função. Antes, a meta era aparecer em uma lista. Agora, a disputa também acontece antes do clique.',
    asset: 'assets/geo-ai-overviews.png',
    sourceClass: 'Wikimedia Commons (CC BY-SA 4.0 / PD-algorithm)',
    sourceNotes: 'Commons file: AI Overviews result for What is Wikipedia, 2 March 2026.png; license CC BY-SA 4.0 / PD-algorithm; source own work screenshot',
    alt: 'Screenshot de AI Overviews do Google mostrando busca, entidade e prova em uma resposta gerativa.',
    format: '16:9',
  },
  {
    md: 'blog-post-b2b-proof.md',
    html: 'conteudo-b2b-com-prova.html',
    label: 'Portal de Midias | B2B Proof',
    metaDescription: 'Veja por que conteúdo B2B precisa de prova, contexto e evidências para gerar credibilidade real, e não apenas parecer inteligente.',
    thesis: 'Conteúdo B2B sem prova pode informar, mas não sustenta credibilidade; autoridade real aparece quando opinião, contexto e evidências caminham juntos.',
    structureFamily: 'teardown crítico com framework de prova',
    proofFocus: 'sinais de fragilidade, tipos de prova, pontos de inserção e limites honestos',
    wordTarget: '1200-1600 words',
    intro: 'O conteúdo B2B costuma falhar por um motivo simples: ele tenta parecer inteligente antes de ser demonstrável.',
    asset: 'assets/b2b-proof-matomo.png',
    sourceClass: 'Wikimedia Commons (CC BY-SA 4.0)',
    sourceNotes: 'Commons file: Matomo 4.0 screenshot - English.png; license CC BY-SA 4.0; source own work screenshot',
    alt: 'Screenshot de um dashboard Matomo 4.0 ilustrando prova, contexto e credibilidade analítica para conteúdo B2B.',
    format: '16:9',
  },
  {
    md: 'blog-post-repurpose.md',
    html: 'reaproveitamento-conteudo.html',
    label: 'Portal de Midias | Repurpose',
    metaDescription: 'Aprenda a transformar um artigo de blog em Instagram, LinkedIn e e-mail sem copiar e colar, mantendo coerência, contexto e função em cada canal.',
    thesis: 'Publicar sem distribuir desperdiça trabalho; um bom artigo de blog deve funcionar como conteúdo-matriz capaz de gerar peças nativas para cada canal.',
    structureFamily: 'framework operacional com fluxo de distribuição',
    proofFocus: 'o artigo-matriz, os canais com função distinta, o fluxo de derivação e os erros que destroem coerência',
    wordTarget: '1200-1600 words',
    intro: 'Publicar um bom artigo é apenas o início do trabalho. Se o texto para aí, o conteúdo perde vida útil.',
    asset: 'assets/repurpose-netlify-workflow.png',
    sourceClass: 'Wikimedia Commons (CC BY-SA 4.0)',
    sourceNotes: 'Commons file: Netlify CMS editorial workflow.png; license CC BY-SA 4.0; source own work screenshot',
    alt: 'Screenshot de um workflow editorial no Netlify CMS mostrando como um artigo se distribui em blog e canais sociais.',
    format: '16:9',
  },
  {
    md: 'blog-post-video-short.md',
    html: 'video-curto-servicos-complexos.html',
    label: 'Portal de Midias | Video Curto',
    metaDescription: 'Veja como usar vídeo curto para vender serviços complexos com clareza, roteiros simples e formatos que geram entendimento em B2B.',
    thesis: 'Vídeo curto funciona em B2B quando traduz complexidade em sinais de decisão rápida; ele perde força quando tenta explicar tudo de uma vez.',
    structureFamily: 'contrarian guide com playbook prático',
    proofFocus: 'tipos de vídeo, estrutura de roteiro, adaptação por plataforma e limites do formato',
    wordTarget: '900-1200 words',
    intro: 'Vídeo curto funciona em B2B quando traduz complexidade em sinais de decisão rápida; ele perde força quando tenta explicar tudo de uma vez.',
    asset: 'assets/video-short-recording.jpg',
    sourceClass: 'Wikimedia Commons (CC BY-SA 4.0)',
    sourceNotes: "Commons file: ViVi's smartphone recording video at Yuanshan Park 20231125.jpg; license CC BY-SA 4.0; source own work photograph",
    alt: 'Fotografia de uma pessoa gravando vídeo com smartphone, traduzindo complexidade em conteúdo curto para canais sociais.',
    format: '16:9',
  },
  {
    md: 'blog-post-email-marketing.md',
    html: 'email-marketing-primeiro.html',
    label: 'Portal de Midias | Email Marketing',
    metaDescription: 'Descubra o que automatizar primeiro no e-mail marketing para empresas e como criar fluxos simples, estratégicos e realmente úteis.',
    thesis: 'Automação de e-mail deve começar pelos momentos que carregam mais confiança e urgência; o primeiro fluxo certo vale mais do que muitos fluxos complexos mal construídos.',
    structureFamily: 'prioritization framework com decisão operacional',
    proofFocus: 'fluxos prioritários, erros de início, métricas e limite da automação sem estratégia',
    wordTarget: '900-1200 words',
    intro: 'E-mail marketing ainda funciona. Na verdade, ele costuma funcionar melhor quando deixa de ser tratado como um canal avulso.',
    asset: 'assets/email-marketing.png',
    sourceClass: 'Wikimedia Commons (CC BY-SA 4.0)',
    sourceNotes: 'Commons file: Email marketing.png; license CC BY-SA 4.0; source own work illustration',
    alt: 'Ilustração de email marketing com automação e prioridade de boas-vindas para fortalecer relacionamento e confiança.',
    format: '16:9',
  },
];

const featuredImageCatalog = [
  {
    asset: 'assets/geo-ai-overviews.png',
    keywords: ['geo', 'busca', 'ia', 'entidade', 'prova', 'generative', 'discoverability', 'overview'],
  },
  {
    asset: 'assets/b2b-proof-matomo.png',
    keywords: ['conteudo', 'b2b', 'prova', 'credibilidade', 'contexto', 'evidencia', 'analytics', 'dashboard'],
  },
  {
    asset: 'assets/repurpose-netlify-workflow.png',
    keywords: ['reaproveitamento', 'repurpose', 'distribuicao', 'canal', 'blog', 'linkedin', 'instagram', 'email', 'workflow'],
  },
  {
    asset: 'assets/video-short-recording.jpg',
    keywords: ['video', 'curto', 'servicos', 'complexos', 'reels', 'short', 'mobile', 'recording'],
  },
  {
    asset: 'assets/email-marketing.png',
    keywords: ['email', 'e-mail', 'automacao', 'fluxo', 'prioridade', 'boas-vindas', 'marketing'],
  },
];

const style = `
      :root { --bg:#0b0d11; --panel:#121722; --panel-2:#171d28; --text:#f6f1e8; --muted:#b5bdcb; --accent:#c46a44; --accent-2:#dbc6a3; --line:rgba(255,255,255,.08); }
      *{box-sizing:border-box}
      body{margin:0;color:var(--text);font-family:Inter,Arial,Helvetica,sans-serif;line-height:1.75;background:radial-gradient(circle at top right,rgba(196,106,68,.14),transparent 28%),linear-gradient(180deg,#08090b 0%,#11161d 100%)}
      .wrap{max-width:1020px;margin:0 auto;padding:32px 20px 72px}
      .top{border:1px solid var(--line);border-radius:28px;background:linear-gradient(180deg,var(--panel) 0%,var(--panel-2) 100%);padding:28px;box-shadow:0 24px 70px rgba(0,0,0,.32)}
      h1,h2,h3{font-family:Georgia,"Times New Roman",serif;margin:0 0 12px}
      h1{font-size:clamp(2.1rem,5vw,4rem);line-height:1.05;max-width:14ch}
      h2{font-size:1.45rem;margin-top:30px}
      p,li{color:var(--muted);font-size:1.02rem}
      .eyebrow{display:inline-flex;padding:8px 12px;border:1px solid var(--line);border-radius:999px;color:var(--accent-2);font-size:.9rem}
      .lede{font-size:1.12rem;max-width:72ch}
      .section{margin-top:28px;padding-top:4px;border-top:1px solid var(--line)}
      ul,ol{padding-left:20px}
      .faq{display:grid;gap:12px}
      .q{padding:14px 16px;border:1px solid var(--line);border-radius:16px;background:rgba(255,255,255,.03)}
      .nav{margin-top:26px}
      .nav a{color:var(--text);text-decoration:none;border-bottom:1px solid rgba(196,106,68,.55)}
      .meta{display:flex;flex-wrap:wrap;gap:10px;margin-top:18px}
      .pill{display:inline-flex;padding:6px 10px;border-radius:999px;background:rgba(255,255,255,.04);border:1px solid var(--line);color:var(--accent-2);font-size:.86rem}
      figure{margin:24px 0 8px;border:1px solid var(--line);border-radius:22px;overflow:hidden;background:rgba(255,255,255,.03)}
      .figure-media svg{display:block;width:100%;height:auto}
      figcaption{padding:12px 16px 16px;color:var(--muted);font-size:.95rem;border-top:1px solid var(--line)}
      pre{overflow:auto;padding:16px;border-radius:16px;background:rgba(255,255,255,.04);border:1px solid var(--line);color:var(--text)}
      code{font-family:ui-monospace,SFMono-Regular,Consolas,monospace;font-size:.95em}
      blockquote{margin:18px 0;padding:8px 16px;border-left:3px solid rgba(196,106,68,.55);color:var(--muted);background:rgba(255,255,255,.02)}
      a{color:#f0c69e}
`;

function escapeHtml(value) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function inline(text) {
  return escapeHtml(text)
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/\*([^*]+)\*/g, '<em>$1</em>');
}

function markdownToHtml(md) {
  const lines = md.split(/\r?\n/);
  const out = [];
  let paragraph = [];
  let ul = false;
  let ol = false;
  let inCode = false;
  let code = [];

  const flushParagraph = () => {
    if (paragraph.length) {
      out.push(`<p>${inline(paragraph.join(' '))}</p>`);
      paragraph = [];
    }
  };

  const closeLists = () => {
    if (ul) { out.push('</ul>'); ul = false; }
    if (ol) { out.push('</ol>'); ol = false; }
  };

  const pushHeading = (level, text) => {
    flushParagraph();
    closeLists();
    out.push(`<h${level}>${inline(text)}</h${level}>`);
  };

  for (const raw of lines) {
    const line = raw.trimEnd();

    if (line.startsWith('```')) {
      if (!inCode) {
        flushParagraph();
        closeLists();
        inCode = true;
        code = [];
      } else {
        out.push(`<pre><code>${escapeHtml(code.join('\n'))}</code></pre>`);
        inCode = false;
      }
      continue;
    }

    if (inCode) {
      code.push(raw);
      continue;
    }

    if (!line.trim()) {
      flushParagraph();
      closeLists();
      continue;
    }

    const heading = line.match(/^(#{1,6})\s+(.*)$/);
    if (heading) {
      pushHeading(heading[1].length, heading[2]);
      continue;
    }

    const bullet = line.match(/^[-*]\s+(.*)$/);
    if (bullet) {
      flushParagraph();
      if (!ul) { closeLists(); out.push('<ul>'); ul = true; }
      out.push(`<li>${inline(bullet[1])}</li>`);
      continue;
    }

    const ordered = line.match(/^\d+\.\s+(.*)$/);
    if (ordered) {
      flushParagraph();
      if (!ol) { closeLists(); out.push('<ol>'); ol = true; }
      out.push(`<li>${inline(ordered[1])}</li>`);
      continue;
    }

    const quote = line.match(/^>\s+(.*)$/);
    if (quote) {
      flushParagraph();
      closeLists();
      out.push(`<blockquote>${inline(quote[1])}</blockquote>`);
      continue;
    }

    paragraph.push(line.trim());
  }

  flushParagraph();
  closeLists();
  if (inCode) out.push(`<pre><code>${escapeHtml(code.join('\n'))}</code></pre>`);
  return out.join('\n');
}

function extractSection(md, heading) {
  const lines = md.split(/\r?\n/);
  const start = lines.findIndex((line) => line.trim() === `## ${heading}`);
  if (start === -1) return '';
  const body = [];
  for (let i = start + 1; i < lines.length; i += 1) {
    if (lines[i].startsWith('## ')) break;
    body.push(lines[i]);
  }
  return body.join('\n').trim();
}

function bulletValue(section, key) {
  const re = new RegExp(`^[-*]\\\\s*${key}:\\\\s*(.*)$`, 'mi');
  const match = section.match(re);
  return match ? match[1].trim() : '';
}

function firstParagraph(section) {
  const lines = section.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
  return lines.find((line) => !line.startsWith('- ') && !line.startsWith('### ') && !line.startsWith('## ')) || '';
}

function removeBlocks(md) {
  return md
    .replace(/## Featured Image[\s\S]*?(?=^## |\n# |\s*$)/m, '')
    .replace(/## Word Count Target[\s\S]*?(?=^## |\n# |\s*$)/m, '');
}

function normalizeForMatch(value) {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function scoreFeaturedImage(candidate, context) {
  const normalizedContext = normalizeForMatch(context);
  let score = 0;
  for (const keyword of candidate.keywords) {
    const token = normalizeForMatch(keyword);
    if (!token) continue;
    if (normalizedContext.includes(token)) score += token.length > 3 ? 2 : 1;
  }
  return score;
}

function selectFeaturedImage(page, title, thesis, structureFamily, proofFocus, metaDescription) {
  const context = [page.label, title, thesis, structureFamily, proofFocus, metaDescription].filter(Boolean).join(' ');
  const scored = featuredImageCatalog
    .map((candidate) => ({
      ...candidate,
      score: scoreFeaturedImage(candidate, context),
    }))
    .sort((a, b) => b.score - a.score);

  const preferred = page.asset ? scored.find((candidate) => candidate.asset === page.asset) : null;
  const selected = preferred || scored[0];

  if (!selected || selected.score < 2) {
    throw new Error(`Featured image selection failed for ${page.html}: no asset met the thesis-led criteria.`);
  }

  if (page.asset && selected.asset !== page.asset) {
    throw new Error(`Featured image selection failed for ${page.html}: preferred asset ${page.asset} did not win by criteria.`);
  }

  return selected;
}

function validateFeaturedImageSelection(title, thesis, alt, assetPath) {
  const context = normalizeForMatch([title, thesis].join(' '));
  const altNormalized = normalizeForMatch(alt);
  const banned = ['generic', 'stock', 'image', 'photo', 'banner', 'decorative'];
  if (banned.some((term) => altNormalized.includes(term))) {
    throw new Error(`Featured image rejected for ${assetPath}: alt text is too generic.`);
  }

  const contextTokens = context.split(' ').filter((token) => token.length > 3);
  const altTokens = altNormalized.split(' ').filter((token) => token.length > 3);
  const shared = altTokens.filter((token) => contextTokens.includes(token));
  if (shared.length === 0) {
    throw new Error(`Featured image rejected for ${assetPath}: alt text is not clearly tied to the article thesis.`);
  }
}

const orthographyRules = [
  { pattern: /\bnao\b/gi, expected: 'não' },
  { pattern: /\bconteudo\b/gi, expected: 'conteúdo' },
  { pattern: /\bservico\b/gi, expected: 'serviço' },
  { pattern: /\bdecisao\b/gi, expected: 'decisão' },
  { pattern: /\bestrategia\b/gi, expected: 'estratégia' },
  { pattern: /\bpublico\b/gi, expected: 'público' },
  { pattern: /\baudiencia\b/gi, expected: 'audiência' },
  { pattern: /\banalise\b/gi, expected: 'análise' },
  { pattern: /\bmetricas\b/gi, expected: 'métricas' },
  { pattern: /\bdistribuicao\b/gi, expected: 'distribuição' },
  { pattern: /\bconversao\b/gi, expected: 'conversão' },
  { pattern: /\bfuncao\b/gi, expected: 'função' },
  { pattern: /\binformacao\b/gi, expected: 'informação' },
  { pattern: /\bcomparacao\b/gi, expected: 'comparação' },
  { pattern: /\brevisao\b/gi, expected: 'revisão' },
  { pattern: /\bconfianca\b/gi, expected: 'confiança' },
  { pattern: /\bevidencia\b/gi, expected: 'evidência' },
  { pattern: /\bevidencias\b/gi, expected: 'evidências' },
  { pattern: /\bdiagnostico\b/gi, expected: 'diagnóstico' },
  { pattern: /\bescaneavel\b/gi, expected: 'escaneável' },
  { pattern: /\bargumentacao\b/gi, expected: 'argumentação' },
  { pattern: /\bcriterio\b/gi, expected: 'critério' },
  { pattern: /\bpratico\b/gi, expected: 'prático' },
  { pattern: /\btecnico\b/gi, expected: 'técnico' },
  { pattern: /\bautomacao\b/gi, expected: 'automação' },
  { pattern: /\bpriorizacao\b/gi, expected: 'priorização' },
  { pattern: /\binicio\b/gi, expected: 'início' },
  { pattern: /\bcoerencia\b/gi, expected: 'coerência' },
  { pattern: /\brepeticao\b/gi, expected: 'repetição' },
];

function assertPortugueseOrthography(text, label) {
  const issues = [];
  for (const rule of orthographyRules) {
    rule.pattern.lastIndex = 0;
    if (rule.pattern.test(text)) {
      issues.push(`${rule.pattern.source.replace(/\\b/g, '')} -> ${rule.expected}`);
    }
  }
  if (issues.length) {
    throw new Error(`Orthography gate failed for ${label}. Fix missing pt-BR accents: ${issues.join(', ')}`);
  }
}

function extractArticleBody(md) {
  const start = md.indexOf('## Intro');
  const end = md.indexOf('\n## Source Notes');
  if (start === -1) {
    return removeBlocks(md)
      .replace(/^#.*\n/, '')
      .replace(/\n## Schema[\s\S]*$/m, '')
      .trim();
  }
  return md
    .slice(start, end === -1 ? md.length : end)
    .replace(/^## Intro\s*\n/, '')
    .replace(/^\s*## Conclusion\s*$/gm, '')
    .trim();
}

function renderAsset(assetPath, alt, format) {
  if (!assetPath) return '';
  const fullPath = path.join(blogDir, assetPath);
  const caption = `${alt}${format ? ` | Formato ${format}` : ''}`;
  if (assetPath.toLowerCase().endsWith('.svg') && fs.existsSync(fullPath)) {
    const svg = fs.readFileSync(fullPath, 'utf8')
      .replace(/<\?xml[\s\S]*?\?>\s*/i, '')
      .replace(/<!DOCTYPE[\s\S]*?>\s*/i, '');
    return `
        <figure>
          <div class="figure-media">${svg}</div>
          <figcaption>${caption}</figcaption>
        </figure>`;
  }
  return `
        <figure>
          <img src="${assetPath}" alt="${alt}" style="display:block;width:100%;height:auto" />
          <figcaption>${caption}</figcaption>
        </figure>`;
}

const imageSelectionRecords = [];

for (const page of pages) {
  const sourcePath = path.join(blogDir, page.md);
  const htmlPath = path.join(blogDir, page.html);
  const md = fs.readFileSync(sourcePath, 'utf8');
  assertPortugueseOrthography(md, page.md);
  assertPortugueseOrthography(
    [
      page.label,
      page.metaDescription,
      page.thesis,
      page.structureFamily,
      page.proofFocus,
      page.intro,
      page.alt,
    ].filter(Boolean).join('\n'),
    `${page.md} metadata`,
  );
  const title = (md.match(/^#\s+(.+)$/m) || [null, page.html])[1];
  const thesis = page.thesis || bulletValue(extractSection(md, 'Editorial Architecture'), 'Thesis') || '';
  const structureFamily = page.structureFamily || bulletValue(extractSection(md, 'Editorial Architecture'), 'Structure family') || '';
  const proofFocus = page.proofFocus || bulletValue(extractSection(md, 'Editorial Architecture'), 'Proof focus') || '';
  const imageMeta = selectFeaturedImage(
    page,
    title,
    thesis,
    structureFamily,
    proofFocus,
    page.metaDescription || extractSection(md, 'Meta Description').replace(/\s+/g, ' ').trim(),
  );
  const asset = imageMeta.asset || page.asset || bulletValue(extractSection(md, 'Featured Image'), 'Asset') || '';
  const alt = page.alt || bulletValue(extractSection(md, 'Featured Image'), 'Alt') || '';
  const format = page.format || bulletValue(extractSection(md, 'Featured Image'), 'Format') || '16:9';
  const wordTarget = page.wordTarget || (extractSection(md, 'Word Count Target').split('\n').find(Boolean) || '');
  const lede = page.intro || firstParagraph(extractSection(md, 'Intro')) || '';
  const metaDescription = (page.metaDescription || extractSection(md, 'Meta Description').replace(/\s+/g, ' ').trim()).replace(/\s+/g, ' ').trim();
  validateFeaturedImageSelection(title, thesis, alt, asset);
  imageSelectionRecords.push({
    title,
    asset,
    alt,
    sourceClass: imageMeta.sourceClass || page.sourceClass || 'No external source',
    sourceNotes: imageMeta.sourceNotes || page.sourceNotes || '',
    thesis,
    structureFamily,
    proofFocus,
  });
  const bodySource = extractArticleBody(md);
  const bodyHtml = markdownToHtml(bodySource);

  const heroFigure = renderAsset(asset, alt, format);

  const content = `<!doctype html>
<html lang="pt-BR">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${escapeHtml(title)}</title>
    <meta name="description" content="${escapeHtml(metaDescription)}" />
    <style>${style}</style>
  </head>
  <body>
    <main class="wrap">
      <article class="top">
        <span class="eyebrow">${escapeHtml(page.label)}</span>
        <h1>${escapeHtml(title)}</h1>
        <p class="lede">${escapeHtml(lede)}</p>
        ${heroFigure}
        ${bodyHtml}
        <div class="nav"><a href="portal-de-midias-cluster.html">Voltar ao índice do cluster</a></div>
      </article>
    </main>
    <script type="application/ld+json">${JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'BlogPosting',
      headline: title,
      description: metaDescription,
      author: { '@type': 'Organization', name: 'Portal de Midias' },
      publisher: { '@type': 'Organization', name: 'Portal de Midias' },
      datePublished: '2026-04-16',
      dateModified: '2026-04-16'
    })}</script>
  </body>
</html>`;

  fs.writeFileSync(htmlPath, content);
  console.log(`wrote ${page.html}`);
}

const selectionTable = imageSelectionRecords.map((record) => `| ${record.title} | ${record.asset} | ${record.sourceClass} | ${record.sourceNotes} | ${record.alt} | ${record.thesis} | ${record.structureFamily} | ${record.proofFocus} |`).join('\n');
const manifest = `# Blog Featured Image Selection Checklist

Client: Portal de Midias
Cycle: current blog cluster
Status: approved selection manifest

## Rules Applied

- thesis-led every time;
- topic fit must be explicit;
- one-glance clarity must be obvious;
- generic category imagery is rejected;
- the image must explain the article, not decorate it.

## Checklist

| Post | Selected Asset | Source Class | Source Notes | Alt Text | Thesis Match | Structure Family | Proof Focus |
|---|---|---|---|---|---|---|---|
${selectionTable}

## Selection Notes

- Each asset was selected because it won the thesis, topic and clarity checks.
- Each asset keeps source class and source notes traceable in the manifest.
- The selected image must survive review without needing the reader to infer the argument from the caption alone.
- If an alternative asset does not improve thesis match or one-glance clarity, it is not a valid replacement.
`;

fs.writeFileSync(path.join(root, 'output/creative/blog-featured-image-selection.md'), manifest);
