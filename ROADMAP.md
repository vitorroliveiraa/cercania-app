# Roadmap — MVP até 29/09/2026

Checklist derivado de `mimesis-brain\nearby\docs\plano-tecnico-mvp.md` (seção 5). Marcar aqui conforme avança; ao fechar cada fase, registrar o que mudou de fato em `mimesis-brain\nearby\docs\decisoes.md`.

## Fase 0 — Setup
- [x] Next.js (App Router) + TypeScript + Tailwind inicializado
- [x] Prisma configurado (schema com todos os modelos da seção 4 do plano técnico, client gerado, driver adapter `@prisma/adapter-pg`) — falta só apontar `DATABASE_URL` para um projeto Neon real
- [x] Repositório no GitHub (`git@github.com:vitorroliveiraa/nearby-app.git`, branch `master`)
- [x] Deploy inicial no Vercel funcionando (app vazio, mas publicado) — https://nearby-app-vert.vercel.app, `DATABASE_URL` do Neon configurado em Production e Preview, migração `init` aplicada no banco

## Fase 1 — Motor de dados (maior risco técnico — priorizar) ✅ FECHADA
- [x] Apify testado contra site real com anti-bot e contra anúncio individual real (mybroker.com.br, imobiliária que o Vitor vai atuar em João Pessoa) — `src/lib/scraping/apify.ts`, `APIFY_TOKEN` configurado (local + Vercel Prod/Preview). Achado corrigido: `crawlerType: adaptive` aplicava a própria transformação "readability" do Apify antes de retornar o HTML, cortando endereço/área/fotos em sites client-rendered (React/SPA) — corrigido com `htmlTransformer: "none"`
- [x] Plano B (Playwright direto) testado — `scripts/scrape-playwright.ts` funciona (validado contra Wikipedia), mas **VivaReal bloqueou via Cloudflare** e Imovelweb retornou vazio — confirma o risco de anti-bot já mapeado; Apify é ainda mais necessário como plano A
- [x] Limpeza de HTML antes do Claude — `src/lib/scraping/limpar-html.ts` (cheerio), pedido pelo Vitor por custo. 91% de redução validada (Wikipedia). Fotos extraídas deterministicamente (não pelo LLM)
- [x] Extração de dados estruturados do imóvel via Claude — `src/lib/extracao/imovel.ts` (tool use + Zod), migrado pra **Haiku 4.5** (custo; Sonnet reservado pra Fase 2/argumentos de venda). `ANTHROPIC_API_KEY` configurado (local + Vercel)
- [x] Geocoding via Nominatim funcionando — testado com endereço real de João Pessoa, resultado correto
- [x] Validar cobertura do Nominatim/Overpass nas regiões-alvo — testado João Pessoa (Bairro dos Estados) e Recife (Boa Viagem): hospital/mercado/escola/praia cobertos. Achado técnico: praia é mapeada como `way`, não `node` — Overpass precisa de `nwr` (node/way/relation) + `out center`, não só `node[...]` (relevante pra Fase 2)

**Pipeline testado ponta a ponta com sucesso contra anúncio real**: https://www.mybroker.com.br/apartamento/pb/joao-pessoa/ponta-do-seixas/352176 — endereço, área (69m²), quartos (2), vagas (1), preço (R$ 1.067.668,66) e 20 fotos reais extraídos corretamente, geocoding certo (Ponta do Seixas, João Pessoa). `POST /api/imoveis` protegida por senha simples via header `x-ferramenta-interna-senha` + `FERRAMENTA_INTERNA_SENHA`, todas as 4 credenciais configuradas em Production/Preview e deployado.

## Fase 2 — POIs e argumentos
- [ ] Busca de POIs via Overpass API (categorias: praia, mercado, escola, hospital, farmácia, restaurante — confirmar com Wagner)
- [ ] Cálculo de distância e tempo estimado
- [ ] Geração dos argumentos de venda via Claude a partir dos POIs

## Fase 3 — Dossiê público e embed
- [ ] Página pública `/imovel/[slug]` (responsiva, com mapa)
- [ ] Snippet de embed (iframe) copiável

## Fase 4 — Landing e captura de leads + schema de billing
- [ ] Landing page de vendas
- [ ] Formulário de captura de leads (nome, telefone, email) salvando no Postgres
- [ ] Migrações das tabelas futuras de billing/multi-tenant (`accounts`, `users`, `plans`, `subscriptions`) — schema pronto, sem lógica

## Fase 5 — Curadoria e ensaio
- [ ] 5-10 imóveis reais pré-testados como rede de segurança
- [ ] Fluxo de ponta a ponta testado várias vezes
- [ ] Apresentado ao Wagner pelo menos uma vez antes do dia 29

## Fase 6 — Buffer, polimento e ensaio final
- [ ] Ajustes visuais
- [ ] Ensaio final da apresentação

## 29/09 — Apresentação
- [ ] 🎯
