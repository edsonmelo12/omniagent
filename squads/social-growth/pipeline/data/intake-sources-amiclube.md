# Intake Sources - Amiclube

## Links
- https://amiclube.com.br (Site Principal)
- https://www.instagram.com/amiclube (Instagram)
- https://www.facebook.com/amiclubeoficial (Facebook)
- https://www.youtube.com/channel/UC0WmYQqgmgnNXyof3fqQ0ww/ (YouTube)

## Documents
- Baseline de monitoramento (Abril 2026)
- Credential sets em uso

## Notes
- **Foco:** Coleta de baseline para comparação antes/depois da campanha social AC-30-10/11/35
- **Scope:** Instagram, Facebook, GA4 (site amiclube.com.br)
- **Objetivo:**、医疗metricas de presença digital para medir impacto dos posts generated

## Analytical Setup
- Meta Graph API v25.0 com Instagram Business ID: 17841444481115973
- Facebook Page ID: 106701834627196
- GA4 Property ID: 302524520
- Service account: backend/.secrets/ga4-amiclube.json

## Execution
A coleta deve usar Otiniel Observa ou chamadas diretas às APIs, mas sempre passando pelo pipeline do squad (via researcher agent → step-00-social-intelligence)