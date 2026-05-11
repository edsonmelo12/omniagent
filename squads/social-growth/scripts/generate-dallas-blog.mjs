import fs from "node:fs";
import path from "node:path";

throw new Error(
  [
    "Deprecated script: generate-dallas-blog.mjs",
    "Final blog articles for social-growth must be generated through the squad flow",
    "(brief -> architecture -> draft -> discovery optimization -> review), not by scripted family templates.",
    "This script may not be used to author or rewrite final blog copy for any client."
  ].join(" ")
);

const baseDir = path.resolve("squads/social-growth/output/dallas-rent-a-car/blog");
const publishedDate = "2026-04-16";
const runId = "dallas-rent-a-car-v2-structure-pass";

const articles = [
  {
    slug: "frota-propria-vs-terceirizacao-belem",
    title: "Frota própria vs terceirização: quando a conta fecha para empresas em Belém",
    keyword: "terceirização de frota Belém",
    family: "Comparison / Decision",
    variant: "decision-matrix",
    thesis:
      "Para a maioria das empresas que dependem de mobilidade operacional, terceirizar a frota melhora previsibilidade de caixa, reduz risco de manutenção e acelera a disponibilidade dos veículos.",
    tldr: [
      "Se a operação perde receita quando um carro para, a decisão deixa de ser patrimonial e passa a ser operacional.",
      "Comparar só mensalidade ou parcela mascara custo total, tempo improdutivo e risco de indisponibilidade.",
      "O desenho mais seguro costuma começar com diagnóstico por veículo e piloto controlado, não com migração por impulso."
    ],
    meta:
      "Entenda como decidir entre frota própria e terceirizada em Belém com critérios objetivos de custo total, risco e produtividade.",
    openingTitle: "A pergunta que a maioria responde do jeito errado",
    openingText:
      "A comparação entre frota própria e terceirização quase sempre começa no lugar errado: compra versus mensalidade. Só que o caixa não sente apenas esse número. O que pesa de verdade é o custo de manter a operação rodando sem puxar tempo demais do financeiro, do gestor e do time que depende do carro.",
    marketShift:
      "O setor de locação ganhou escala e maturidade. Em 2026, a conversa em Belém não é mais sobre quem entrega o menor valor aparente. É sobre quem reduz atrito operacional, protege agenda e transforma mobilidade em serviço com previsibilidade.",
    decisionPointsTitle: "Quando essa decisão deixa de ser adiada",
    decisionPoints: [
      "Você depende de veículos ativos todos os dias e qualquer parada já desorganiza rota, visita ou atendimento.",
      "Seu financeiro sente depreciação, revenda e manutenção como picos de caixa difíceis de explicar.",
      "Sua operação continua tratando documentação, seguro, sinistro e substituição como tarefas paralelas, não como custo real."
    ],
    criteriaTitle: "Os quatro critérios que deveriam mandar mais do que o apego ao ativo",
    criteria: [
      "custo total da missão, e não só custo financeiro do veículo",
      "tempo improdutivo escondido em manutenção, documentação e exceções",
      "risco operacional quando o carro falha no meio da rotina",
      "capacidade interna real para gerir a frota sem desviar foco do core"
    ],
    scenarioTitle: "Como cada modelo responde quando a operação aperta",
    scenarioBlocks: [
      {
        title: "### Frota própria ainda vence quando",
        body:
          "A utilização é estável, o perfil de uso muda pouco, a empresa já tem governança automotiva madura e a indisponibilidade eventual não desmonta a operação."
      },
      {
        title: "### Terceirização ganha quando",
        body:
          "A empresa precisa de disponibilidade contínua, resposta rápida a incidente, previsibilidade de caixa e menos esforço administrativo para manter os carros na rua."
      },
      {
        title: "### O critério que realmente desempata",
        body:
          "Se a parada de um único veículo já cancela visita, atrasa entrega ou trava agenda crítica, a conta deixa de ser patrimonial. Ela passa a ser uma conta de continuidade operacional."
      }
    ],
    implementationTitle: "Como comparar sem cair em achismo",
    steps: [
      "Mapeie o custo total atual por veículo: compra, juros, seguro, manutenção, documentação, tempo parado e impacto operacional por indisponibilidade.",
      "Defina o nível de serviço mínimo antes de pedir proposta: tempo máximo sem carro, canal de suporte, carro substituto e rotina de contingência.",
      "Separe a frota por perfil de uso: urbano leve, executivo, campo e operação sensível a parada.",
      "Solicite proposta com escopo fechado: quilometragem, cobertura, franquias, substituição e SLA de atendimento.",
      "Rode um piloto de 60 a 90 dias com indicadores de custo, disponibilidade e horas internas poupadas."
    ],
    errorsTitle: "Onde a análise costuma desandar",
    errors: [
      "Comparar apenas parcela ou mensalidade e ignorar o custo da indisponibilidade.",
      "Misturar veículos de uso muito diferente no mesmo raciocínio financeiro.",
      "Entrar em contrato sem critério de substituição, SLA e regra clara de exceção."
    ],
    nuanceTitle: "A nuance que evita decisão bonita no papel e ruim na prática",
    nuanceText:
      "Nem toda empresa deve migrar tudo de uma vez. Em muitos casos, o desenho mais inteligente é manter parte da frota em um modelo, testar outra parte em terceirização e usar o piloto para descobrir onde o ganho é financeiro, onde é operacional e onde ainda não faz sentido mexer.",
    faq: [
      {
        q: "Terceirização sempre é mais barata?",
        a: "Nem sempre no preço nominal mensal, mas costuma ser melhor no custo total quando há uso intenso, risco operacional e necessidade de previsibilidade."
      },
      {
        q: "Quando frota própria ainda pode fazer sentido?",
        a: "Quando o uso é baixo, previsível e a empresa já possui estrutura madura de gestão automotiva."
      },
      {
        q: "Qual indicador devo acompanhar primeiro?",
        a: "Disponibilidade de frota por semana e custo total por quilômetro rodado."
      }
    ],
    cta: "Se você já tem frota ativa em Belém, comece com um diagnóstico simples de custo total por veículo e compare com um piloto terceirizado.",
    image: "assets/frota-propria-vs-terceirizacao.jpg",
    alt: "Gestor comparando custo de frota própria e terceirização em painel operacional.",
    imageSource: {
      sourceClass: "CC0 / Public Domain support image",
      sourceName: "PxHere",
      sourcePage: "https://pxhere.com/en/photo/1703012",
      licenseType: "CC0 Public Domain",
      licenseUrl: "https://creativecommons.org/publicdomain/zero/1.0/",
      attributionRequirement: "No attribution required",
      dateUsed: publishedDate,
      searchNote: "Search terms: rent agreement car business keys",
      rationale:
        "Selected for direct rental and business-decision signals that support a procurement-focused comparison article."
    },
    openingShape: "decisao direta",
    proofPlacement: "matriz de criterio no inicio",
    nuancePlacement: "antes da recomendacao final",
    repetitionGuardrail: "nao usar checklist ou plano de 30 dias neste artigo"
  },
  {
    slug: "aluguel-mensal-custos-invisiveis",
    title: "Aluguel mensal para empresas: 7 custos invisíveis que o gestor elimina",
    keyword: "aluguel mensal para empresas",
    family: "Framework Operacional",
    variant: "cost-system",
    thesis:
      "Aluguel mensal não é apenas troca de formato financeiro; é um mecanismo para eliminar custos invisíveis de operação e liberar equipe para o core do negócio.",
    meta:
      "Veja os custos invisíveis que pesam na frota própria e como o aluguel mensal melhora previsibilidade operacional.",
    marketShift:
      "Com margem mais pressionada, empresas estão revendo despesas que não aparecem no orçamento inicial, mas corroem resultado ao longo do ciclo da frota.",
    decisionPoints: [
      "Você já perdeu agenda por veículo parado em manutenção corretiva.",
      "Existe esforço interno recorrente para resolver documentação e sinistro.",
      "Seu time administrativo está ocupado com tarefas que não geram receita."
    ],
    steps: [
      "Liste os 7 custos invisíveis: parada operacional, gestão de sinistro, carro reserva, variação de manutenção, custo de revenda, tempo administrativo e risco jurídico.",
      "Classifique cada custo por frequência e impacto financeiro mensal.",
      "Defina uma linha-base de 90 dias para medir perda real de produtividade.",
      "Estruture contrato mensal com cobertura adequada ao uso da sua operação.",
      "Monitore ganho em disponibilidade e horas poupadas de equipe."
    ],
    errors: [
      "Subestimar custo de oportunidade da equipe interna.",
      "Não medir tempo de resolução de incidente por veículo.",
      "Aceitar proposta sem detalhamento de coparticipação e limites."
    ],
    faq: [
      {
        q: "Quais custos invisíveis pesam mais?",
        a: "Normalmente indisponibilidade de veículo, tempo administrativo e risco de manutenção não planejada."
      },
      {
        q: "Como comprovar ganho para diretoria?",
        a: "Compare linha-base de 90 dias com indicadores pós-implantação: custo por km, disponibilidade e horas de equipe liberadas."
      },
      {
        q: "Preciso migrar toda a frota de uma vez?",
        a: "Não. A estratégia mais segura é migrar por ondas, começando por veículos críticos."
      }
    ],
    cta: "Monte uma planilha de custos invisíveis hoje e decida com números, não com percepção.",
    image: "assets/aluguel-mensal-custos-invisiveis.jpg",
    alt: "Painel financeiro mostrando custos invisíveis da frota e ganhos com aluguel mensal.",
    imageSource: {
      sourceClass: "CC0 / Public Domain support image",
      sourceName: "PxHere",
      sourcePage: "https://pxhere.com/fr/photo/1703008",
      licenseType: "CC0 Public Domain",
      licenseUrl: "https://creativecommons.org/publicdomain/zero/1.0/",
      attributionRequirement: "No attribution required",
      dateUsed: publishedDate,
      searchNote: "Search terms: car rental keys contract business",
      rationale:
        "Selected because keys, contract and service context reinforce the shift from vehicle ownership to managed monthly rental."
    },
    openingShape: "lista de perdas escondidas",
    proofPlacement: "os sete custos aparecem como corpo central",
    nuancePlacement: "nos limites de migracao gradual",
    repetitionGuardrail: "nao usar comparacao binaria ou FAQ no meio do artigo"
  },
  {
    slug: "viagem-corporativa-2026-locacao-local",
    title: "Viagem corporativa em 2026: como reduzir risco e atraso com locação local",
    keyword: "locação para viagem corporativa",
    family: "Playbook / Checklist",
    variant: "trip-playbook",
    thesis:
      "Em viagem corporativa, o custo de um atraso costuma ser maior do que o custo da locação. Planejamento local reduz falhas e protege agenda crítica.",
    meta:
      "Aprenda um playbook de locação local para viagens corporativas com menos atraso e mais controle operacional.",
    marketShift:
      "Turismo corporativo segue aquecido e empresas estão valorizando conveniência, previsibilidade e serviços agregados para não comprometer reuniões e entregas.",
    decisionPoints: [
      "Sua operação depende de agenda com múltiplos deslocamentos no mesmo dia.",
      "A equipe viaja com prazos apertados e pouca margem para atraso.",
      "Você precisa de suporte local para troca rápida de veículo em incidente."
    ],
    steps: [
      "Planeje retirada e devolução com janela realista entre voo, trânsito e primeiro compromisso.",
      "Escolha categoria de carro pelo tipo de agenda, não apenas pela diária.",
      "Valide cobertura, política de condutor adicional e regra de no-show antes da viagem.",
      "Defina plano B: contato de suporte 24h e procedimento de substituição.",
      "Registre pós-viagem: tempo de deslocamento, incidentes e custo total por missão."
    ],
    errors: [
      "Reservar no limite sem margem para variação do voo.",
      "Escolher categoria abaixo da necessidade operacional.",
      "Ignorar política de cobertura e coparticipação antes da retirada."
    ],
    faq: [
      {
        q: "Vale reservar com antecedência mesmo em viagem curta?",
        a: "Sim. Antecedência aumenta disponibilidade de categoria adequada e reduz risco de ajuste de última hora."
      },
      {
        q: "Qual categoria é melhor para agenda executiva?",
        a: "Depende do trajeto e equipe. Conforto, bagagem e tipo de deslocamento devem guiar a escolha."
      },
      {
        q: "Como reduzir risco de no-show?",
        a: "Confirme horário, política de tolerância e canal de contato da locadora antes do embarque."
      }
    ],
    cta: "Padronize este playbook para cada viagem corporativa e reduza custo de atraso já no próximo ciclo.",
    image: "assets/viagem-corporativa-locacao-local.jpg",
    alt: "Executivo retirando carro alugado no aeroporto para cumprir agenda corporativa.",
    imageSource: {
      sourceClass: "CC0 / Public Domain support image",
      sourceName: "PxHere",
      sourcePage: "https://pxhere.com/en/photo/1601100",
      licenseType: "CC0 Public Domain",
      licenseUrl: "https://creativecommons.org/publicdomain/zero/1.0/",
      attributionRequirement: "No attribution required",
      dateUsed: publishedDate,
      searchNote: "Search terms: airport terminal car business travel",
      rationale:
        "Selected for direct airport and travel context, which improves scanability for the corporate travel playbook."
    },
    openingShape: "cenario de atraso evitavel",
    proofPlacement: "checklist antes da sequencia de execucao",
    nuancePlacement: "na secao de plano B",
    repetitionGuardrail: "nao usar matriz comparativa"
  },
  {
    slug: "escolher-categoria-carro-operacao",
    title: "Como escolher a categoria certa (hatch, SUV ou 4x4) para cada operação da sua empresa",
    keyword: "escolher categoria de carro para empresa",
    family: "Comparison / Decision",
    variant: "use-case-comparison",
    thesis:
      "A categoria do veículo deve acompanhar a função da operação. Quando isso não acontece, a empresa paga mais e entrega menos.",
    meta:
      "Entenda critérios objetivos para escolher hatch, SUV ou 4x4 conforme o tipo de operação empresarial.",
    marketShift:
      "Com oferta mais diversa no mercado de locação, o ganho está na aderência do veículo ao uso real, não no modelo mais caro.",
    decisionPoints: [
      "Sua equipe roda majoritariamente em ambiente urbano e trajeto previsível.",
      "Há deslocamento frequente com carga, equipe ou estrada de acesso difícil.",
      "Você precisa equilibrar conforto executivo com eficiência de custo."
    ],
    steps: [
      "Classifique a operação em três cenários: urbano leve, executivo misto e campo/uso severo.",
      "Defina quilometragem média, carga transportada e perfil de terreno.",
      "Atribua categoria por cenário: hatch para eficiência urbana, SUV para uso misto, 4x4 para campo.",
      "Padronize critérios de upgrade e substituição para evitar improviso.",
      "Revise trimestralmente aderência da categoria com base em uso real."
    ],
    errors: [
      "Comprar conforto desnecessário para operação estritamente urbana.",
      "Usar categoria urbana em operação de campo com perda de produtividade.",
      "Trocar categoria por preferência pessoal e não por critério operacional."
    ],
    faq: [
      {
        q: "SUV sempre vale mais que hatch?",
        a: "Não. Em operação urbana leve, hatch costuma ter melhor eficiência de custo e agilidade."
      },
      {
        q: "Quando 4x4 é obrigatório?",
        a: "Quando há trajeto frequente em terreno de baixa aderência ou demanda de carga e robustez."
      },
      {
        q: "Como evitar erro de categoria?",
        a: "Use dados de rota, quilometragem e tipo de missão para cada time."
      }
    ],
    cta: "Crie sua matriz de categoria por operação e pare de decidir frota por intuição.",
    image: "assets/escolher-categoria-certa.jpg",
    alt: "Comparação entre hatch, SUV e pickup 4x4 para diferentes tipos de operação empresarial.",
    imageSource: {
      sourceClass: "CC0 / Public Domain support image",
      sourceName: "PxHere",
      sourcePage: "https://pxhere.com/en/photo/1629378",
      licenseType: "CC0 Public Domain",
      licenseUrl: "https://creativecommons.org/publicdomain/zero/1.0/",
      attributionRequirement: "No attribution required",
      dateUsed: publishedDate,
      searchNote: "Search terms: pickup truck suv operation terrain",
      rationale:
        "Selected to emphasize category fit by operation severity, especially field and heavy-duty use cases covered in the article."
    },
    openingShape: "pergunta de escolha por cenario",
    proofPlacement: "cenarios de uso antes da recomendacao",
    nuancePlacement: "tradeoff entre conforto e robustez",
    repetitionGuardrail: "nao repetir a mesma matriz do artigo de terceirizacao"
  },
  {
    slug: "locacao-com-motorista-belem",
    title: "Locação com motorista em Belém: quando vale mais do que dirigir por conta própria",
    keyword: "locação com motorista Belém",
    family: "Contrarian Guide",
    variant: "belief-reversal",
    thesis:
      "Para agendas críticas, dirigir por conta própria pode sair mais caro em tempo, foco e risco do que contratar locação com motorista.",
    tldr: [
      "Dirigir parece mais barato porque o custo do tempo perdido quase nunca entra na conta com a mesma força da diária.",
      "Quando o deslocamento compete com reunião, negociação e pontualidade, o motorista deixa de ser conforto e vira capacidade operacional.",
      "O uso inteligente não é para toda missão. É para agendas em que atraso, dispersão ou improviso custam mais do que a economia nominal."
    ],
    meta:
      "Veja quando a locação com motorista gera mais valor do que a condução própria em agendas empresariais.",
    openingTitle: "A crença que faz muita empresa economizar no lugar errado",
    openingText:
      "Dirigir por conta própria parece mais econômico porque o custo da locação com motorista aparece na proposta. O problema é que o custo da agenda perdida, da atenção fragmentada e do atraso evitável quase nunca aparece com a mesma clareza.",
    marketShift:
      "Com maior exigência por produtividade, serviços agregados de mobilidade ganharam peso no planejamento corporativo. Em vez de olhar só transporte, empresas passaram a olhar o valor do tempo útil que existe entre uma missão e outra.",
    decisionPointsTitle: "Sinais de que dirigir já está custando mais do que parece",
    decisionPoints: [
      "A agenda exige múltiplas reuniões no mesmo dia, com janela curta entre deslocamentos.",
      "Quem está no carro também precisa revisar material, responder cliente ou tomar decisão em movimento.",
      "Há baixa tolerância a imprevistos de trânsito, estacionamento, rota ou chegada atrasada."
    ],
    pivotTitle: "O quadro melhor para decidir",
    implementationTitle: "Como testar sem transformar conveniência em privilégio mal explicado",
    steps: [
      "Mapeie o custo da distração operacional de quem dirige e também precisa executar, negociar ou decidir.",
      "Identifique quais agendas realmente dependem de foco, pontualidade e capacidade de trabalhar durante o deslocamento.",
      "Defina regras objetivas de uso por tipo de missão, e não por cargo ou preferência pessoal.",
      "Padronize briefing de rota, janela de espera, contato e protocolo de contingência.",
      "Avalie resultado por atraso evitado, reuniões cumpridas e tempo produtivo recuperado."
    ],
    errorsTitle: "Objeções que parecem fortes, mas escondem a conta errada",
    errors: [
      "Usar locação com motorista sem critério de missão e virar um serviço sem lógica de operação.",
      "Comparar apenas preço por diária e ignorar custo da agenda perdida ou do foco interrompido.",
      "Não definir expectativa de serviço, janela de espera e padrão de comunicação antes da operação."
    ],
    nuanceTitle: "A nuance que evita modismo e também evita miopia",
    nuanceText:
      "Locação com motorista não precisa virar regra para toda a empresa. O uso inteligente é seletivo: vale nas missões em que tempo, foco e pontualidade têm valor operacional alto o bastante para justificar a troca.",
    faq: [
      {
        q: "Locação com motorista é só para alta liderança?",
        a: "Não. É útil em qualquer missão onde atraso e perda de foco gerem custo alto."
      },
      {
        q: "Como justificar internamente esse formato?",
        a: "Com indicadores de pontualidade, reuniões cumpridas e tempo produtivo recuperado."
      },
      {
        q: "Dá para combinar com locação sem motorista?",
        a: "Sim. Muitas empresas usam modelo híbrido por tipo de operação."
      }
    ],
    cta: "Escolha três tipos de missão críticas e teste locação com motorista por 30 dias.",
    image: "assets/locacao-com-motorista-belem.jpg",
    alt: "Carro executivo com motorista atendendo cliente corporativo em deslocamento urbano.",
    imageSource: {
      sourceClass: "CC0 / Public Domain support image",
      sourceName: "PxHere",
      sourcePage: "https://pxhere.com/en/photo/1707796",
      licenseType: "CC0 Public Domain",
      licenseUrl: "https://creativecommons.org/publicdomain/zero/1.0/",
      attributionRequirement: "No attribution required",
      dateUsed: publishedDate,
      searchNote: "Search terms: executive car businessperson transport",
      rationale:
        "Selected for executive transport cues that support the productivity and time-value angle of chauffeur service."
    },
    openingShape: "crenca comum sendo desafiada",
    proofPlacement: "apos explicacao do custo escondido de dirigir",
    nuancePlacement: "na secao sobre uso seletivo e modelo hibrido",
    repetitionGuardrail: "nao usar 5 passos como corpo principal"
  },
  {
    slug: "contrato-locacao-checklist-tarifas",
    title: "Contrato de aluguel sem surpresa: checklist de tarifas, cobertura e no-show",
    keyword: "contrato de aluguel de carros checklist",
    family: "Playbook / Checklist",
    variant: "pre-signature-checklist",
    thesis:
      "A maioria dos conflitos em locação nasce de contrato mal lido. Um checklist pré-assinatura reduz retrabalho e custo inesperado.",
    meta:
      "Use este checklist para validar tarifas, cobertura e no-show antes de fechar locação de veículos.",
    marketShift:
      "Com maior profissionalização do setor, transparência contratual virou diferencial real para decisão de locação recorrente.",
    decisionPoints: [
      "Sua equipe fecha locação com frequência e precisa padronizar validação.",
      "Você já teve custo extra por regra contratual não revisada.",
      "Há mais de um condutor usando o mesmo veículo na operação."
    ],
    steps: [
      "Confirme regras de diária, tolerância e hora extra.",
      "Valide políticas de cobertura, coparticipação e limites de terceiros.",
      "Revise taxa de condutor adicional, no-show e serviços especiais.",
      "Documente política de combustível, limpeza e devolução.",
      "Centralize versão vigente do checklist e treine quem aprova contrato."
    ],
    errors: [
      "Assinar sem checar cláusulas de coparticipação.",
      "Ignorar custo de condutor adicional e política de perfil.",
      "Não registrar regra de no-show para time de viagem."
    ],
    faq: [
      {
        q: "Qual cláusula gera mais surpresa?",
        a: "Normalmente coparticipação em sinistro e cobrança por no-show."
      },
      {
        q: "Checklist serve para locação eventual?",
        a: "Sim. Mesmo locação pontual se beneficia de validação mínima padronizada."
      },
      {
        q: "Quem deve aprovar o contrato?",
        a: "Idealmente operação + financeiro, com responsabilidade clara por cada item."
      }
    ],
    cta: "Transforme este checklist em padrão interno e reduza custo inesperado já no próximo contrato.",
    image: "assets/contrato-locacao-checklist-tarifas.jpg",
    alt: "Checklist contratual de locação com itens de tarifa, cobertura e no-show.",
    imageSource: {
      sourceClass: "CC0 / Public Domain support image",
      sourceName: "PxHere",
      sourcePage: "https://pxhere.com/en/photo/1703018",
      licenseType: "CC0 Public Domain",
      licenseUrl: "https://creativecommons.org/publicdomain/zero/1.0/",
      attributionRequirement: "No attribution required",
      dateUsed: publishedDate,
      searchNote: "Search terms: car rental agreement manager keys",
      rationale:
        "Selected because agreement and keys provide direct contract-review signals without relying on generic abstract imagery."
    },
    openingShape: "risco contratual imediato",
    proofPlacement: "checklist de assinatura como nucleo do artigo",
    nuancePlacement: "na divisao entre uso eventual e recorrente",
    repetitionGuardrail: "nao usar plano de implantacao de 30 dias"
  },
  {
    slug: "assistencia-24h-carro-reserva-operacao",
    title: "Assistência 24h e carro reserva: o que realmente protege sua operação",
    keyword: "assistência 24h locação de veículos",
    family: "Teardown Critico",
    variant: "promise-vs-system",
    thesis:
      "Assistência 24h só gera valor quando existe processo claro de acionamento, resposta e substituição. Sem isso, vira promessa de marketing.",
    tldr: [
      "Assistência 24h e carro reserva parecem proteção completa, mas sem fluxo claro viram promessa difícil de executar.",
      "O que protege a operação não é o rótulo do benefício. É a combinação entre SLA, gatilho de acionamento e substituição compatível com a missão.",
      "Cobertura boa não elimina risco; ela reduz impacto quando o processo é auditável e o contrato é operacionalmente coerente."
    ],
    meta:
      "Entenda como avaliar assistência 24h e carro reserva de forma prática para proteger sua operação.",
    openingTitle: "A promessa que parece suficiente no folder",
    openingText:
      "Assistência 24h e carro reserva são apresentados como se resolvessem a operação por si só. Só que o benefício só protege de verdade quando existe fluxo claro de acionamento, responsabilidade definida e regra de substituição coerente com o uso do veículo.",
    marketShift:
      "Empresas passaram a cobrar disponibilidade real, e não apenas preço. Continuidade operacional virou critério principal, e isso expôs uma diferença importante entre benefício de marketing e cobertura que realmente segura a rotina.",
    decisionPointsTitle: "Sintomas de uma cobertura que parece boa, mas não segura a rotina",
    decisionPoints: [
      "Sua operação não pode parar por falha mecânica ou incidente sem gerar perda de agenda, entrega ou atendimento.",
      "Você precisa de tempo de resposta previsível, não só boa vontade de suporte.",
      "Já houve impacto real porque o veículo substituto não veio, veio tarde ou veio incompatível com a missão."
    ],
    pivotTitle: "O mecanismo que quebra",
    implementationTitle: "O que exigir para transformar promessa em sistema",
    steps: [
      "Defina SLA mínimo por tipo de ocorrência, e não uma promessa genérica de disponibilidade.",
      "Estabeleça canal único de acionamento e responsável interno por incidente para não perder tempo no caos.",
      "Padronize critério de carro substituto por categoria de operação e criticidade da missão.",
      "Teste o fluxo de contingência com simulação periódica para descobrir gargalos antes do incidente real.",
      "Monitore tempo médio de resposta, tempo de substituição e impacto real na agenda."
    ],
    errorsTitle: "Falhas que drenam credibilidade e também caixa",
    errors: [
      "Não exigir SLA contratual para atendimento 24h e confiar só na promessa comercial.",
      "Aceitar substituição incompatível com a necessidade real da missão.",
      "Não registrar histórico de incidentes para renegociar cobertura com base em prova."
    ],
    nuanceTitle: "O limite real do serviço",
    nuanceText:
      "Mesmo com contrato bem desenhado, assistência 24h não elimina todo risco. Ela reduz impacto quando existe gatilho claro de acionamento, tempo de resposta monitorado e substituição aderente ao uso da missão. Sem esses três elementos, a cobertura pode existir no papel e falhar justamente quando a operação mais precisa dela.",
    faq: [
      {
        q: "Assistência 24h elimina todo risco?",
        a: "Não elimina risco, mas reduz impacto quando o processo é bem definido e auditado."
      },
      {
        q: "Carro reserva deve ser da mesma categoria?",
        a: "Idealmente equivalente ao perfil da operação crítica para evitar perda de produtividade."
      },
      {
        q: "Como medir se a cobertura funciona?",
        a: "Pelo tempo de resposta, tempo de substituição e impacto real na agenda."
      }
    ],
    cta: "Audite seu fluxo de contingência com três incidentes simulados e ajuste contrato antes do próximo ciclo.",
    image: "assets/assistencia-24h-carro-reserva-operacao.jpg",
    alt: "Equipe de suporte automotivo acionando assistência 24h e carro reserva para operação empresarial.",
    imageSource: {
      sourceClass: "CC0 / Public Domain support image",
      sourceName: "PxHere",
      sourcePage: "https://pxhere.com/en/photo/1701150",
      licenseType: "CC0 Public Domain",
      licenseUrl: "https://creativecommons.org/publicdomain/zero/1.0/",
      attributionRequirement: "No attribution required",
      dateUsed: publishedDate,
      searchNote: "Search terms: maintenance service customer vehicle support",
      rationale:
        "Selected for service and maintenance context that better supports continuity and resolution workflow than accident-heavy imagery."
    },
    openingShape: "promessa de marketing desmontada",
    proofPlacement: "sintomas e mecanismos antes do que exigir",
    nuancePlacement: "na secao de limites do servico",
    repetitionGuardrail: "nao usar FAQ como bloco central"
  },
  {
    slug: "locacao-aeroporto-vs-loja",
    title: "Locação no aeroporto x loja: como decidir o melhor custo total da diária",
    keyword: "aluguel de carro aeroporto Belém",
    family: "Comparison / Decision",
    variant: "mission-scenario",
    thesis:
      "A escolha entre retirada no aeroporto ou na loja deve considerar custo total da missão, não apenas valor da diária.",
    meta:
      "Compare locação no aeroporto e na loja com foco em custo total, tempo e conveniência operacional.",
    marketShift:
      "Com operações mais enxutas, empresas passaram a otimizar deslocamento porta a porta e não apenas tarifa isolada.",
    decisionPoints: [
      "A agenda começa imediatamente após o desembarque.",
      "Seu time viaja com frequência e precisa de processo padronizado.",
      "Existe sensibilidade alta a taxa de serviço versus custo de deslocamento adicional."
    ],
    steps: [
      "Calcule custo total por cenário: diária + taxas + deslocamento + tempo improdutivo.",
      "Defina regra por tipo de viagem: curta crítica, rotina administrativa ou visita comercial.",
      "Padronize escolha no booking interno para evitar decisões ad hoc.",
      "Negocie condição específica para frequência recorrente.",
      "Revise resultado por viagem após 60 dias de operação."
    ],
    errors: [
      "Comparar somente o preço inicial sem incluir taxa e tempo.",
      "Manter uma única regra para todas as viagens.",
      "Não capturar dados pós-viagem para refinar decisão."
    ],
    faq: [
      {
        q: "Aeroporto sempre sai mais caro?",
        a: "Nem sempre. Em viagens críticas, o ganho de tempo pode compensar a taxa adicional."
      },
      {
        q: "Quando a loja tende a ser melhor?",
        a: "Quando há flexibilidade de horário e deslocamento sem impacto na agenda."
      },
      {
        q: "Como padronizar decisão?",
        a: "Com política de viagem baseada em tipo de missão e janela de compromisso."
      }
    ],
    cta: "Implemente um comparativo padrão de custo total por viagem e elimine decisões por achismo.",
    image: "assets/locacao-aeroporto-vs-loja.jpg",
    alt: "Comparação entre retirada de carro no aeroporto e na loja para viagem corporativa.",
    imageSource: {
      sourceClass: "CC0 / Public Domain support image",
      sourceName: "PxHere",
      sourcePage: "https://pxhere.com/en/photo/1017560",
      licenseType: "CC0 Public Domain",
      licenseUrl: "https://creativecommons.org/publicdomain/zero/1.0/",
      attributionRequirement: "No attribution required",
      dateUsed: publishedDate,
      searchNote: "Search terms: airport parking terminal car rental",
      rationale:
        "Selected for direct airport mobility context, which supports the airport-versus-store decision frame."
    },
    openingShape: "decisao por cenario de missao",
    proofPlacement: "casos de uso antes da recomendacao",
    nuancePlacement: "tradeoff taxa vs tempo",
    repetitionGuardrail: "nao repetir criterio de frota propria vs terceirizacao"
  },
  {
    slug: "mercado-locacao-2026-para",
    title: "Crescimento do setor em 2026: o que muda para quem aluga carro no Pará",
    keyword: "mercado de locação de veículos 2026",
    family: "Case Study / Proof Story",
    variant: "market-implication",
    thesis:
      "A expansão do mercado de locação em 2026 aumenta opções e exige mais critério de contratação. Quem compra melhor o serviço reduz risco e ganha eficiência.",
    meta:
      "Veja os impactos do crescimento da locação em 2026 para empresas e clientes que alugam no Pará.",
    marketShift:
      "Dados setoriais mostram crescimento de frota e faturamento, com maior profissionalização e ampliação de modelos de operação.",
    decisionPoints: [
      "Você quer negociar melhor sem perder qualidade de atendimento.",
      "Sua empresa está revisando política de mobilidade para 2026.",
      "Há demanda por mais previsibilidade em operação regional."
    ],
    steps: [
      "Revisite critérios de contratação à luz do novo cenário de oferta.",
      "Priorize parceiros com clareza contratual e suporte comprovável.",
      "Crie scorecard de fornecedor: disponibilidade, SLA, cobertura e experiência.",
      "Integre dados de uso real para ajuste de categoria e quilometragem.",
      "Consolide aprendizados em revisão semestral de contratos."
    ],
    errors: [
      "Achar que crescimento de mercado sozinho melhora serviço.",
      "Trocar fornecedor apenas por preço sem medir execução.",
      "Não atualizar política interna de mobilidade com base em dados."
    ],
    faq: [
      {
        q: "Mais oferta significa contratação mais simples?",
        a: "Só quando a empresa usa critérios claros de avaliação e governança contratual."
      },
      {
        q: "Como negociar melhor em 2026?",
        a: "Com histórico de uso, previsibilidade de demanda e indicadores de operação."
      },
      {
        q: "Qual o principal risco de não revisar contratos?",
        a: "Ficar preso a condições desatualizadas e perder competitividade operacional."
      }
    ],
    cta: "Use 2026 para profissionalizar sua contratação de locação e transformar mobilidade em vantagem operacional.",
    image: "assets/mercado-locacao-2026-para.jpg",
    alt: "Painel com indicadores de crescimento do mercado de locação de veículos em 2026.",
    imageSource: {
      sourceClass: "CC0 / Public Domain support image",
      sourceName: "PxHere",
      sourcePage: "https://pxhere.com/en/photo/1642192",
      licenseType: "CC0 Public Domain",
      licenseUrl: "https://creativecommons.org/publicdomain/zero/1.0/",
      attributionRequirement: "No attribution required",
      dateUsed: publishedDate,
      searchNote: "Search terms: transport hub airport city vehicle market",
      rationale:
        "Selected for transport-hub scale and mobility infrastructure cues that help frame sector growth and market maturity."
    },
    openingShape: "leitura do mercado antes da recomendacao",
    proofPlacement: "mudanca de setor vira historia central",
    nuancePlacement: "na secao sobre limites de crescimento sem governanca",
    repetitionGuardrail: "nao usar checklist operacional"
  },
  {
    slug: "reserva-eficiente-no-show-empresas",
    title: "Reserva eficiente para empresas: como evitar perda por cancelamento e no-show",
    keyword: "no show aluguel de carros",
    family: "Framework Operacional",
    variant: "workflow-design",
    thesis:
      "No-show e cancelamento de última hora são falhas de processo. Com governança simples de reserva, a empresa reduz perda financeira e ruído operacional.",
    meta:
      "Aprenda a criar um processo de reserva corporativa que reduz no-show e custo de cancelamento.",
    marketShift:
      "Com maior controle de custos nas empresas, perdas evitáveis em reservas passaram a ser tratadas como indicador de eficiência operacional.",
    decisionPoints: [
      "Seu time reserva em canais diferentes sem padrão.",
      "Há recorrência de alteração de agenda perto da retirada.",
      "Você quer reduzir desperdício sem criar burocracia excessiva."
    ],
    steps: [
      "Centralize solicitações de reserva em um fluxo único com responsável definido.",
      "Aplique janela mínima de confirmação e política clara de cancelamento.",
      "Inclua checklist pré-viagem com status de voo, agenda e condutor.",
      "Ative lembretes automáticos de retirada para reduzir esquecimento.",
      "Monitore taxa de no-show por área e corrija causa raiz mensalmente."
    ],
    errors: [
      "Não definir dono do processo de reserva.",
      "Permitir reserva sem validação de agenda real.",
      "Tratar no-show como evento isolado e não como indicador."
    ],
    faq: [
      {
        q: "Qual meta razoável de no-show?",
        a: "Depende do volume, mas tendência saudável é reduzir continuamente com processo e visibilidade."
      },
      {
        q: "Lembrete automático realmente funciona?",
        a: "Sim, principalmente quando integrado ao checklist de viagem e confirmação de condutor."
      },
      {
        q: "Como tratar áreas com maior taxa de perda?",
        a: "Com revisão de causa, ajuste de política e treinamento objetivo de operação."
      }
    ],
    cta: "Implemente um fluxo único de reserva em 7 dias e acompanhe a queda de no-show no mês seguinte.",
    image: "assets/reserva-eficiente-no-show-empresas.jpg",
    alt: "Gestor conferindo painel de reservas corporativas para reduzir no-show e cancelamentos.",
    imageSource: {
      sourceClass: "CC0 / Public Domain support image",
      sourceName: "PxHere",
      sourcePage: "https://pxhere.com/en/photo/1132024",
      licenseType: "CC0 Public Domain",
      licenseUrl: "https://creativecommons.org/publicdomain/zero/1.0/",
      attributionRequirement: "No attribution required",
      dateUsed: publishedDate,
      searchNote: "Search terms: booking desk car rental airport front desk",
      rationale:
        "Selected for direct booking and rental-desk context, which reinforces reservation flow and no-show control."
    },
    openingShape: "falha de processo exposta",
    proofPlacement: "fluxo unico como sistema central",
    nuancePlacement: "no equilibrio entre controle e burocracia",
    repetitionGuardrail: "nao listar sete custos ou usar comparacao binaria"
  }
];

function escapeHtml(input) {
  return input
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function blockTitle(title) {
  return `## ${title}`;
}

function bulletList(items) {
  return items.map((item) => `- ${item}`).join("\n");
}

function numberedList(items) {
  return items.map((item, index) => `${index + 1}. ${item}`).join("\n");
}

function faqBlock(faq) {
  return faq.map((item) => `### ${item.q}\n${item.a}`).join("\n\n");
}

function metadataBlock(article) {
  return [
    "## Metadata",
    `- Primary Keyword: ${article.keyword}`,
    `- Structure Family: ${article.family}`,
    `- Structure Variant: ${article.variant}`,
    `- Thesis: ${article.thesis}`,
    `- Published Date: ${publishedDate}`,
    "",
    "## Featured Image",
    `- Asset: ${article.image}`,
    `- Alt: ${article.alt}`,
    "- Format: 16:9",
    `- Source Class: ${article.imageSource.sourceClass}`,
    `- Source Name: ${article.imageSource.sourceName}`,
    `- Source Page: ${article.imageSource.sourcePage}`,
    `- License Type: ${article.imageSource.licenseType}`,
    `- License URL: ${article.imageSource.licenseUrl}`,
    `- Attribution Requirement: ${article.imageSource.attributionRequirement}`,
    `- Date Used: ${article.imageSource.dateUsed}`,
    `- Source Search Note: ${article.imageSource.searchNote}`,
    `- Selection Rationale: ${article.imageSource.rationale}`,
    "",
    "## Family Ledger",
    `- Client: Dallas Rent a Car`,
    `- Run ID: ${runId}`,
    `- Publish Date: ${publishedDate}`,
    `- Topic: ${article.title}`,
    `- Family: ${article.family}`,
    `- Thesis Angle: ${article.thesis}`,
    `- Opening Shape: ${article.openingShape}`,
    `- Proof Placement: ${article.proofPlacement}`,
    `- Nuance Placement: ${article.nuancePlacement}`,
    `- CTA: ${article.cta}`,
    `- Visual Thesis: ${article.alt}`,
    `- Source Notes: ${article.imageSource.sourceName} | ${article.imageSource.licenseType} | ${article.imageSource.searchNote}`,
    `- Repetition Guardrail: ${article.repetitionGuardrail}`
  ].join("\n");
}

function renderComparison(article) {
  return [
    `# ${article.title}`,
    "",
    metadataBlock(article),
    "",
    article.tldr ? [blockTitle("TL;DR"), bulletList(article.tldr)].join("\n") : null,
    "",
    blockTitle(article.openingTitle || "A decisao em uma frase"),
    article.openingText || `${article.thesis}`,
    "",
    blockTitle("A decisao em uma frase"),
    `${article.thesis}`,
    "",
    blockTitle("O que mudou no mercado"),
    article.marketShift,
    "",
    blockTitle(article.decisionPointsTitle || "Quando esse tipo de decisao fica urgente"),
    bulletList(article.decisionPoints),
    "",
    blockTitle(article.criteriaTitle || "Criterios que devem mandar na escolha"),
    bulletList(article.criteria || [
      "custo total da missao",
      "tempo improdutivo escondido",
      "risco operacional se o veiculo falhar",
      "complexidade interna para administrar a escolha"
    ]),
    "",
    blockTitle(article.scenarioTitle || "Como cada cenario responde melhor"),
    article.scenarioBlocks
      ? article.scenarioBlocks.map((block) => [block.title, block.body].join("\n")).join("\n\n")
      : article.variant === "decision-matrix"
        ? [
            "### Frota propria vence quando",
            "A utilizacao e previsivel, a empresa ja tem estrutura madura de gestao e o risco de parada operacional e baixo.",
            "",
            "### Terceirizacao vence quando",
            "A operacao precisa de disponibilidade continua, previsibilidade de caixa e resposta rapida a incidente sem puxar equipe interna.",
            "",
            "### O criterio que desempata",
            "Se a indisponibilidade de um unico carro gera perda de agenda, a conta deixa de ser patrimonial e passa a ser operacional."
          ].join("\n")
      : [
          "### Cenario 1: agenda critica saindo do aeroporto",
          "A retirada no aeroporto tende a ganhar quando tempo de deslocamento vale mais do que a taxa adicional.",
          "",
          "### Cenario 2: viagem administrativa com folga de horario",
          "A loja tende a ganhar quando ha margem para deslocamento externo sem risco para a agenda.",
          "",
          "### Cenario 3: operacao recorrente",
          "O melhor modelo e o que vira politica padrao sem gerar excecao toda semana."
        ].join("\n"),
    "",
    blockTitle(article.implementationTitle || "Metodo de decisao"),
    numberedList(article.steps),
    "",
    blockTitle(article.errorsTitle || "Onde a maioria erra"),
    bulletList(article.errors),
    "",
    blockTitle(article.nuanceTitle || "A nuance que evita decisao ruim"),
    article.nuanceText
      ? article.nuanceText
      : article.variant === "decision-matrix"
      ? "Nem toda empresa deve migrar tudo de uma vez. Em muitos casos, o desenho certo e manter parte da frota em um modelo e testar outra parte em regime terceirizado."
      : "Preco inicial e um numero facil de comparar, mas custo total e um numero mais verdadeiro. A decisao certa quase sempre exige olhar os dois.",
    "",
    blockTitle("FAQ"),
    faqBlock(article.faq),
    "",
    blockTitle("Conclusao"),
    article.cta
  ].filter(Boolean).join("\n");
}

function renderFramework(article) {
  return [
    `# ${article.title}`,
    "",
    metadataBlock(article),
    "",
    blockTitle("O mecanismo por tras do problema"),
    `${article.thesis}`,
    "",
    blockTitle("Leitura de contexto"),
    article.marketShift,
    "",
    article.variant === "cost-system"
      ? [
          blockTitle("Os custos que mais passam despercebidos"),
          bulletList(article.decisionPoints),
          "",
          blockTitle("O sistema de controle em 5 blocos"),
          numberedList(article.steps),
          "",
          blockTitle("Como saber se o modelo esta funcionando"),
          bulletList([
            "menos tempo parado",
            "menos horas internas gastas com excecao",
            "mais previsibilidade no caixa",
            "menos ruído entre operacao e financeiro"
          ])
        ].join("\n")
      : [
          blockTitle("Sinais de que o processo de reserva esta frouxo"),
          bulletList(article.decisionPoints),
          "",
          blockTitle("Desenho do fluxo unico"),
          numberedList(article.steps),
          "",
          blockTitle("Indicadores de controle"),
          bulletList([
            "taxa de no-show por area",
            "tempo medio entre pedido e confirmacao",
            "percentual de reservas alteradas em cima da hora",
            "perda financeira por cancelamento evitavel"
          ])
        ].join("\n"),
    "",
    blockTitle("Falhas de projeto mais comuns"),
    bulletList(article.errors),
    "",
    blockTitle("Onde colocar a camada de nuance"),
    article.variant === "cost-system"
      ? "Migracao integral nem sempre e o primeiro passo certo. Em operacoes heterogeneas, a melhor governanca costuma nascer de ondas menores e criterios claros de priorizacao."
      : "Governanca nao precisa virar burocracia. O erro e padronizar sem considerar contexto de viagem, urgencia e autonomia do time.",
    "",
    blockTitle("FAQ"),
    faqBlock(article.faq),
    "",
    blockTitle("Conclusao"),
    article.cta
  ].join("\n");
}

function renderPlaybook(article) {
  return [
    `# ${article.title}`,
    "",
    metadataBlock(article),
    "",
    blockTitle("Quando usar este playbook"),
    bulletList(article.decisionPoints),
    "",
    blockTitle("Por que isso importa agora"),
    article.marketShift,
    "",
    blockTitle("Checklist antes de executar"),
    bulletList([
      "responsavel definido",
      "janela de horario validada",
      "categoria do veiculo alinhada a missao",
      "politica contratual revisada",
      "plano B registrado"
    ]),
    "",
    blockTitle("Sequencia de execucao"),
    numberedList(article.steps),
    "",
    blockTitle("O que pode quebrar no meio"),
    bulletList(article.errors),
    "",
    blockTitle("Fechamento do ciclo"),
    article.variant === "trip-playbook"
      ? "A viagem so melhora quando o time registra aprendizados apos cada missao. Sem isso, o mesmo atraso reaparece com roupa diferente."
      : "Checklist bom nao e o mais longo. E o que faz quem aprova contrato encontrar risco antes da assinatura, e nao depois do problema.",
    "",
    blockTitle("FAQ"),
    faqBlock(article.faq),
    "",
    blockTitle("Conclusao"),
    article.cta
  ].join("\n");
}

function renderContrarian(article) {
  return [
    `# ${article.title}`,
    "",
    metadataBlock(article),
    "",
    article.tldr ? [blockTitle("TL;DR"), bulletList(article.tldr)].join("\n") : null,
    "",
    blockTitle(article.openingTitle || "A crença comum"),
    article.openingText ||
      "Dirigir por conta propria parece mais economico porque o custo da locacao com motorista aparece na proposta. O custo da agenda perdida quase nunca aparece com a mesma clareza.",
    "",
    blockTitle("Por que essa crença quebra na pratica"),
    article.marketShift,
    "",
    blockTitle(article.decisionPointsTitle || "Sinais de que o modelo atual esta te custando caro"),
    bulletList(article.decisionPoints),
    "",
    blockTitle(article.pivotTitle || "O quadro melhor para decidir"),
    `${article.thesis}`,
    "",
    blockTitle(article.implementationTitle || "Como implantar sem exagero"),
    numberedList(article.steps),
    "",
    blockTitle(article.errorsTitle || "Objeções que parecem fortes, mas nao fecham a conta"),
    bulletList(article.errors),
    "",
    blockTitle(article.nuanceTitle || "A nuance que evita modismo"),
    article.nuanceText ||
      "Locacao com motorista nao precisa virar regra para toda a empresa. O uso inteligente e seletivo, aplicado apenas nas missoes em que tempo, foco e pontualidade valem mais do que a economia nominal.",
    "",
    blockTitle("FAQ"),
    faqBlock(article.faq),
    "",
    blockTitle("Conclusao"),
    article.cta
  ].filter(Boolean).join("\n");
}

function renderTeardown(article) {
  return [
    `# ${article.title}`,
    "",
    metadataBlock(article),
    "",
    article.tldr ? [blockTitle("TL;DR"), bulletList(article.tldr)].join("\n") : null,
    "",
    blockTitle(article.openingTitle || "A promessa que parece boa no folder"),
    article.openingText ||
      "Assistencia 24h e carro reserva sao apresentados como se resolvessem a operacao por si so. O problema e que o servico so protege de verdade quando existe fluxo claro, responsavel definido e regra de substituicao coerente.",
    "",
    blockTitle("Por que o tema ficou mais critico"),
    article.marketShift,
    "",
    blockTitle(article.decisionPointsTitle || "Sintomas de uma cobertura que nao sustenta a operacao"),
    bulletList(article.decisionPoints),
    "",
    blockTitle(article.pivotTitle || "O mecanismo que quebra"),
    `${article.thesis}`,
    "",
    blockTitle(article.implementationTitle || "O que exigir para transformar promessa em sistema"),
    numberedList(article.steps),
    "",
    blockTitle(article.errorsTitle || "Falhas que drenam credibilidade e caixa"),
    bulletList(article.errors),
    "",
    blockTitle(article.nuanceTitle || "Limites reais do servico"),
    article.nuanceText ||
      "Mesmo com bom contrato, assistencia 24h nao elimina todo risco. Ela reduz impacto quando ha gatilho de acionamento, tempo de resposta monitorado e substituicao aderente ao uso da missao.",
    "",
    blockTitle("FAQ"),
    faqBlock(article.faq),
    "",
    blockTitle("Conclusao"),
    article.cta
  ].filter(Boolean).join("\n");
}

function renderCaseStudy(article) {
  return [
    `# ${article.title}`,
    "",
    metadataBlock(article),
    "",
    blockTitle("O que mudou no mercado"),
    article.marketShift,
    "",
    blockTitle("Por que isso importa para quem contrata locacao"),
    `${article.thesis}`,
    "",
    blockTitle("Três leituras praticas para 2026"),
    bulletList(article.decisionPoints),
    "",
    blockTitle("Como responder a esse novo contexto"),
    numberedList(article.steps),
    "",
    blockTitle("Onde compradores ainda erram"),
    bulletList(article.errors),
    "",
    blockTitle("A nuance que separa crescimento de maturidade"),
    "Mais oferta nao significa melhor decisao automatica. Mercados em expansao premiam quem compra com critero e punem quem contrata por impulso.",
    "",
    blockTitle("FAQ"),
    faqBlock(article.faq),
    "",
    blockTitle("Conclusao"),
    article.cta
  ].join("\n");
}

function buildMarkdown(article) {
  switch (article.family) {
    case "Comparison / Decision":
      return renderComparison(article);
    case "Framework Operacional":
      return renderFramework(article);
    case "Playbook / Checklist":
      return renderPlaybook(article);
    case "Contrarian Guide":
      return renderContrarian(article);
    case "Teardown Critico":
      return renderTeardown(article);
    case "Case Study / Proof Story":
      return renderCaseStudy(article);
    default:
      throw new Error(`Unsupported family: ${article.family}`);
  }
}

function markdownToHtml(md) {
  const lines = md.split("\n");
  const html = [];
  let listMode = null;

  const closeList = () => {
    if (listMode === "ul") html.push("</ul>");
    if (listMode === "ol") html.push("</ol>");
    listMode = null;
  };

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) {
      closeList();
      continue;
    }

    if (line.startsWith("# ")) {
      closeList();
      html.push(`<h1>${escapeHtml(line.slice(2))}</h1>`);
      continue;
    }
    if (line.startsWith("## ")) {
      closeList();
      html.push(`<h2>${escapeHtml(line.slice(3))}</h2>`);
      continue;
    }
    if (line.startsWith("### ")) {
      closeList();
      html.push(`<h3>${escapeHtml(line.slice(4))}</h3>`);
      continue;
    }
    if (line.startsWith("- ")) {
      if (listMode !== "ul") {
        closeList();
        html.push("<ul>");
        listMode = "ul";
      }
      html.push(`<li>${escapeHtml(line.slice(2))}</li>`);
      continue;
    }
    if (/^\d+\.\s/.test(line)) {
      if (listMode !== "ol") {
        closeList();
        html.push("<ol>");
        listMode = "ol";
      }
      html.push(`<li>${escapeHtml(line.replace(/^\d+\.\s/, ""))}</li>`);
      continue;
    }

    closeList();
    html.push(`<p>${escapeHtml(line)}</p>`);
  }

  closeList();
  return html.join("\n");
}

function buildBodySource(markdown) {
  const familyLedgerIdx = markdown.indexOf("\n## Family Ledger");
  if (familyLedgerIdx < 0) throw new Error("Could not find family ledger marker");

  const afterLedger = markdown.indexOf("\n## ", familyLedgerIdx + 1);
  if (afterLedger < 0) throw new Error("Could not find body marker after family ledger");

  return markdown.slice(afterLedger + 1).trim();
}

function buildHtml(article, bodyHtml) {
  const jsonLd = JSON.stringify(
    {
      "@context": "https://schema.org",
      "@type": "BlogPosting",
      headline: article.title,
      description: article.meta,
      datePublished: publishedDate,
      dateModified: publishedDate,
      author: { "@type": "Organization", name: "Dallas Rent a Car" },
      publisher: { "@type": "Organization", name: "Dallas Rent a Car" }
      ,
      image: article.image
    },
    null,
    0
  );

  return `<!doctype html>
<html lang="pt-BR">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${escapeHtml(article.title)}</title>
    <meta name="description" content="${escapeHtml(article.meta)}" />
    <style>
      body { margin: 0; font-family: "Inter", "Segoe UI", Roboto, Helvetica, Arial, sans-serif; color: #0f172a; background: #f8fafc; line-height: 1.75; }
      main { max-width: 920px; margin: 0 auto; padding: 40px 20px 72px; }
      h1, h2, h3 { line-height: 1.25; color: #0b1220; }
      h1 { font-size: 2rem; margin: 0 0 14px; }
      h2 { font-size: 1.35rem; margin-top: 34px; }
      h3 { font-size: 1.1rem; margin-top: 24px; }
      p, li { font-size: 1.03rem; }
      ul, ol { padding-left: 22px; }
      .meta { color: #334155; font-size: .95rem; margin-bottom: 20px; }
      figure { margin: 18px 0 28px; }
      figure img { width: 100%; height: auto; border-radius: 14px; border: 1px solid #e2e8f0; }
      figcaption { color: #475569; font-size: .9rem; margin-top: 8px; }
      .nav { margin-top: 34px; }
      .nav a { color: #1d4ed8; text-decoration: none; font-weight: 600; }
      .nav a:hover { text-decoration: underline; }
    </style>
  </head>
  <body>
    <main>
      <div class="meta">Publicado em ${publishedDate} • Palavra-chave principal: ${escapeHtml(article.keyword)} • Família: ${escapeHtml(article.family)}</div>
      <h1>${escapeHtml(article.title)}</h1>
      <figure>
        <img src="${article.image}" alt="${escapeHtml(article.alt)}" />
        <figcaption>${escapeHtml(article.alt)} | Formato 16:9 | Fonte: ${escapeHtml(article.imageSource.sourceName)} (${escapeHtml(article.imageSource.licenseType)})</figcaption>
      </figure>
${bodyHtml}
      <div class="nav"><a href="dallas-rent-a-car-cluster.html">Voltar ao índice de artigos</a></div>
    </main>
    <script type="application/ld+json">${jsonLd}</script>
  </body>
</html>`;
}

function buildImageManifest() {
  return [
    "# Dallas Rent a Car • Image Source Manifest",
    "",
    `Date: ${publishedDate}`,
    `Run ID: ${runId}`,
    "",
    ...articles.flatMap((article, index) => [
      `## ${index + 1}. ${article.title}`,
      `- Slug: ${article.slug}`,
      `- Asset: ${article.image}`,
      `- Source Class: ${article.imageSource.sourceClass}`,
      `- Source Name: ${article.imageSource.sourceName}`,
      `- Source Page: ${article.imageSource.sourcePage}`,
      `- License Type: ${article.imageSource.licenseType}`,
      `- License URL: ${article.imageSource.licenseUrl}`,
      `- Attribution Requirement: ${article.imageSource.attributionRequirement}`,
      `- Date Used: ${article.imageSource.dateUsed}`,
      `- Intended Use: featured image for blog article`,
      `- Source Search Note: ${article.imageSource.searchNote}`,
      `- Selection Rationale: ${article.imageSource.rationale}`,
      ""
    ])
  ].join("\n");
}

function buildIndex() {
  const cards = articles
    .map(
      (article, index) => `
        <article class="card">
          <div class="rank">#${index + 1} • ${escapeHtml(article.family)}</div>
          <h2>${escapeHtml(article.title)}</h2>
          <p>${escapeHtml(article.meta)}</p>
          <a href="${article.slug}.html">Abrir HTML</a>
        </article>`
    )
    .join("\n");

  return `<!doctype html>
<html lang="pt-BR">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Dallas Rent a Car • Cluster de Artigos</title>
    <meta name="description" content="Coleção de 10 artigos gerados para análise editorial da Dallas Rent a Car." />
    <style>
      body { margin: 0; font-family: "Inter", "Segoe UI", Roboto, Helvetica, Arial, sans-serif; background: #f8fafc; color: #0f172a; }
      main { max-width: 1100px; margin: 0 auto; padding: 40px 20px 72px; }
      h1 { margin-bottom: 10px; }
      p.lead { color: #334155; margin-bottom: 24px; }
      .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 16px; }
      .card { background: #fff; border: 1px solid #e2e8f0; border-radius: 14px; padding: 16px; }
      .card h2 { font-size: 1.05rem; margin: 8px 0; line-height: 1.3; }
      .card p { font-size: .95rem; color: #334155; }
      .card a { color: #1d4ed8; text-decoration: none; font-weight: 600; }
      .card a:hover { text-decoration: underline; }
      .rank { font-size: .8rem; color: #475569; font-weight: 700; }
    </style>
  </head>
  <body>
    <main>
      <h1>Cluster de Artigos • Dallas Rent a Car</h1>
      <p class="lead">Pacote com 10 artigos e HTMLs para análise editorial da Dallas Rent a Car, agora com arcos distintos por família estrutural e ledger anti-repetição.</p>
      <section class="grid">
${cards}
      </section>
    </main>
  </body>
</html>`;
}

fs.mkdirSync(baseDir, { recursive: true });

for (const article of articles) {
  const markdown = buildMarkdown(article);
  const bodySource = buildBodySource(markdown);
  const html = buildHtml(article, markdownToHtml(bodySource));
  fs.writeFileSync(path.join(baseDir, `${article.slug}.md`), markdown, "utf8");
  fs.writeFileSync(path.join(baseDir, `${article.slug}.html`), html, "utf8");
}

fs.writeFileSync(path.join(baseDir, "dallas-rent-a-car-cluster.html"), buildIndex(), "utf8");
fs.writeFileSync(path.join(baseDir, "image-source-manifest.md"), buildImageManifest(), "utf8");

console.log(`Generated ${articles.length} markdown files, ${articles.length} html files and index in ${baseDir}`);
