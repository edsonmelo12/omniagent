#!/usr/bin/env node
import https from "node:https";
import { spawn } from "node:child_process";
import path from "node:path";

const WP_URL = "https://amiclube.com.br";
const WP_USER = "edsonrmjunior";
const WP_APP_PASSWORD = "CoBy YZRb OjNf tUV3 I9sw Ma6Q";
const AUTH = Buffer.from(`${WP_USER}:${WP_APP_PASSWORD}`).toString("base64");

const CATEGORY_MAP = {
  "Blog": 5, "Compra e Conversão": 276,
  "Confiança e Reputação": 275, "Escolha e Ergonomia": 273,
  "Preço, Valor e Tendências": 274,
};

function curlUpload(filePath) {
  return new Promise((resolve, reject) => {
    const filename = path.basename(filePath);
    const proc = spawn("curl", [
      "-s", "-X", "POST",
      `${WP_URL}/wp-json/wp/v2/media`,
      "-H", `Authorization: Basic ${AUTH}`,
      "-F", `file=@${filePath};filename=${filename};type=image/jpeg`,
    ]);
    let out = "";
    proc.stdout.on("data", d => out += d);
    proc.on("close", () => {
      try {
        const r = JSON.parse(out);
        if (r.id) { console.log(`   🖼️  Upload: ${filename} → ID ${r.id}`); resolve(r.id); }
        else { console.log(`   ❌ Upload: ${r.message || out.substring(0,80)}`); resolve(null); }
      } catch { console.log(`   ❌ Parse: ${out.substring(0,80)}`); resolve(null); }
    });
    proc.on("error", reject);
  });
}

function api(endpoint, data) {
  return new Promise((resolve, reject) => {
    const json = data ? JSON.stringify(data) : null;
    const options = {
      hostname: new URL(WP_URL).hostname,
      path: `/wp-json/wp/v2/${endpoint}`,
      method: "POST",
      headers: { "Authorization": `Basic ${AUTH}` },
    };
    if (json) { options.headers["Content-Type"] = "application/json"; options.headers["Content-Length"] = Buffer.byteLength(json); }
    const req = https.request(options, (res) => {
      let b = "";
      res.on("data", c => b += c);
      res.on("end", () => { try { resolve(JSON.parse(b)); } catch { resolve(b); } });
    });
    req.on("error", reject);
    if (json) req.write(json);
    req.end();
  });
}

async function publishPost(postData, existingPostId) {
  console.log(`\n📤 ${existingPostId ? `Atualizando` : `Publicando`}: "${postData.title}"`);

  if (!postData.categories?.length) {
    console.log(`❌ Rejeitado: categories obrigatório`); return;
  }

  const catNames = postData.categories.map(id =>
    Object.keys(CATEGORY_MAP).find(k => CATEGORY_MAP[k] === id) || id).join(", ");

  // Step 1: create or update base post
  let postId = existingPostId;
  if (!postId) {
    const r = await api("posts", {
      title: postData.title, slug: postData.slug, content: postData.content,
      status: "future", featured_media: postData.featured_media,
      categories: postData.categories, date: postData.date, date_gmt: postData.date_gmt,
    });
    if (!r.id) { console.log(`❌ Criação: ${r.message || JSON.stringify(r).substring(0,200)}`); return; }
    postId = r.id;
    console.log(`   🆔 Post ${postId} criado`);
  }

  // Step 2: apply Yoast SEO (separate call ensures update_callback fires)
  const r2 = await api(`posts/${postId}`, {
    yoast_head_json: {
      focuskw: postData.focuskw,
      title: postData.seoTitle,
      metadesc: postData.metadesc,
    },
  });

  if (r2.id) {
    console.log(`✅ Post ${r2.id} concluído!`);
    console.log(`   📝 Focus KW: ${postData.focuskw}`);
    console.log(`   🔗 Slug: ${postData.slug}`);
    console.log(`   📅 Data: ${r2.date}`);
    console.log(`   🏷️  Categorias: ${catNames}`);
    console.log(`   🔗 URL: ${r2.link}`);
  } else {
    console.log(`❌ SEO: ${r2.message || JSON.stringify(r2).substring(0,200)}`);
  }
}

const ASSETS = "/home/edsonrmjunior/Local Sites/omniagent/squads/social-growth/output/amiclube/blog/assets";

const posts = [
  {
    slug: "preco-valor-avaliar-antes-de-comprar-amigurumi",
    title: "Preço, valor e o que avaliar antes de comprar amigurumi",
    date: "2026-05-04T08:00:00",
    date_gmt: "2026-05-04T11:00:00",
    categories: [CATEGORY_MAP["Preço, Valor e Tendências"]],
    imagePath: path.join(ASSETS, "AC-30-05-preco-valor-hero.jpg"),
    focuskw: "preço e valor amigurumi",
    seoTitle: "Preço e valor amigurumi: guia de avaliação | AmiClube",
    metadesc: "Entenda a diferença entre preço e valor amigurumi e use 5 critérios para comparar propostas com segurança, evitar arrependimento e decidir melhor.",
    content: `<p>A pergunta que mais atrasa uma boa compra não é qual é o mais barato, e sim qual entrega o melhor resultado para a minha ocasião. Em <strong>preço e valor amigurumi</strong>, confundir essas duas coisas costuma gerar frustração: a peça até cabe no orçamento, mas não atende expectativa, não combina com o contexto de uso ou perde força na percepção de presente especial.</p>
<p>Quando a decisão é feita só pela etiqueta, você compara números. Quando a decisão é feita por valor, você compara proposta, confiança e aderência ao objetivo. A diferença parece sutil, mas muda o desfecho da compra.</p>
<p>Este guia ajuda você a decidir com clareza, sem linguagem técnica de produção. A ideia é simples: transformar dúvida em critério para reduzir arrependimento.</p>
<h2>Por que comparar só preço aumenta o risco de arrependimento</h2>
<p>Preço é um dado pontual. Valor é um conjunto de entregas percebidas ao longo da experiência. O problema começa quando duas opções parecem parecidas em uma visão rápida, e a comparação para na primeira camada. <strong>Além disso</strong>, o arrependimento nasce em três pontos recorrentes:</p>
<ul>
<li>a expectativa é criada por foto e frase curta, sem leitura completa da proposta;</li>
<li>a comparação ignora cenário de uso (presente, coleção, decoração, ocasião especial);</li>
<li>a decisão fecha sem validar critérios básicos de confiança comercial.</li>
</ul>
<p><strong>Portanto</strong>, o risco não está em pagar mais ou menos por si só. O risco está em comprar sem contexto. Uma escolha boa não é a mais cara nem a mais barata: é a que entrega melhor para o objetivo real da compra.</p>
<h2>Os 5 critérios que realmente mostram valor</h2>
<p>Em vez de comparar propostas por impressão geral, use esta matriz:</p>
<ol>
<li><strong>Coerência de proposta</strong> — A peça conversa com a ocasião? Presente afetivo, decoração de ambiente e peça de coleção exigem leituras diferentes.</li>
<li><strong>Qualidade percebida no conjunto</strong> — Observe apresentação, consistência visual, acabamento percebido e padrão de entrega.</li>
<li><strong>Confiança comercial</strong> — <strong>Por exemplo</strong>, prazo claro, canal de contato responsivo e política de atendimento reduzem incerteza.</li>
<li><strong>Durabilidade percebida</strong> — Avalie sinais de conservação esperada e estabilidade da proposta ao longo do tempo.</li>
<li><strong>Aderência ao seu objetivo</strong> — Se o objetivo é presentear, o critério muda. <strong>Do mesmo modo</strong>, se o objetivo é compor decoração autoral, também muda.</li>
</ol>
<h2>Três erros que tornam o barato mais caro</h2>
<ul>
<li><strong>Erro 1: decidir pela foto sem validar a proposta</strong> — A imagem chama atenção, mas não substitui contexto de compra.</li>
<li><strong>Erro 2: ignorar o custo de retrabalho da decisão</strong> — Troca, nova compra, tempo perdido e desgaste emocional são custos invisíveis.</li>
<li><strong>Erro 3: comparar por etiqueta e não por entrega</strong> — Quando a análise para na etiqueta, propostas com níveis diferentes de entrega parecem equivalentes.</li>
</ul>
<h2>Quando pagar mais vale a pena (e quando não vale)</h2>
<p>Pagar mais vale a pena quando a proposta resolve melhor a ocasião, atendimento reduz dúvida e o conjunto diminui risco de arrependimento. <strong>Por outro lado</strong>, não vale quando a diferença é apenas estética superficial.</p>
<h2>Checklist final para avaliar proposta antes de fechar</h2>
<ol>
<li>Esta proposta combina com a ocasião e com a intenção da compra?</li>
<li>O atendimento explica prazo, processo e suporte com clareza?</li>
<li>O valor percebido está explícito além do preço da etiqueta?</li>
<li>Eu consigo justificar minha escolha em uma frase objetiva?</li>
<li>Estou comparando todas as opções com os mesmos critérios?</li>
</ol>
<p>Se você respondeu não para duas ou mais perguntas, pause e reavalie.</p>
<h2>FAQ</h2>
<h3>Como avaliar preço e valor no amigurumi sem conhecimento técnico?</h3>
<p>Compare proposta, contexto de uso, clareza comercial e confiança de atendimento.</p>
<h3>O mais barato sempre sai caro?</h3>
<p>Ele sai caro quando a decisão ignora objetivo, risco e aderência da proposta.</p>
<h2>Conclusão</h2>
<p>Decidir melhor não significa pagar mais em toda compra. <strong>Em suma</strong>, significa pagar com critério, com contexto e com objetivo claro.</p>
<p><strong>CTA:</strong> Quer receber o checklist pronto? <a href="https://amiclube.com.br/contato">Chame a AmiClube no direct</a> e peça a curadoria de avaliação.</p>`,
  },
  {
    slug: "tendencias-2026-por-que-o-veludo-e-o-novo-luxo",
    title: "Tendências 2026: por que o veludo é o novo luxo",
    date: "2026-05-06T08:00:00",
    date_gmt: "2026-05-06T11:00:00",
    categories: [CATEGORY_MAP["Preço, Valor e Tendências"]],
    imagePath: path.join(ASSETS, "AC-30-05b-veludo-luxo-hero.jpg"),
    focuskw: "amigurumi de veludo luxo",
    seoTitle: "Amigurumi de veludo luxo: guia 2026 | AmiClube",
    metadesc: "Descubra por que o amigurumi de veludo luxo virou referência em 2026 e como avaliar valor percebido, contexto de uso e diferenciação antes de comprar.",
    content: `<p>Em 2026, o luxo deixou de ser apenas o que se vê. Ele passou a ser, cada vez mais, o que se sente. No mercado artesanal premium, essa mudança ficou clara: materiais com presença tátil e profundidade visual ganharam espaço em decisões de compra mais exigentes.</p>
<p>Nesse cenário, o veludo se consolidou como um dos sinais mais fortes de valor percebido no <strong>amigurumi de veludo luxo</strong>. Não por ser da moda, mas por responder a uma demanda real de quem compra com mais critério: experiência, conforto sensorial e sofisticação de ambiente.</p>
<p>Este artigo não ensina execução técnica de peça. O objetivo é ajudar você a interpretar essa tendência com visão de negócio e decisão de compra.</p>
<h2>O que mudou no mercado para o veludo ganhar protagonismo</h2>
<p>O consumidor premium de 2026 está menos interessado em novidade vazia e mais interessado em coerência de experiência. <strong>Primeiramente</strong>, há a busca por ambientes mais acolhedores e sensoriais. <strong>Além disso</strong>, há preferência por peças com assinatura e identidade visual forte. <strong>Por fim</strong>, há maior maturidade na comparação entre preço e valor entregue.</p>
<h2>Veludo como linguagem de posicionamento</h2>
<p>Quando uma marca artesanal usa veludo de forma coerente, ela não está apenas escolhendo um material. Está declarando posicionamento. Essa linguagem comunica curadoria mais criteriosa e intenção de gerar percepção de luxo tátil.</p>
<h2>Por que o veludo aumenta valor percebido no contexto certo</h2>
<p>No contexto certo, ele agrega profundidade visual, apelo sensorial, efeito de destaque e memória de marca. <strong>Contudo</strong>, sem contexto esse ganho pode se perder.</p>
<h2>Quando o veludo não é a melhor escolha</h2>
<p>Ele pode não ser ideal quando o objetivo é apenas preço de entrada, o ambiente exige linguagem minimalista ou a decisão está sendo feita por impulso.</p>
<h2>Como avaliar uma proposta em veludo com critério</h2>
<ol>
<li><strong>Uso principal da peça</strong> — O uso define o peso de cada critério.</li>
<li><strong>Coerência com o ambiente</strong> — A peça conversa com paleta e iluminação do espaço?</li>
<li><strong>Experiência esperada</strong> — A proposta entrega aquilo que o comprador busca?</li>
<li><strong>Nível de diferenciação</strong> — Há assinatura clara da marca?</li>
<li><strong>Coerência preço x proposta</strong> — O preço está justificado pelo valor percebido?</li>
</ol>
<h2>Checklist de decisão para 2026</h2>
<ol>
<li>Eu sei qual papel essa peça terá no ambiente?</li>
<li>A proposta comunica luxo sensorial de forma coerente?</li>
<li>A diferenciação é real ou apenas estética de superfície?</li>
<li>O valor percebido está claro além da etiqueta?</li>
<li>Estou comprando por critério ou por urgência?</li>
</ol>
<p>Se duas respostas forem não, vale pausar e revisar opções.</p>
<h2>FAQ</h2>
<h3>O veludo é tendência passageira no amigurumi?</h3>
<p>Em 2026, os sinais apontam uso consistente em posicionamento premium.</p>
<h3>Veludo sempre significa peça mais cara?</h3>
<p>Não necessariamente. O relevante é a coerência entre proposta e contexto de uso.</p>
<h2>Conclusão</h2>
<p>O veludo virou novo luxo no amigurumi porque responde a uma mudança real de comportamento: pessoas querem beleza com experiência, não apenas aparência com promessa. <strong>Portanto</strong>, quando essa tendência é aplicada com curadoria, ela fortalece posicionamento e melhora decisão de compra.</p>
<p><strong>CTA:</strong> Quer saber quais peças em veludo fazem sentido para seu contexto? <a href="https://amiclube.com.br/contato">Solicite curadoria da AmiClube</a>.</p>`,
  },
];

(async () => {
  console.log("📤 Semana 2 — AmiClube Blog (corrigido)");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

  // Known post IDs for existing week 2 posts
  const existingIds = { "preco-valor-avaliar-antes-de-comprar-amigurumi": 13014, "tendencias-2026-por-que-o-veludo-e-o-novo-luxo": 13016 };

  for (const post of posts) {
    const existingId = existingIds[post.slug] || null;

    if (!existingId) {
      console.log(`\n📤 Imagem: ${path.basename(post.imagePath)}`);
      const mediaId = await curlUpload(post.imagePath);
      if (!mediaId) { console.log(`❌ Abortando: upload falhou`); continue; }
      post.featured_media = mediaId;
    } else {
      console.log(`\n📤 Post já existe (ID ${existingId}), pulando upload`);
    }

    await publishPost(post, existingId);
  }

  console.log(`\n🎯 Semana 2 completa!`);
})();