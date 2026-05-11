import os
import glob
import re

dir_path = "/home/edsonrmjunior/Local Sites/omniagent/squads/social-growth/output/amiclube/social/previews/"
log_file = os.path.join(dir_path, "normalizacao-log.txt")
arquivos = glob.glob(os.path.join(dir_path, "*.html"))

for arquivo in arquivos:
    if "normalizacao-log.txt" in arquivo: continue
    try:
        with open(arquivo, 'r', encoding='utf-8') as f:
            conteudo = f.read()
        
        # Extrair conteúdo principal entre body (tentativa simples)
        match = re.search(r'<body[^>]*>(.*?)</body>', conteudo, re.DOTALL)
        inner_html = match.group(1) if match else conteudo
        
        novo_conteudo = f"""<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <style>
        body {{ margin: 0; padding: 0; background-color: #121212; display: flex; justify-content: center; align-items: center; min-height: 100vh; }}
        .viewer-wrapper {{ width: 360px; background-color: #ffffff; padding: 20px; box-sizing: border-box; overflow: hidden; position: relative; font-family: sans-serif; }}
    </style>
</head>
<body>
    <div class="viewer-wrapper">
        {inner_html}
    </div>
</body>
</html>
"""
        with open(arquivo, 'w', encoding='utf-8') as f:
            f.write(novo_conteudo)
            
    except Exception as e:
        with open(log_file, "a") as log:
            log.write(f"Erro no arquivo {arquivo}: {str(e)}\n")
