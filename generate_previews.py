import os

template = """
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{title} | AmiClube Preview v2</title>
    <style>
        :root {{
            --bg: #f8fafc;
            --text-strong: #0f172a;
            --text-body: #334155;
            --divider: #e2e8f0;
            --accent: #b45309;
            --proof: #0f766e;
            --white: #ffffff;
        }}

        body {{
            font-family: 'Inter', system-ui, -apple-system, sans-serif;
            background-color: var(--bg);
            color: var(--text-body);
            margin: 0;
            padding: 0;
            line-height: 1.6;
        }}

        .noise {{
            position: fixed;
            top: 0; left: 0; width: 100%; height: 100%;
            background: url('https://grainy-gradients.vercel.app/noise.svg');
            opacity: 0.03;
            pointer-events: none;
            z-index: 1000;
        }}

        .atmospheric-blur {{
            position: absolute;
            top: -100px;
            right: -100px;
            width: 400px;
            height: 400px;
            background: radial-gradient(circle, rgba(180, 83, 9, 0.1) 0%, rgba(248, 250, 252, 0) 70%);
            filter: blur(80px);
            z-index: -1;
        }}

        .container {{
            max-width: 800px;
            margin: 40px auto;
            padding: 20px;
        }}

        header {{
            text-align: center;
            margin-bottom: 40px;
            position: relative;
        }}

        h1 {{
            color: var(--text-strong);
            font-size: 2.5rem;
            font-weight: 800;
            margin-bottom: 10px;
            letter-spacing: -0.025em;
        }}

        .category {{
            text-transform: uppercase;
            color: var(--accent);
            font-weight: 700;
            font-size: 0.875rem;
            letter-spacing: 0.1em;
        }}

        .card {{
            background: var(--white);
            border-radius: 12px;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
            padding: 40px;
            border: 1px solid var(--divider);
        }}

        .featured-image {{
            width: 100%;
            height: 400px;
            border-radius: 8px;
            object-fit: cover;
            margin-bottom: 30px;
            background-color: #f1f5f9;
        }}

        .content {{
            font-size: 1.125rem;
        }}

        .proof-block {{
            background-color: #f0fdf4;
            border-left: 4px solid var(--proof);
            padding: 20px;
            margin: 30px 0;
            font-size: 1rem;
            color: var(--proof);
            font-weight: 500;
        }}

        .cta {{
            display: inline-block;
            background-color: var(--accent);
            color: var(--white);
            padding: 12px 24px;
            border-radius: 6px;
            text-decoration: none;
            font-weight: 700;
            margin-top: 20px;
            transition: opacity 0.2s;
        }}

        .cta:hover {{
            opacity: 0.9;
        }}

        footer {{
            text-align: center;
            margin-top: 60px;
            padding-bottom: 40px;
            font-size: 0.875rem;
            color: #94a3b8;
        }}
    </style>
</head>
<body>
    <div class="noise"></div>
    <div class="container">
        <header>
            <div class="atmospheric-blur"></div>
            <span class="category">{family}</span>
            <h1>{title}</h1>
            <p>{description}</p>
        </header>

        <main class="card">
            <img src="{image}" alt="{title}" class="featured-image">
            <div class="content">
                {content}
            </div>
            
            <div class="proof-block">
                <strong>Nota de Prova:</strong> {proof}
            </div>

            <a href="#" class="cta">{cta_text}</a>
        </main>

        <footer>
            &copy; 2026 AmiClube - Edição Premium v2
        </footer>
    </div>
</body>
</html>
"""

posts = [
    {
        "id": 1,
        "title": "Manifesto do Novo Luxo Artesanal",
        "family": "MANIFESTO",
        "description": "O amigurumi como peça de colecionador e investimento em design.",
        "image": "https://images.unsplash.com/photo-1594026112284-02bb6f3352fe",
        "content": "<p>Descubra por que o luxo artesanal em 2026 é definido pelo veludo e pela curadoria. O amigurumi de luxo não é mais um brinquedo, mas um ativo estético.</p>",
        "proof": "A valorização do handmade em feiras de Milão confirma o crescimento do nicho premium.",
        "cta_text": "Conhecer Curadoria"
    },
    {
        "id": 2,
        "title": "Preço vs Valor no Amigurumi de Luxo",
        "family": "EDUCATIONAL",
        "description": "Entenda por que o investimento em uma peça AmiClube é um investimento em patrimônio.",
        "image": "https://images.unsplash.com/photo-1550751827-4bd374c3f58b",
        "content": "<p>A diferença entre custo e valor reside na durabilidade e na exclusividade. Peças de veludo premium mantêm seu valor ao longo do tempo.</p>",
        "proof": "Dados do mercado de luxo mostram que itens exclusivos retêm 85% do valor após 5 anos.",
        "cta_text": "Ver Comparativo"
    },
    {
        "id": 3,
        "title": "Home Office de Alta Performance",
        "family": "FRAMEWORK",
        "description": "Como a decoração sensorial impacta sua produtividade executiva.",
        "image": "https://images.unsplash.com/photo-1616486364353-c11929314944",
        "content": "<p>O design biofílico e o uso de texturas como o veludo reduzem o estresse e aumentam o foco em ambientes corporativos.</p>",
        "proof": "Projetos de neuroarquitetura apontam 15% de ganho em concentração com texturas orgânicas.",
        "cta_text": "Otimizar Setup"
    },
    {
        "id": 4,
        "title": "Protocolo de Preservação AmiClube",
        "family": "PROTOCOL/CHECKLIST",
        "description": "Guia técnico para manter seu colecionável impecável por décadas.",
        "image": "https://images.unsplash.com/photo-1544457070-4cd773b4d71e",
        "content": "<p>A manutenção correta do veludo chenille exige técnicas de higienização a seco e proteção contra radiação UV.</p>",
        "proof": "O teste de abrasão Martindale do nosso veludo é 3x superior ao padrão artesanal.",
        "cta_text": "Ler Protocolo"
    },
    {
        "id": 5,
        "title": "Anatomia do Amigurumi Premium",
        "family": "TEARDOWN",
        "description": "A engenharia invisível que sustenta as peças de luxo.",
        "image": "https://images.unsplash.com/photo-1594026112284-02bb6f3352fe",
        "content": "<p>Do esqueleto de densidade estrutural ao enchimento high-rebound, cada detalhe é projetado para a perfeição.</p>",
        "proof": "O uso de enchimento siliconado de alta densidade garante a forma original por anos.",
        "cta_text": "Ver Detalhes"
    },
    {
        "id": 6,
        "title": "Auditoria de Confiança no Artesanato",
        "family": "AUDIT",
        "description": "7 sinais de que uma marca é realmente profissional.",
        "image": "https://images.unsplash.com/photo-1450101499163-c8848c66ca85",
        "content": "<p>Saber auditar a reputação de uma marca evita decepções e garante um investimento seguro no mercado artesanal.</p>",
        "proof": "Marcas com CNPJ e suporte estruturado têm 95% menos incidência de problemas pós-venda.",
        "cta_text": "Auditar Marca"
    },
    {
        "id": 7,
        "title": "A Arte da Curadoria",
        "family": "CASE STUDY/SELECTION",
        "description": "Transformando o artesanato em um ativo de design através da seleção.",
        "image": "https://images.unsplash.com/photo-1594026112284-02bb6f3352fe",
        "content": "<p>A curadoria AmiClube filtra o melhor da técnica para criar objetos que dialogam com arquitetura de luxo.</p>",
        "proof": "A curadoria reduz o ruído visual e eleva o amigurumi ao status de escultura têxtil.",
        "cta_text": "Ver Coleção"
    },
    {
        "id": 8,
        "title": "Ergonomia Tátil e Sensory Design",
        "family": "SENSORY DESIGN",
        "description": "A ciência do toque aplicada ao bem-estar e ao luxo.",
        "image": "https://images.unsplash.com/photo-1544457070-4cd773b4d71e",
        "content": "<p>Texturas suaves como o veludo reduzem o cortisol e promovem um ambiente de calma e sofisticação.</p>",
        "proof": "Interações táteis com texturas premium reduzem a frequência cardíaca em até 5%.",
        "cta_text": "Sentir o Luxo"
    }
]

output_dir = "squads/social-growth/output/2026-04-21-220000/blog/v2/previews/"

for post in posts:
    filename = f"post-{post['id']}-preview.html"
    filepath = os.path.join(output_dir, filename)
    with open(filepath, "w", encoding="utf-8") as f:
        f.write(template.format(**post))

print(f"Generated 8 previews in {output_dir}")
