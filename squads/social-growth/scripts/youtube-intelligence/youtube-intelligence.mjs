#!/usr/bin/env node
/**
 * youtube-intelligence.mjs
 * 
 * Extrai transcrições de episódios do YouTube via YouTube Data API v3 + yt-dlp,
 * analisa estratégias e atualiza o podcast-intelligence-index da squad.
 * 
 * Uso:
 *   node youtube-intelligence.mjs --channel hotmart --count 5
 *   node youtube-intelligence.mjs --channel kiwify --count 3
 *   node youtube-intelligence.mjs --video <VIDEO_ID>
 *   node youtube-intelligence.mjs --latest --count 5
 */

import { writeFileSync, readFileSync, mkdirSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawn } from 'node:child_process';
import { promisify } from 'node:util';
import crypto from 'node:crypto';
import { writeFile } from 'node:fs/promises';

const __dirname = dirname(fileURLToPath(import.meta.url));

function execSpawn(cmd, args, opts = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(cmd, args, { ...opts, shell: false });
    let stdout = '', stderr = '';
    child.stdout?.on('data', d => stdout += d);
    child.stderr?.on('data', d => stderr += d);
    child.on('close', code => {
      if (code === 0) resolve({ stdout, stderr });
      else reject(new Error(`${cmd} exited ${code}: ${stderr || stdout}`.substring(0, 500)));
    });
    child.on('error', err => reject(err));
  });
}

// ─── Config ──────────────────────────────────────────────────────────────────

const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY || 'AIzaSyAveAy-2pctz9mtGNVcQ-hEWBSLvYekgE4';
const SQUAD_OUTPUT = process.env.SQUAD_OUTPUT_DIR || '/home/edsonrmjunior/Local Sites/omniagent/squads/social-growth';
const VENV_PYTHON = '/tmp/yt-transcript/venv/bin/python3';

const CHANNELS = {
  hotmart: { id: 'UCtHpJ-e56w6ATVUeoEBJWDg', name: 'Hotmart', playlistId: 'UUtHpJ-e56w6ATVUeoEBJWDg' },
  kiwify: { id: 'UCOX185sShsA2KUWnPRtV56A', name: 'Kiwify', playlistId: 'UUOX185sShsA2KUWnPRtV56A' },
};

// ─── Utilitários ─────────────────────────────────────────────────────────────

function compactText(value) {
  return String(value || '').replace(/\s+/g, ' ').trim();
}

async function fetchJSON(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
  return res.json();
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

function getVideoFingerprint(text) {
  return crypto.createHash('sha256').update(compactText(text).toLowerCase(), 'utf8').digest('hex');
}

function parseSubtitleXml(content) {
  const texts = [];
  for (const match of String(content || '').matchAll(/<text[^>]*>([\s\S]*?)<\/text>/g)) {
    const raw = match[1] || '';
    const text = raw
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/<[^>]+>/g, '')
      .trim();
    if (text) texts.push(text);
  }
  return texts.join(' ');
}

function pickCaptionFormats(captions) {
  const langs = ['pt', 'pt-orig', 'en'];
  for (const lang of langs) {
    const formats = captions[lang];
    if (Array.isArray(formats) && formats.length) return { lang, formats };
  }
  const firstLang = Object.keys(captions || {})[0];
  const formats = firstLang ? captions[firstLang] : null;
  return firstLang && Array.isArray(formats) && formats.length ? { lang: firstLang, formats } : null;
}

async function extractTranscriptViaCli(videoId) {
  const cookieFile = '/tmp/yt-transcript/youtube_cookies.txt';
  const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;
  const args = ['-J', '--skip-download', '--no-warnings'];
  if (existsSync(cookieFile)) args.push('--cookies', cookieFile);
  args.push(videoUrl);

  const { stdout } = await execSpawn('yt-dlp', args, { timeout: 90000 });
  const info = JSON.parse(stdout.trim());
  const auto = info.automatic_captions || {};
  const picked = pickCaptionFormats(auto);

  const result = { videoId, title: info.title || '', language: null, text: '', characterCount: 0, segmentCount: 0, status: 'missing', reason: null, availableLanguages: Object.keys(auto), formatCount: picked ? picked.formats.length : 0 };

  if (!picked) {
    result.reason = 'Nenhum caption disponível neste idioma';
    return result;
  }

  let captionUrl = null;
  for (const fmt of picked.formats) {
    if (fmt && fmt.ext === 'srv1' && fmt.url) {
      captionUrl = fmt.url;
      break;
    }
  }
  if (!captionUrl && picked.formats[0] && picked.formats[0].url) captionUrl = picked.formats[0].url;

  if (!captionUrl) {
    result.reason = 'Formato de caption indisponível';
    return result;
  }

  const response = await fetch(captionUrl, { headers: { 'User-Agent': 'Mozilla/5.0' } });
  if (!response.ok) {
    result.reason = `HTTP ${response.status} ao baixar caption`;
    return result;
  }

  const content = await response.text();
  const fullText = parseSubtitleXml(content);
  result.text = fullText;
  result.characterCount = fullText.length;

  if (result.text && result.text.length > 100) {
    result.status = 'available';
    result.segmentCount = result.text.split(/[.!?]/).filter(Boolean).length;
    result.language = picked.lang;
  } else {
    result.reason = 'Transcrição curta ou vazia para análise';
  }

  return result;
}

// ─── YouTube Data API ────────────────────────────────────────────────────────

async function getPlaylistVideos(playlistId, maxResults = 10) {
  const url = `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet,contentDetails&playlistId=${playlistId}&maxResults=${maxResults}&key=${YOUTUBE_API_KEY}`;
  const data = await fetchJSON(url);
  return (data.items || []).map(item => ({
    videoId: item.contentDetails.videoId,
    title: item.snippet.title,
    description: item.snippet.description || '',
    publishedAt: item.snippet.publishedAt,
    channelTitle: item.snippet.channelTitle,
  }));
}

// ─── Transcrição via yt-dlp ─────────────────────────────────────────────────

async function extractTranscript(videoId) {
  const tempDir = '/tmp/yt-transcript-subs';
  const cookieFile = '/tmp/yt-transcript/youtube_cookies.txt';
  const venvPython = VENV_PYTHON;

  if (!existsSync(venvPython)) {
    try {
      return await extractTranscriptViaCli(videoId);
    } catch (error) {
      return { videoId, status: 'error', reason: error.message, text: '', characterCount: 0, segmentCount: 0 };
    }
  }
  
  const scriptContent = [
    'import os, re, ssl, urllib.request',
    `video_id = '${videoId}'`,
    `temp_dir = '${tempDir}'`,
    'os.makedirs(temp_dir, exist_ok=True)',
    '',
    'def parse_xml_subs(content):',
    '    texts = []',
    '    for m in re.finditer(r\'<text[^>]+>([^<]+)</text>\', content):',
    '        t = m.group(1).strip()',
    '        if t: texts.append(t)',
    '    return " ".join(texts)',
    '',
    'try:',
    '    from yt_dlp import YoutubeDL',
    '    ydl_opts = {',
    '        "quiet": True,',
    '        "skip_download": True,',
    '        "subtitleslangs": ["pt"],',
    '        "subtitlesformat": "srv1",',
    '        "outtmpl": os.path.join(temp_dir, "%(id)s.%(ext)s"),',
    '        "cookiefile": "' + cookieFile + '",',
    '    }',
    '    video_url = f"https://www.youtube.com/watch?v={video_id}"',
    '    with YoutubeDL(ydl_opts) as ydl:',
    '        info = ydl.extract_info(video_url, download=False)',
    '        title = info.get("title") or ""',
    '        auto = info.get("automatic_captions") or {}',
    '        pt_formats = auto.get("pt", [])',
    '        print("TITLE:" + title)',
    '        print("LANGS:" + ",".join(auto.keys()))',
    '        print("FMTCOUNT:" + str(len(pt_formats)))',
    '        if pt_formats:',
    '            caption_url = None',
    '            for fmt in pt_formats:',
    '                if fmt.get("ext") == "srv1" and fmt.get("url"):',
    '                    caption_url = fmt["url"]',
    '                    break',
    '            if not caption_url and pt_formats[0].get("url"):',
    '                caption_url = pt_formats[0]["url"]',
    '            if caption_url:',
    '                ctx = ssl.create_default_context()',
    '                ctx.check_hostname = False',
    '                ctx.verify_mode = ssl.CERT_NONE',
    '                req = urllib.request.Request(caption_url, headers={"User-Agent": "Mozilla/5.0"})',
    '                with urllib.request.urlopen(req, context=ctx, timeout=20) as response:',
    '                    content = response.read().decode("utf-8")',
    '                    full_text = parse_xml_subs(content)',
    '                    full_text = re.sub(r\'&amp;quot;\', \'"\', full_text)',
    '                    full_text = re.sub(r\'&amp;gt;\', \'>\', full_text)',
    '                    full_text = re.sub(r\'&amp;amp;\', \'&\', full_text)',
    '                    print("TEXT:" + full_text)',
    '                    print("CHARS:" + str(len(full_text)))',
    '            else:',
    '                print("NOCAPTIONURL")',
    '        else:',
    '            print("NOCAPTION")',
    'except Exception as e:',
    '    import traceback',
    '    print("ERROR:" + str(e)[:300])',
    '    print("TRACEBACK:" + traceback.format_exc()[:200])',
  ].join('\n');

  const scriptPath = `/tmp/yt-transcript-extract-${videoId}.py`;
  
  try {
    await writeFile(scriptPath, scriptContent);
    
    const { stdout, stderr } = await execSpawn(venvPython, [scriptPath], { 
      timeout: 90000, 
      env: { ...process.env, PYTHONUNBUFFERED: '1' } 
    });
    
    const output = (stdout + stderr).split('\n').filter(l => l.trim() && !l.includes('[youtube]'));
    
    const result = { videoId, title: '', language: null, text: '', characterCount: 0, segmentCount: 0, status: 'missing', reason: null, availableLanguages: [], formatCount: 0 };
    
    for (const line of output) {
      if (line.startsWith('TITLE:')) result.title = line.slice(6);
      else if (line.startsWith('LANGS:')) result.availableLanguages = line.slice(6).split(',').filter(Boolean);
      else if (line.startsWith('FMTCOUNT:')) result.formatCount = parseInt(line.slice(9), 10) || 0;
      else if (line.startsWith('TEXT:')) result.text = line.slice(5);
      else if (line.startsWith('CHARS:')) result.characterCount = parseInt(line.slice(6), 10) || 0;
      else if (line.startsWith('NOCAPTION')) result.reason = 'Nenhum caption disponível neste idioma';
      else if (line.startsWith('ERROR:')) result.reason = line.slice(6);
    }
    
    if (result.text && result.text.length > 100) {
      result.status = 'available';
      result.segmentCount = result.text.split(/[.!?]/).filter(Boolean).length;
      result.language = 'pt';
    } else if (!result.reason) {
      result.reason = 'Transcrição curta ou vazia para análise';
    }
    
    return result;
  } catch (error) {
    return { videoId, status: 'error', reason: error.message, text: '', characterCount: 0, segmentCount: 0 };
  } finally {
    try {
      const { unlinkSync } = await import('node:fs');
      unlinkSync(scriptPath);
    } catch {}
  }
}

// ─── Análise Estratégica ────────────────────────────────────────────────────

const STRATEGY_KEYWORDS = {
  'Posicionamento': ['posicion', 'nich', 'autoridade', 'categoria', 'diferenci', 'marca', 'narrativa', 'branding'],
  'Oferta': ['oferta', 'produto', 'servico', 'preco', 'ticket', 'pacote', 'garantia', 'assinatura', 'lancamento'],
  'Distribuicao': ['youtube', 'instagram', 'tiktok', 'reels', 'shorts', 'seo', 'ads', 'email', 'whatsapp', 'podcast'],
  'Conversao': ['lead', 'cta', 'conversao', 'fechamento', 'obje', 'agendamento', 'checkout', 'venda', 'convert'],
  'Prova': ['prova', 'case', 'resultado', 'depoimento', 'antes e depois', 'metric', 'dados', 'evidencia'],
  'Operacao': ['processo', 'sistema', 'autom', 'playbook', 'cadencia', 'equipe', 'rotina'],
  'Retencao': ['retenc', 'recorr', 'recompra', 'churn', 'ltv', 'assinatura', 'comunidade'],
};

const BUSINESS_TYPES = {
  'infoproduto': ['curso', 'mentoria', 'coorte', 'aula', 'comunidade', 'lancamento', 'infoproduto'],
  'ecommerce': ['e-commerce', 'checkout', 'frete', 'carrinho', 'sku', 'marketplace'],
  'servico': ['servico', 'consultoria', 'cliente', 'projeto', 'diagnostico'],
  'saas': ['saas', 'software', 'trial', 'demo', 'assinatura', 'onboarding'],
  'local': ['whatsapp', 'agenda', 'local', 'presencial', 'loja'],
  'creator': ['creator', 'audiencia', 'publico', 'canal', 'reels', 'youtube', 'podcast'],
};

function analyzeContent(transcript) {
  const text = transcript.text || '';
  const sentences = text.split(/(?<=[.!?])\s+/).map(s => compactText(s)).filter(Boolean);
  
  const strategies = {};
  for (const [label, keywords] of Object.entries(STRATEGY_KEYWORDS)) {
    const matches = sentences.filter(s => keywords.some(k => s.toLowerCase().includes(k)));
    if (matches.length > 0) {
      strategies[label] = {
        score: Math.min(100, matches.length * 25),
        evidence: matches.slice(0, 3).map(s => s.substring(0, 180)),
        matches: matches.length,
      };
    }
  }
  
  const businessFit = {};
  for (const [type, keywords] of Object.entries(BUSINESS_TYPES)) {
    const matches = keywords.filter(k => text.toLowerCase().includes(k)).length;
    if (matches > 0) {
      businessFit[type] = { score: 45 + matches * 10, matches };
    }
  }
  
  const tactics = [];
  if (/shorts|reels|clip|corte|recorte/.test(text)) tactics.push('Repurpose de conteúdo longo em cortes curtos');
  if (/whatsapp|agendamento|telefone/.test(text)) tactics.push('CTA direto para WhatsApp ou agendamento');
  if (/depoimento|case|resultado/.test(text)) tactics.push('Narrativa apoiada em prova concreta');
  if (/email|newsletter|comunidade/.test(text)) tactics.push('Distribuição própria via email ou comunidade');
  if (/preco|ticket|oferta|garantia/.test(text)) tactics.push('Framing de oferta e redução de risco percebido');
  
  const mechanisms = [];
  if (strategies['Prova'] && strategies['Conversao']) mechanisms.push('Prova reduz objeções e acelera conversão');
  if (strategies['Distribuicao'] && strategies['Posicionamento']) mechanisms.push('Distribuição amplifica posicionamento claro');
  if (strategies['Oferta'] && strategies['Conversao']) mechanisms.push('Clareza da oferta encurta o caminho até a decisão');
  
  const topStrategies = Object.entries(strategies)
    .sort((a, b) => b[1].score - a[1].score)
    .slice(0, 3)
    .map(([k]) => k.toLowerCase());
  
  const thesis = topStrategies.length > 0
    ? `O episódio enfatiza: ${topStrategies.join(', ')}`
    : 'O episódio não apresentou sinais estratégicos claros nos temas monitorados';

  const confidence = (text.length > 10000 && Object.keys(strategies).length >= 4)
    ? 'Alta'
    : (text.length > 3000 && Object.keys(strategies).length >= 2)
      ? 'Média'
      : 'Baixa';

  const applicability = Object.entries(businessFit)
    .sort((a, b) => b[1].score - a[1].score)
    .slice(0, 3)
    .map(([type, data]) => ({
      businessType: type,
      score: Math.min(100, data.score),
      reason: `${data.matches} sinal(is) direto(s) para ${type}`,
    }));

  let decision = 'archive';
  if (Object.keys(strategies).length === 0) {
    decision = 'archive';
  } else if ((strategies['Posicionamento'] || strategies['Prova']) && (strategies['Conversao'] || strategies['Oferta']) && (applicability[0]?.score || 0) >= 70) {
    decision = 'scale';
  } else if (strategies['Conversao'] || strategies['Oferta'] || strategies['Distribuicao']) {
    decision = 'optimize';
  } else if ((strategies['Prova']?.matches || 0) < 2 || text.length < 2000) {
    decision = 'retest';
  }

  const risks = [];
  if ((strategies['Prova']?.matches || 0) < 2) risks.push('Pouca evidência concreta de resultados');
  if (text.length < 2000) risks.push('Transcrição curta para conclusões robustas');
  risks.push('Contexto do invitado pode não refletir aplicabilidade geral');
  
  return {
    strategies,
    mechanisms,
    tactics,
    thesis,
    confidence,
    decision,
    risks,
    applicability,
    sentenceCount: sentences.length,
    topStrategies: topStrategies.map(s => ({ label: s, score: strategies[s]?.score || 0 })),
  };
}

// ─── Output ─────────────────────────────────────────────────────────────────

function formatAnalysis(episode, transcript, analysis, runId) {
  const { videoId, title, publishedAt, channelTitle } = episode;
  const { text, characterCount, status, reason, language, availableLanguages } = transcript;
  
  const strategyList = Object.entries(analysis.strategies)
    .sort((a, b) => b[1].score - a[1].score)
    .map(([label, data]) => `- **${label}** (score: ${data.score}) — ${data.matches} evidências`);

  const businessFit = analysis.applicability
    .map(a => `- **${a.businessType}** (${a.score}/100): ${a.reason}`)
    .join('\n');

  const evidence = Object.values(analysis.strategies)
    .flatMap(s => s.evidence.map(e => `- "${e.substring(0, 150)}..."`))
    .slice(0, 10)
    .join('\n');

  const nextActionByDecision = {
    scale: 'Escalar este padrão em clientes com contexto compatível e validar repetição do mecanismo.',
    optimize: 'Ajustar a aplicação do padrão antes de promover para decisão editorial final.',
    retest: 'Repetir a análise com outro episódio antes de usar este sinal como referência estratégica.',
    pause: 'Arquivar o sinal por enquanto e evitar uso como fundamento principal.',
    archive: 'Arquivar o insight até surgir nova evidência com mecanismo e aplicabilidade mais claros.',
  };
  const nextAction = nextActionByDecision[String(analysis.decision || '').toLowerCase()] || 'Revisar manualmente antes de aplicar.';

  return `# Análise Estratégica — ${title}

**Canal:** ${channelTitle}
**VideoID:** ${videoId}
**Publicado:** ${publishedAt}
**Analisado:** ${new Date().toISOString().split('T')[0]}
**Run:** ${runId}

---

## Context Scope

- source name: ${channelTitle}
- source type: YouTube / podcast
- video or episode ID: \`${videoId}\`
- client-aligned scope: client agnostic
- objective of the analysis: extract reusable strategies from the episode and map them to any target client

---

## Status da Transcrição

| Métrica | Valor |
|---------|-------|
| Status | ${status} |
| Idioma | ${language || 'N/A'} |
| Idiomas disponíveis | ${(availableLanguages || []).join(', ') || 'N/A'} |
| Caracteres | ${characterCount.toLocaleString('pt-BR')} |
| Sentenças | ${analysis.sentenceCount} |
| Motivo | ${reason || '—'} |

---

## Tese Central

${analysis.thesis}

---

## Decisão Sugerida

**${analysis.decision.toUpperCase()}**

---

## Confiança

**${analysis.confidence}**

---

## Próxima Ação

${nextAction}

---

## Estratégias Identificadas

${strategyList.join('\n') || '_Nenhuma estratégia clara identificada_'}

---

## Táticas Mencionadas

${analysis.tactics.map(t => `- ${t}`).join('\n') || '_Nenhuma tática específica_'}

---

## Mecanismos

${analysis.mechanisms.map(m => `- ${m}`).join('\n') || '_Nenhum mecanismo específico_'}

---

## Aplicabilidade do Cliente-Alvo

${businessFit || '_Não foi possível determinar aplicabilidade_'}

---

## Riscos e Limitações

${analysis.risks.map(r => `- ${r}`).join('\n')}

---

## Evidências Citadas

${evidence || '_Sem evidências específicas capturadas_'}

---

## Trecho Analisado (primeiros 1500 chars)

> ${text.substring(0, 1500)}${text.length > 1500 ? '...' : ''}

---

*Gerado via youtube-intelligence.mjs — Squad Social Growth*
`;
}

// ─── CLI ─────────────────────────────────────────────────────────────────────

async function main() {
  const args = process.argv.slice(2);
  
  const config = { mode: null, channel: null, videoId: null, count: 5, runId: new Date().toISOString().replace(/[:.]/g, '-').split('T')[0] };
  
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === '--channel') config.channel = args[++i];
    else if (arg === '--video') config.videoId = args[++i];
    else if (arg === '--latest') config.mode = 'latest';
    else if (arg === '--count') config.count = parseInt(args[++i], 10) || 5;
    else if (arg === '--run-id') config.runId = args[++i];
  }
  
  if (args.includes('--help') || (!config.mode && !config.channel && !config.videoId)) {
    console.log(`
youtube-intelligence.mjs — Extrai e analisa estratégias de podcasts YouTube

Uso:
  node youtube-intelligence.mjs --channel hotmart --count 5
  node youtube-intelligence.mjs --channel kiwify --count 3
  node youtube-intelligence.mjs --video <VIDEO_ID>
  node youtube-intelligence.mjs --latest --count 5

Canais: hotmart, kiwify
    `);
    process.exit(0);
  }
  
  console.log(`\n📡 YouTube Intelligence — Run ${config.runId}`);
  console.log('═'.repeat(50));
  
  let episodes = [];
  
  if (config.channel) {
    const ch = CHANNELS[config.channel];
    if (!ch) { console.error(`Canal desconhecido: ${config.channel}`); process.exit(1); }
    console.log(`\n📺 Canal: ${ch.name}`);
    episodes = await getPlaylistVideos(ch.playlistId, config.count);
    console.log(`   ${episodes.length} episódios encontrados`);
  } else if (config.videoId) {
    console.log(`\n🎬 Vídeo: ${config.videoId}`);
    const url = `https://www.googleapis.com/youtube/v3/videos?part=snippet&id=${config.videoId}&key=${YOUTUBE_API_KEY}`;
    const data = await fetchJSON(url);
    const item = data.items?.[0];
    if (!item) { console.error('Vídeo não encontrado'); process.exit(1); }
    episodes = [{ videoId: config.videoId, title: item.snippet.title, description: item.snippet.description || '', publishedAt: item.snippet.publishedAt, channelTitle: item.snippet.channelTitle }];
  } else if (config.mode === 'latest') {
    const hotmart = await getPlaylistVideos(CHANNELS.hotmart.playlistId, config.count);
    const kiwify = await getPlaylistVideos(CHANNELS.kiwify.playlistId, config.count);
    episodes = [...hotmart, ...kiwify];
    console.log(`\n📺 Hotmart: ${hotmart.length} | Kiwify: ${kiwify.length}`);
  }
  
  console.log(`\n🔍 Processando ${episodes.length} episódio(s)...\n`);
  
  const outputDir = join(SQUAD_OUTPUT, 'output', config.runId, 'youtube-intelligence');
  mkdirSync(outputDir, { recursive: true });
  
  const results = [];
  
  for (const episode of episodes) {
    const shortTitle = episode.title.length > 58 ? episode.title.substring(0, 55) + '...' : episode.title;
    process.stdout.write(`   🎥 ${shortTitle} `);
    
    const transcript = await extractTranscript(episode.videoId);
    
    if (transcript.status === 'available' && transcript.text.length > 100) {
      const analysis = analyzeContent(transcript);
      const analysisFile = join(outputDir, `${episode.videoId}.md`);
      writeFileSync(analysisFile, formatAnalysis(episode, transcript, analysis, config.runId));
      
      const stratCount = Object.keys(analysis.strategies).length;
      console.log(`✅ ${transcript.characterCount.toLocaleString('pt-BR')} chars | ${stratCount} estratégias`);
      results.push({ episode, transcript, analysis, file: analysisFile });
    } else {
      console.log(`⚠️  ${transcript.reason || 'Sem transcrição'}`);
      results.push({ episode, transcript, analysis: null, file: null });
    }
    
    await sleep(300);
  }
  
  const successful = results.filter(r => r.analysis);
  
  if (successful.length > 0) {
    const allStrategies = successful.flatMap(r => Object.keys(r.analysis.strategies));
    const strategyCounts = {};
    allStrategies.forEach(s => { strategyCounts[s] = (strategyCounts[s] || 0) + 1; });
    const topStrategies = Object.entries(strategyCounts).sort((a, b) => b[1] - a[1]).slice(0, 5);
    
    const synthesis = `# Síntese — YouTube Intelligence\n\n**Run:** ${config.runId} | **Data:** ${new Date().toISOString().split('T')[0]}\n**Processados:** ${results.length} | **Com transcrição:** ${successful.length}\n\n## Estratégias Mais Frequentes\n\n${topStrategies.map(([s, c]) => `- **${s}**: ${c} episódio(s)`).join('\n')}\n\n## Táticas\n\n${[...new Set(successful.flatMap(r => r.analysis.tactics))].map(t => `- ${t}`).join('\n')}\n\n## Arquivos\n\n${successful.map(r => `- [${r.episode.title}](${r.episode.videoId}.md)`).join('\n')}\n`;
    
    writeFileSync(join(outputDir, 'synthesis.md'), synthesis);
  }
  
  console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
  console.log(`✅ Concluído: ${successful.length}/${episodes.length} episódios`);
  console.log(`📁 ${outputDir}`);
}

main().catch(err => { console.error('\n❌ Erro:', err.message); process.exit(1); });
