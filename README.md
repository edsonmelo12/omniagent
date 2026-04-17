# Opensquad

Crie squads de agentes de IA que trabalham juntos — direto do seu IDE.

## Como Usar

Abra esta pasta no seu IDE e digite:

```
/opensquad
```

Isso abre o menu principal. De lá você pode criar squads, executá-los e mais.

Você também pode ser direto — descreva o que quer em linguagem natural:

```
/opensquad crie um squad para escrever posts no LinkedIn sobre IA
/opensquad execute o squad meu-squad
```

## Criar um Squad

Digite `/opensquad` e escolha "Criar squad" no menu, ou seja direto:

```
/opensquad crie um squad para [o que você precisa]
```

O Arquiteto fará algumas perguntas, projetará o squad e configurará tudo automaticamente.

## Executar um Squad

Digite `/opensquad` e escolha "Executar squad" no menu, ou seja direto:

```
/opensquad execute o squad <nome-do-squad>
```

O squad executa automaticamente, pausando apenas nos checkpoints de decisão.

## Configuração do Social Growth

Se você estiver trabalhando no squad `social-growth`, a chave opcional do Brave Search entra apenas no backend:

```env
BRAVE_SEARCH_API_KEY=
```

O arquivo de exemplo completo fica em `backend/.env.example`. O dashboard usa só `VITE_API_BASE_URL`.

## Escritório Virtual

O Escritório Virtual é uma interface visual 2D que mostra seus agentes trabalhando em tempo real.

**Passo 1 — Gere o dashboard** (no seu IDE):

```
/opensquad dashboard
```

**Passo 2 — Sirva localmente** (no terminal):

```bash
npx serve squads/<nome-do-squad>/dashboard
```

**Passo 3 —** Abra `http://localhost:3000` no seu navegador.

---

# Opensquad (English)

Create AI squads that work together — right from your IDE.

## How to Use

Open this folder in your IDE and type:

```
/opensquad
```

This opens the main menu. From there you can create squads, run them, and more.

You can also be direct — describe what you want in plain language:

```
/opensquad create a squad for writing LinkedIn posts about AI
/opensquad run my-squad
```

## Create a Squad

Type `/opensquad` and choose "Create squad" from the menu, or be direct:

```
/opensquad create a squad for [what you need]
```

The Architect will ask a few questions, design the squad, and set everything up automatically.

## Run a Squad

Type `/opensquad` and choose "Run squad" from the menu, or be direct:

```
/opensquad run the <squad-name> squad
```

The squad runs automatically, pausing only at decision checkpoints.

## Virtual Office

The Virtual Office is a 2D visual interface that shows your agents working in real time.

**Step 1 — Generate the dashboard** (in your IDE):

```
/opensquad dashboard
```

**Step 2 — Serve it locally** (in terminal):

```bash
npx serve squads/<squad-name>/dashboard
```

**Step 3 —** Open `http://localhost:3000` in your browser.

## Fluxo Criativo

Para gerar peças sociais profissionais com este repositório, siga o fluxo documentado em `docs/creative-flow.md` e use o `docs/brief-template.md` antes de rodar o gerador. O passo a passo é:

- preencher o briefing com objetivo, público, tese e tom;
- montar o mock visual (paleta, texturas, assinatura do agente) e registrar diferenciais memoráveis;
- rodar o gerador que aplica os temas por layout (hero/split/magazine/poster) e mantém o bloco “AGENTE / Responsável”;
- revisar o preview e capturar feedback (cores, CTA, legibilidade) no checklist pós-geração.

Esses artefatos coordenam designer, copywriter, revisor e stakeholders para entregar uma peça pronta para publicação, não só um SVG técnico.

**Para rodar tudo de uma vez:** `npm run creative:flow` gera o log (`docs/gallery-log.md`) e a issue (`docs/gallery-issue.md`), aplicando backgrounds únicos por layout.

**Previews:** `npm run creative:preview` recria uma página `docs/preview-gallery.html` com todas as variantes embutidas.

**Agendamentos:** `npm run creative:schedule` dispara `creative:flow` repetidamente (configurável via `INTERVAL_SECONDS` e `RUNS`) para simular execução contínua.
