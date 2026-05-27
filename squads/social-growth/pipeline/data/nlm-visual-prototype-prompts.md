# NLM Visual Prototype Prompts

## General Rules

Use these prompts in NotebookLM Studio/Presentation after the relevant client sources are loaded.

Rules for every prompt:

- Keep output in pt-BR with correct accents and diacritics.
- Use only notebook sources.
- Do not invent promises, data, features, guarantees, testimonials, prices, or performance claims.
- Do not use fake social media UI.
- Treat the result as prototype only.
- Final production must still go through the squad pipeline.

## Instagram Carousel 4:5

```text
PERSONA CRIATIVA

Atue como um diretor de arte sênior e estrategista de conteúdo publicitário, especialista em carrosséis verticais para Instagram, peças de performance para redes sociais e comunicação visual para marcas de tecnologia e gestão.

Sua missão é transformar as fontes deste notebook em um protótipo visual claro, elegante e comercialmente útil, sem inventar dados, promessas, funcionalidades ou garantias.

FORMATO: REGRA MAIS IMPORTANTE

Crie exatamente 6 páginas verticais, cada uma parecendo um post de Instagram em formato 4:5.

Cada página deve ser vertical, alta e estreita, no tamanho 1080x1350.

Não crie apresentação widescreen.
Não use formato horizontal.
Não use 16:9.
Não use 4:3.
Não varie a proporção entre os slides.
Todos os 6 slides devem ter exatamente a mesma orientação vertical 4:5.

Antes de gerar, considere esta regra como veto absoluto: se algum slide ficar horizontal, o resultado estará incorreto.

OBJETIVO DO CARROSSEL

[Descreva o objetivo específico da peça com base na campanha aprovada.]

TOM

Profissional, claro, confiável, elegante e orientado a benefício tangível.
Evite exageros, sensacionalismo e promessas absolutas.

ESTRUTURA DOS 6 SLIDES

Slide 1: Gancho principal.
Slide 2: Dor real ou contexto.
Slide 3: Caminho ou oportunidade.
Slide 4: Solução ou apoio da marca.
Slide 5: Benefícios com linguagem segura.
Slide 6: CTA direto.

REGRAS DE COPY

Use frases curtas.
Use português do Brasil com acentuação correta.
Cada slide deve ter apenas uma ideia principal.
Não invente dados, números, garantias ou promessas.
Evite termos absolutos como `controle total`, `transparência total`, `garantido`, `sem erro` ou `sem surpresas`.
Se faltar fonte para uma promessa, escreva de forma mais cuidadosa.

REGRAS VISUAIS

Não use moldura de Instagram.
Não use avatar, curtidas, comentários, barra social ou interface falsa.
Não use layout de aplicativo falso.
Não use área horizontal de apresentação.
Use visual limpo, premium e institucional.
Use as cores, estilo e restrições da marca presentes nas fontes.
Priorize hierarquia: título forte, texto de apoio curto e elemento visual simples.
Mantenha margem inferior segura de 12% a 15%.

CTA FINAL

Use uma chamada segura e direta, alinhada ao objetivo da campanha.

SAÍDA ESPERADA

Gere um protótipo visual em 6 slides verticais 4:5, pronto para exportação como PDF, mantendo todas as páginas em orientação vertical.
```

## Social Single Post 4:5

```text
PERSONA CRIATIVA

Atue como um diretor de arte sênior e estrategista de conteúdo publicitário, especialista em posts únicos para Instagram e Facebook, comunicação visual de alta legibilidade e peças orientadas a ação.

Sua missão é criar um protótipo visual de uma única peça social, com uma mensagem dominante e hierarquia clara.

FORMATO: REGRA MAIS IMPORTANTE

Crie exatamente 1 página vertical em formato 4:5.

A página deve ser vertical, alta e estreita, no tamanho 1080x1350.

Não crie apresentação widescreen.
Não use formato horizontal.
Não use 16:9.
Não use 4:3.

OBJETIVO DO POST

[Descreva o objetivo específico da peça com base na campanha aprovada.]

MENSAGEM DOMINANTE

Use apenas uma ideia principal. A peça deve ser entendida em poucos segundos.

TOM

Profissional, claro, confiável, elegante e orientado a benefício tangível.

REGRAS DE COPY

Use um título curto.
Use no máximo um texto de apoio curto.
Use um CTA direto.
Use português do Brasil com acentuação correta.
Não invente dados, números, garantias ou promessas.
Evite termos absolutos como `controle total`, `transparência total`, `garantido`, `sem erro` ou `sem surpresas`.

REGRAS VISUAIS

Não use moldura de Instagram.
Não use avatar, curtidas, comentários, barra social ou interface falsa.
Não use layout de aplicativo falso.
Use visual limpo e institucional.
Use as cores, estilo e restrições da marca presentes nas fontes.
Priorize uma composição com foco, contraste e boa leitura em celular.
Mantenha margem inferior segura de 12% a 15%.

SAÍDA ESPERADA

Gere um protótipo visual de post único vertical 4:5, pronto para exportação como PDF ou imagem de referência. Este resultado é referência, não arte final para publicação.
```

## Prototype Review Prompt

Use this prompt in NotebookLM chat or with the Reviewer after a prototype is generated:

```text
Avalie este protótipo como referência para uma peça social, não como arte final.

Verifique:
1. O formato solicitado foi respeitado?
2. A copy está em português do Brasil com acentuação correta?
3. Existe promessa, dado, garantia ou funcionalidade sem fonte?
4. A peça usa interface social falsa?
5. A direção visual é específica o suficiente para orientar a squad?
6. O CTA está alinhado ao objetivo da campanha?
7. O que o Visual Director deve aproveitar?
8. O que deve ser descartado antes da produção final?
```
